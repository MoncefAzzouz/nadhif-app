import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/shadows.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/subscriptions/data/subscriptions_api_service.dart';
import 'package:flutter/material.dart';

/// Subscription request screen styled like the service Booking Details page:
/// gradient header card, section headers, selectable tier buttons with a
/// config metrics box, days-per-week row, and a rounded bottom action bar.
class SubscriptionBookingPage extends StatefulWidget {
  const SubscriptionBookingPage({
    super.key,
    required this.serviceName,
    this.propertyTypeName,
    this.serviceImage,
  });

  final String serviceName;

  /// Choice made on the property selection page (Apartment/House/Villa/...).
  final String? propertyTypeName;
  final String? serviceImage;

  @override
  State<SubscriptionBookingPage> createState() =>
      _SubscriptionBookingPageState();
}

class _SubscriptionBookingPageState extends State<SubscriptionBookingPage> {
  List<AppServiceTier> _tiers = const [];
  List<AppPropertyType> _propertyTypes = const [];
  AppPropertyType? _propertyType;
  AppServiceTier? _tier;
  int _daysPerWeek = 2;
  bool _isLoading = true;
  String? _error;
  bool _isSubmitting = false;

  final _surfaceController = TextEditingController();
  final _roomsController = TextEditingController();
  final _addressController = TextEditingController();

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
      final results =
          await Future.wait([api.getServiceTiers(), api.getPropertyTypes()]);
      if (!mounted) return;
      setState(() {
        _tiers = results[0] as List<AppServiceTier>;
        _propertyTypes = results[1] as List<AppPropertyType>;
        _tier ??= _tiers.isNotEmpty ? _tiers.first : null;
        _propertyType ??= _matchPropertyType();
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

  /// Maps the property chosen on the selection page (e.g. "Villa") to the
  /// admin-defined property types; falls back to the first one.
  AppPropertyType? _matchPropertyType() {
    if (_propertyTypes.isEmpty) return null;
    final wanted = widget.propertyTypeName?.trim().toLowerCase();
    if (wanted != null && wanted.isNotEmpty) {
      for (final p in _propertyTypes) {
        final name = (p.raw['name'] as String? ?? '').toLowerCase();
        if (name == wanted || name.contains(wanted) || wanted.contains(name)) {
          return p;
        }
      }
    }
    return _propertyTypes.first;
  }

  Future<void> _submit() async {
    if (_isSubmitting) return;
    final surface = double.tryParse(_surfaceController.text.trim());
    final rooms = int.tryParse(_roomsController.text.trim());
    final address = _addressController.text.trim();

    String? problem;
    if (_tier == null) problem = 'Please choose a pack';
    if (_propertyType == null) problem ??= 'Property type unavailable';
    if (surface == null || surface <= 0) {
      problem ??= 'Please enter your surface (m²)';
    }
    if (rooms == null || rooms <= 0) {
      problem ??= 'Please enter the number of rooms';
    }
    if (address.isEmpty) problem ??= 'Please enter your address';
    if (problem != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(problem),
        backgroundColor: const Color(0xFFDC2626),
      ));
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await locator<SubscriptionsApiService>().createSubscription(
        propertyTypeId: _propertyType!.id,
        surfaceM2: surface!,
        roomsToClean: rooms!,
        serviceTierId: _tier!.id,
        daysPerWeek: _daysPerWeek,
        address: address,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text(
            'Subscription requested! Our team will contact you with the monthly price.'),
        backgroundColor: ColorApp.primary,
      ));
      Navigator.popUntil(context, (route) => route.isFirst);
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
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          SafeArea(
            child: Column(
              children: [
                _buildAppBar(context, l10n),
                Expanded(
                  child: _isLoading
                      ? const Center(
                          child: CircularProgressIndicator(
                              color: ColorApp.primary))
                      : _error != null
                          ? _buildError()
                          : SingleChildScrollView(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 24),
                              physics: const BouncingScrollPhysics(),
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  _buildHeaderInfo(l10n),
                                  const SizedBox(height: 16),
                                  _SectionHeader(
                                    title: 'Pack',
                                    trailing: _tier
                                            ?.nameFor(localeCode)
                                            .toUpperCase() ??
                                        '',
                                  ),
                                  ..._tiers.map(
                                      (t) => _tierButton(t, localeCode)),
                                  if (_tier != null) ...[
                                    const SizedBox(height: 12),
                                    _buildTierMetrics(l10n),
                                  ],
                                  const SizedBox(height: 16),
                                  _SectionHeader(
                                      title: 'Days per week',
                                      trailing: '$_daysPerWeek'),
                                  _buildDaysRow(),
                                  const SizedBox(height: 16),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: _buildField(
                                            'Surface (m²)',
                                            _surfaceController,
                                            isNumber: true),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: _buildField(
                                            'Rooms', _roomsController,
                                            isNumber: true),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  _buildField(
                                      'Address', _addressController,
                                      hint:
                                          'Enter your full address...'),
                                  const SizedBox(height: 140),
                                ],
                              ),
                            ),
                ),
              ],
            ),
          ),
          if (!_isLoading && _error == null) _buildBottomAction(),
        ],
      ),
    );
  }

  Widget _buildError() => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_error!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: ColorApp.textGrey, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            TextButton(onPressed: _load, child: const Text('Retry')),
          ],
        ),
      );

  Widget _buildAppBar(BuildContext context, AppLocalizations l10n) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 24, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const _CircleIcon(icon: Icons.arrow_back_rounded),
          ),
          Text(
            l10n.bookingDetails,
            style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w900,
                color: ColorApp.textBlack),
          ),
          const _CircleIcon(icon: Icons.autorenew_rounded),
        ],
      ),
    );
  }

  Widget _buildHeaderInfo(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ColorApp.primary, ColorApp.primary.withValues(alpha: 0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: AppShadows.primaryGlowLarge(),
      ),
      child: Row(
        children: [
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withValues(alpha: 0.31)),
            ),
            child: const Icon(Icons.autorenew_rounded,
                color: Colors.white, size: 35),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.serviceName,
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Colors.white),
                ),
                const SizedBox(height: 6),
                Text(
                  widget.propertyTypeName ?? l10n.fullMaintenance,
                  style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 13,
                      fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _tierButton(AppServiceTier tier, String localeCode) {
    final isSelected = _tier?.id == tier.id;
    return GestureDetector(
      onTap: () => setState(() => _tier = tier),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        height: 50,
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: isSelected ? ColorApp.primary : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? Colors.transparent : ColorApp.greyBorder,
            width: 1.5,
          ),
          boxShadow: isSelected ? AppShadows.primaryGlow() : null,
        ),
        child: Center(
          child: Text(
            tier.nameFor(localeCode).toUpperCase(),
            style: TextStyle(
              color: isSelected ? Colors.white : ColorApp.textBlack,
              fontSize: 15,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTierMetrics(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColorApp.softGrey,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.black.withValues(alpha: 0.02)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _ConfigMetric(
              label: l10n.professionals,
              value: '${_tier!.workers}',
            ),
          ),
          Expanded(
            child: _ConfigMetric(
              label: l10n.duration,
              value: '${_tier!.durationHours} ${l10n.hours}',
            ),
          ),
          Expanded(
            child: _ConfigMetric(
              label: 'Per week',
              value: '$_daysPerWeek days',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDaysRow() {
    return Row(
      children: List.generate(7, (index) {
        final day = index + 1;
        final isSelected = _daysPerWeek == day;
        return Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _daysPerWeek = day),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              height: 50,
              margin: EdgeInsets.only(right: index == 6 ? 0 : 8),
              decoration: BoxDecoration(
                color: isSelected
                    ? ColorApp.primary.withValues(alpha: 0.12)
                    : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? ColorApp.primary : ColorApp.greyBorder,
                  width: 1.5,
                ),
              ),
              child: Center(
                child: Text(
                  '$day',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight:
                        isSelected ? FontWeight.w900 : FontWeight.w700,
                    color: isSelected ? ColorApp.primary : ColorApp.textBlack,
                  ),
                ),
              ),
            ),
          ),
        );
      }),
    );
  }

  Widget _buildField(String label, TextEditingController controller,
      {bool isNumber = false, String? hint}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeader(title: label, trailing: ''),
        TextField(
          controller: controller,
          keyboardType: isNumber ? TextInputType.number : TextInputType.text,
          minLines: 1,
          maxLines: isNumber ? 1 : 3,
          style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14,
              color: ColorApp.textBlack),
          decoration: InputDecoration(
            hintText: hint ?? '0',
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
          ),
        ),
      ],
    );
  }

  Widget _buildBottomAction() {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Container(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 30),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
              topLeft: Radius.circular(40), topRight: Radius.circular(40)),
          boxShadow: AppShadows.topBar,
        ),
        child: Row(
          children: [
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Monthly price',
                      style: TextStyle(
                          color: ColorApp.textGrey,
                          fontWeight: FontWeight.w700,
                          fontSize: 11)),
                  SizedBox(height: 2),
                  Text(
                    'On confirmation',
                    style: TextStyle(
                        color: ColorApp.textBlack,
                        fontSize: 16,
                        fontWeight: FontWeight.w900),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 20),
            Expanded(
              flex: 2,
              child: GestureDetector(
                onTap: _isSubmitting ? null : _submit,
                child: Container(
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [ColorApp.primary, ColorApp.gradientTeal],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: AppShadows.primaryGlow(opacity: 0.39),
                  ),
                  child: Center(
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2.5),
                          )
                        : const Text(
                            'Request Subscription',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 14),
                          ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String trailing;
  const _SectionHeader({required this.title, required this.trailing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            title,
            style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w900,
                color: ColorApp.textBlack,
                letterSpacing: -0.5),
          ),
          Text(
            trailing,
            style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: ColorApp.primary),
          ),
        ],
      ),
    );
  }
}

class _ConfigMetric extends StatelessWidget {
  final String label;
  final String value;

  const _ConfigMetric({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: ColorApp.textGrey,
            fontSize: 11,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: ColorApp.textBlack,
            fontSize: 13,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _CircleIcon extends StatelessWidget {
  final IconData icon;
  const _CircleIcon({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: AppShadows.card,
      ),
      child: Icon(icon, color: ColorApp.textBlack, size: 20),
    );
  }
}
