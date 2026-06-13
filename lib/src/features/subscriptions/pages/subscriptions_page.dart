import 'dart:io';

import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/orders/data/orders_api_service.dart';
import 'package:cleanapp/src/features/subscriptions/data/subscriptions_api_service.dart';
import 'package:cleanapp/src/features/subscriptions/pages/subscription_detail_page.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

/// Subscription packs: shows the customer's existing subscriptions and a
/// request form (property type, tier, size, rooms, days/week, address).
/// Pricing/schedule are confirmed by the admin afterwards.
class SubscriptionsPage extends StatefulWidget {
  const SubscriptionsPage({super.key});

  @override
  State<SubscriptionsPage> createState() => _SubscriptionsPageState();
}

class _SubscriptionsPageState extends State<SubscriptionsPage> {
  List<AppPropertyType> _propertyTypes = const [];
  List<AppServiceTier> _tiers = const [];
  List<AppSubscription> _mine = const [];
  bool _isLoading = true;
  String? _error;
  bool _isSubmitting = false;

  String? _propertyTypeId;
  String? _tierId;
  int _daysPerWeek = 2;
  final _surfaceController = TextEditingController();
  final _roomsController = TextEditingController();
  final _addressController = TextEditingController();
  final List<String> _photos = [];

  static const Map<String, Color> _statusColors = {
    'PENDING': Color(0xFFF59E0B),
    'DAYS_PROPOSED': Color(0xFF3B82F6),
    'CONFIRMED': Color(0xFF3B82F6),
    'ACTIVE': Color(0xFF10B981),
    'COMPLETED': Color(0xFF64748B),
    'CANCELLED': Color(0xFFEF4444),
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _surfaceController.dispose();
    _roomsController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final api = locator<SubscriptionsApiService>();
      final results = await Future.wait([
        api.getPropertyTypes(),
        api.getServiceTiers(),
        api.getMySubscriptions(),
      ]);
      if (!mounted) return;
      setState(() {
        _propertyTypes = results[0] as List<AppPropertyType>;
        _tiers = results[1] as List<AppServiceTier>;
        _mine = results[2] as List<AppSubscription>;
        _propertyTypeId ??=
            _propertyTypes.isNotEmpty ? _propertyTypes.first.id : null;
        _tierId ??= _tiers.isNotEmpty ? _tiers.first.id : null;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _pickPhoto() async {
    final l10n = AppLocalizations.of(context)!;
    if (_photos.length >= 3) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(l10n.maxThreePhotos),
        backgroundColor: ColorApp.primary,
      ));
      return;
    }
    try {
      final image = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        imageQuality: 70,
        maxWidth: 1280,
      );
      if (image != null && mounted) {
        setState(() => _photos.add(image.path));
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('${l10n.failedPickImage}: $e'),
        backgroundColor: Colors.red,
      ));
    }
  }

  /// Uploads picked photos and returns their server paths for `pictures`.
  Future<List<String>> _uploadPhotos() async {
    final api = locator<OrdersApiService>();
    final urls = <String>[];
    for (final path in _photos) {
      try {
        urls.add(await api.uploadImage(path));
      } catch (_) {
        // Skip failed uploads rather than failing the whole request.
      }
    }
    return urls;
  }

  Future<void> _submit() async {
    if (_isSubmitting) return;
    final l10n = AppLocalizations.of(context)!;
    final surface = double.tryParse(_surfaceController.text.trim());
    final rooms = int.tryParse(_roomsController.text.trim());
    final address = _addressController.text.trim();

    String? problem;
    if (_propertyTypeId == null) problem = l10n.choosePropertyType;
    if (_tierId == null) problem ??= l10n.chooseServiceTier;
    if (surface == null || surface <= 0) {
      problem ??= l10n.enterSurface;
    }
    if (rooms == null || rooms <= 0) {
      problem ??= l10n.enterRooms;
    }
    if (address.isEmpty) problem ??= l10n.enterAddress;
    if (problem != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(problem),
        backgroundColor: const Color(0xFFDC2626),
      ));
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final pictures = await _uploadPhotos();
      await locator<SubscriptionsApiService>().createSubscription(
        propertyTypeId: _propertyTypeId!,
        surfaceM2: surface!,
        roomsToClean: rooms!,
        serviceTierId: _tierId!,
        daysPerWeek: _daysPerWeek,
        address: address,
        pictures: pictures,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(l10n.requestSent),
        backgroundColor: ColorApp.primary,
      ));
      _surfaceController.clear();
      _roomsController.clear();
      _addressController.clear();
      _photos.clear();
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(e.toString().replaceFirst('Exception: ', '')),
        backgroundColor: const Color(0xFFDC2626),
      ));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeCode = Localizations.localeOf(context).languageCode;
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(l10n.subscriptionPacks),
        backgroundColor: ColorApp.primary,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: ColorApp.primary))
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                              color: ColorApp.textGrey,
                              fontWeight: FontWeight.w600)),
                      const SizedBox(height: 12),
                      TextButton(
                          onPressed: _load, child: Text(l10n.retry)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  color: ColorApp.primary,
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(20),
                    children: [
                      if (_mine.isNotEmpty) ...[
                        _sectionTitle(l10n.mySubscriptions),
                        const SizedBox(height: 12),
                        ..._mine.map(_subscriptionCard),
                        const SizedBox(height: 24),
                      ],
                      _sectionTitle(l10n.requestSubscriptionTitle),
                      const SizedBox(height: 12),
                      _card(
                        children: [
                          _fieldLabel(l10n.propertyType),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: _propertyTypes
                                .map((p) => _chip(
                                      label: p.nameFor(localeCode),
                                      selected: _propertyTypeId == p.id,
                                      onTap: () => setState(
                                          () => _propertyTypeId = p.id),
                                    ))
                                .toList(),
                          ),
                          const SizedBox(height: 20),
                          _fieldLabel(l10n.serviceTier),
                          const SizedBox(height: 8),
                          ..._tiers.map((t) => _tierCard(t, localeCode)),
                          const SizedBox(height: 20),
                          _fieldLabel(l10n.daysPerWeek),
                          const SizedBox(height: 8),
                          Row(
                            children: List.generate(7, (i) {
                              final day = i + 1;
                              final selected = _daysPerWeek == day;
                              return Expanded(
                                child: GestureDetector(
                                  onTap: () =>
                                      setState(() => _daysPerWeek = day),
                                  child: Container(
                                    height: 44,
                                    margin: EdgeInsets.only(
                                        right: i == 6 ? 0 : 6),
                                    decoration: BoxDecoration(
                                      color: selected
                                          ? ColorApp.primary
                                          : Colors.white,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                          color: selected
                                              ? Colors.transparent
                                              : ColorApp.greyBorder),
                                    ),
                                    child: Center(
                                      child: Text(
                                        '$day',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w900,
                                          color: selected
                                              ? Colors.white
                                              : ColorApp.textBlack,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: _numberField(
                                    l10n.surfaceM2, _surfaceController),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child:
                                    _numberField(l10n.rooms, _roomsController),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          _fieldLabel(l10n.address),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _addressController,
                            minLines: 1,
                            maxLines: 3,
                            decoration:
                                _inputDecoration(l10n.enterFullAddress),
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 14),
                          ),
                          const SizedBox(height: 16),
                          _fieldLabel(l10n.homePhotosOptional),
                          const SizedBox(height: 8),
                          _photoRow(),
                          const SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed: _isSubmitting ? null : _submit,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: ColorApp.primary,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(18)),
                              ),
                              child: _isSubmitting
                                  ? const SizedBox(
                                      width: 22,
                                      height: 22,
                                      child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2.5),
                                    )
                                  : Text(l10n.requestSubscriptionButton,
                                      style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w900)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
    );
  }

  Widget _subscriptionCard(AppSubscription sub) {
    final l10n = AppLocalizations.of(context)!;
    final localeCode = Localizations.localeOf(context).languageCode;
    final color = _statusColors[sub.status] ?? ColorApp.textGrey;
    final tierName = sub.tierNameFor(localeCode);
    final propertyName = sub.propertyTypeNameFor(localeCode);
    return GestureDetector(
      onTap: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => SubscriptionDetailPage(subscriptionId: sub.id),
          ),
        );
        if (mounted) _load();
      },
      child: Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tierName.isEmpty ? l10n.subscription : tierName,
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: ColorApp.textBlack),
                ),
                const SizedBox(height: 4),
                Text(
                  '$propertyName · ${sub.daysPerWeek} ${l10n.perWeek.toLowerCase()}'
                  '${sub.monthlyPrice > 0 ? ' · ${l10n.priceMonth(sub.monthlyPrice.toStringAsFixed(0))}' : ''}'
                  '${sub.sessionsCount > 0 ? ' · ${sub.sessionsCount} ${l10n.sessions.toLowerCase()}' : ''}',
                  style: const TextStyle(
                      fontSize: 12,
                      color: ColorApp.textGrey,
                      fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              sub.status.replaceAll('_', ' '),
              style: TextStyle(
                  color: color, fontWeight: FontWeight.w900, fontSize: 11),
            ),
          ),
        ],
      ),
      ),
    );
  }

  Widget _tierCard(AppServiceTier tier, String localeCode) {
    final selected = _tierId == tier.id;
    return GestureDetector(
      onTap: () => setState(() => _tierId = tier.id),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected
              ? ColorApp.primary.withValues(alpha: 0.08)
              : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
              color: selected ? ColorApp.primary : ColorApp.greyBorder,
              width: 1.5),
        ),
        child: Row(
          children: [
            Icon(
              selected
                  ? Icons.radio_button_checked_rounded
                  : Icons.radio_button_off_rounded,
              color: selected ? ColorApp.primary : ColorApp.textGrey,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tier.nameFor(localeCode),
                    style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 15,
                        color: ColorApp.textBlack),
                  ),
                  Text(
                    '${tier.workers} ${AppLocalizations.of(context)!.professionals.toLowerCase()} · ${tier.durationHours}h'
                    '${tier.description.isNotEmpty ? ' — ${tier.description}' : ''}',
                    style: const TextStyle(
                        fontSize: 12,
                        color: ColorApp.textGrey,
                        fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _chip(
      {required String label,
      required bool selected,
      required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? ColorApp.primary : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
              color: selected ? Colors.transparent : ColorApp.greyBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 13,
            color: selected ? Colors.white : ColorApp.textBlack,
          ),
        ),
      ),
    );
  }

  Widget _photoRow() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          ..._photos.asMap().entries.map((entry) => Stack(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    margin: const EdgeInsets.only(right: 10),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      image: DecorationImage(
                        image: FileImage(File(entry.value)),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  Positioned(
                    top: 4,
                    right: 14,
                    child: GestureDetector(
                      onTap: () =>
                          setState(() => _photos.removeAt(entry.key)),
                      child: Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: Colors.black54,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close_rounded,
                            size: 14, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              )),
          if (_photos.length < 3)
            GestureDetector(
              onTap: _pickPhoto,
              child: Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: ColorApp.softGrey,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: ColorApp.greyBorder),
                ),
                child: const Icon(Icons.add_a_photo_rounded,
                    color: ColorApp.textGrey, size: 24),
              ),
            ),
        ],
      ),
    );
  }

  Widget _numberField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _fieldLabel(label),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: _inputDecoration('0'),
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
        ),
      ],
    );
  }

  InputDecoration _inputDecoration(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(
            color: Colors.grey.shade400,
            fontSize: 13,
            fontWeight: FontWeight.w500),
        filled: true,
        fillColor: ColorApp.softGrey,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      );

  Widget _fieldLabel(String text) => Text(
        text,
        style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: ColorApp.textGrey),
      );

  Widget _sectionTitle(String text) => Text(
        text,
        style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: ColorApp.textBlack),
      );

  Widget _card({required List<Widget> children}) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: children,
        ),
      );
}
