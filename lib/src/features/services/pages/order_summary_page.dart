import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:cleanapp/src/features/home/pages/home_page.dart';
import 'package:cleanapp/src/features/home/pages/location_setup_page.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/orders/data/orders_api_service.dart';
import 'package:cleanapp/src/features/services/booking_pricing.dart';
import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/l10n/app_localizations.dart';
import 'dart:ui';

class OrderSummaryPage extends StatefulWidget {
  final String serviceName;
  final String? serviceId;
  final String? houseConfigId;
  final String? categoryId;
  final String? categoryServiceId;
  final DateTime scheduledDate;
  final String date;
  final String time;
  final String address;
  final String frequency;
  final int duration;
  final int cleaners;
  final int extraWorkers;
  final bool needMaterials;
  final bool needEquipment;
  final BookingMaterial materialType;
  final double subtotal;
  final bool isRapid;
  final double? sizeM2;

  const OrderSummaryPage({
    super.key,
    required this.serviceName,
    this.serviceId,
    this.houseConfigId,
    this.categoryId,
    this.categoryServiceId,
    required this.scheduledDate,
    required this.date,
    required this.time,
    required this.address,
    required this.frequency,
    required this.duration,
    required this.cleaners,
    this.extraWorkers = 0,
    required this.needMaterials,
    required this.needEquipment,
    required this.materialType,
    required this.subtotal,
    this.isRapid = false,
    this.sizeM2,
  });

  @override
  State<OrderSummaryPage> createState() => _OrderSummaryPageState();
}

class _OrderSummaryPageState extends State<OrderSummaryPage> {
  String? _appliedPromo;
  double _promoDiscountPercent = 0;
  bool _isSubmitting = false;
  bool _isBookingConfigExpanded = false;
  final List<String> _selectedPhotos = [];
  final TextEditingController _notesController = TextEditingController();
  late final TextEditingController _addressController =
      TextEditingController(text: widget.address);
  double? _latitude;
  double? _longitude;

  @override
  void dispose() {
    _notesController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  double get _discountAmount => widget.subtotal * _promoDiscountPercent / 100;
  double get _grandTotal => widget.subtotal - _discountAmount;

  Future<void> _pickImageFromDevice() async {
    if (_selectedPhotos.length >= 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Maximum of 5 photos allowed"),
          backgroundColor: ColorApp.primary,
        ),
      );
      return;
    }

    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 70,
        maxWidth: 1280,
      );

      if (image != null && mounted) {
        setState(() {
          _selectedPhotos.add(image.path);
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Failed to pick image: $e"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  /// Uploads the picked photos to the backend (multipart) and returns their
  /// server paths (/uploads/...) for `housePictures`.
  Future<List<String>> _encodePhotos() async {
    final api = locator<OrdersApiService>();
    final urls = <String>[];
    for (final path in _selectedPhotos) {
      try {
        urls.add(await api.uploadImage(path));
      } catch (_) {
        // Skip failed uploads rather than failing the whole booking.
      }
    }
    return urls;
  }

  void _removePhoto(int index) {
    setState(() {
      _selectedPhotos.removeAt(index);
    });
  }

  void _showPromoBottomSheet(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final codeController = TextEditingController(text: _appliedPromo ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (builderContext) {
        return Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 12, 24, 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 5,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2.5),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.enterYourCode,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: ColorApp.textBlack,
                        letterSpacing: -0.5,
                      ),
                    ),
                    IconButton(
                      icon: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                            color: ColorApp.softGrey, shape: BoxShape.circle),
                        child: const Icon(Icons.close_rounded,
                            size: 20, color: ColorApp.textGrey),
                      ),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: codeController,
                  textCapitalization: TextCapitalization.characters,
                  style: const TextStyle(
                      fontWeight: FontWeight.w700, fontSize: 16),
                  decoration: InputDecoration(
                    hintText: l10n.tapYourCodeHere,
                    filled: true,
                    fillColor: ColorApp.softGrey,
                    prefixIcon: const Icon(Icons.confirmation_num_outlined,
                        color: ColorApp.primary),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.all(20),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    onPressed: () async {
                      final code = codeController.text.trim().toUpperCase();
                      if (code.isEmpty) return;
                      Navigator.pop(builderContext);
                      final messenger = ScaffoldMessenger.of(context);
                      try {
                        final discount = await locator<OrdersApiService>()
                            .validatePromo(code);
                        if (!mounted) return;
                        setState(() {
                          _appliedPromo = code;
                          _promoDiscountPercent = discount;
                        });
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(
                                'Promo $code applied: -${discount.toStringAsFixed(0)}%'),
                            backgroundColor: ColorApp.primary,
                          ),
                        );
                      } catch (e) {
                        if (!mounted) return;
                        setState(() {
                          _appliedPromo = null;
                          _promoDiscountPercent = 0;
                        });
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(
                                e.toString().replaceFirst('Exception: ', '')),
                            backgroundColor: const Color(0xFFDC2626),
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ColorApp.primary,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20)),
                      elevation: 0,
                    ),
                    child: Text(
                      l10n.apply,
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showSuccessAnimation(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withValues(alpha: 0.1),
      builder: (context) {
        return TweenAnimationBuilder<double>(
          duration: const Duration(milliseconds: 600),
          tween: Tween(begin: 0.0, end: 1.0),
          builder: (context, value, child) {
            return BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10 * value, sigmaY: 10 * value),
              child: Opacity(
                opacity: value,
                child: Dialog(
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: ColorApp.primary.withValues(alpha: 0.3),
                              blurRadius: 30,
                              spreadRadius: 10,
                            ),
                          ],
                        ),
                        child: TweenAnimationBuilder<double>(
                          duration: const Duration(milliseconds: 800),
                          curve: Curves.elasticOut,
                          tween: Tween(begin: 0.0, end: 1.0),
                          builder: (context, scale, child) {
                            return Transform.scale(
                              scale: scale,
                              child: const Icon(
                                Icons.check_circle_rounded,
                                color: ColorApp.primary,
                                size: 80,
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        "Booking Successful!",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Your request has been received",
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.8),
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );

    final navigator = Navigator.of(context);
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (!mounted) return;
      navigator.pushAndRemoveUntil(
        MaterialPageRoute(
            builder: (context) => const HomePage(initialIndex: 2)),
        (route) => false,
      );
    });
  }

  Future<void> _confirmBooking() async {
    final hasServiceOrder =
        widget.serviceId != null && widget.houseConfigId != null;
    final hasCategoryOrder =
        widget.categoryId != null && widget.categoryServiceId != null;

    if (!hasServiceOrder && !hasCategoryOrder) {
      _showSuccessAnimation(context);
      return;
    }

    final address = _addressController.text.trim();
    if (address.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocalizations.of(context)!.enterServiceAddress),
          backgroundColor: const Color(0xFFDC2626),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final clientNote = _notesController.text.trim();
      final housePictures = await _encodePhotos();

      if (hasServiceOrder) {
        await locator<OrdersApiService>().createServiceOrder(
          serviceId: widget.serviceId!,
          houseConfigId: widget.houseConfigId!,
          extraWorkers: widget.extraWorkers,
          useMaterials: widget.needMaterials,
          materialType: widget.materialType,
          scheduledDate: widget.scheduledDate,
          address: address,
          promoCode: _appliedPromo,
          clientNote: clientNote,
          housePictures: housePictures,
          isRapid: widget.isRapid,
          sizeM2: widget.sizeM2,
          latitude: _latitude,
          longitude: _longitude,
        );
      } else {
        await locator<OrdersApiService>().createCategoryOrder(
          categoryId: widget.categoryId!,
          categoryServiceId: widget.categoryServiceId!,
          useMaterials: widget.needMaterials,
          materialType: widget.materialType,
          scheduledDate: widget.scheduledDate,
          address: address,
          promoCode: _appliedPromo,
          clientNote: clientNote,
          housePictures: housePictures,
          isRapid: widget.isRapid,
          sizeM2: widget.sizeM2,
          latitude: _latitude,
          longitude: _longitude,
        );
      }
      if (!mounted) return;
      _showSuccessAnimation(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: const Color(0xFFDC2626),
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.white.withValues(alpha: 0.8),
        elevation: 0,
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: Colors.transparent),
          ),
        ),
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: ColorApp.textBlack, size: 18),
            onPressed: () => Navigator.pop(context),
            style: IconButton.styleFrom(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
        centerTitle: true,
        title: Column(
          children: [
            const Text(
              "Order Summary",
              style: TextStyle(
                color: ColorApp.textBlack,
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
              ),
            ),
            Text(
              widget.serviceName,
              style: const TextStyle(
                color: ColorApp.primary,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(
                24, MediaQuery.of(context).padding.top + 80, 24, 180),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildPlainCard(
                  child: Column(
                    children: [
                      _buildInfoRow(
                          Icons.calendar_today_rounded, "Date", widget.date),
                      const SizedBox(height: 12),
                      _buildInfoRow(
                          Icons.access_time_rounded, "Hour", widget.time),
                      const Divider(height: 32, thickness: 0.5),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: ColorApp.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.location_on_rounded,
                                color: ColorApp.primary, size: 20),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Service Address",
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: ColorApp.textGrey,
                                      fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 4),
                                TextField(
                                  controller: _addressController,
                                  minLines: 1,
                                  maxLines: 3,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: ColorApp.textBlack,
                                    height: 1.4,
                                  ),
                                  decoration: InputDecoration(
                                    hintText: "Enter your full address...",
                                    hintStyle: TextStyle(
                                      color: Colors.grey.shade400,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    isDense: true,
                                    contentPadding: EdgeInsets.zero,
                                    border: InputBorder.none,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          GestureDetector(
                            onTap: () async {
                              final result = await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const LocationSetupPage(),
                                ),
                              );
                              if (result is SelectedLocation) {
                                setState(() {
                                  _addressController.text = result.address;
                                  _latitude = result.latitude;
                                  _longitude = result.longitude;
                                });
                              } else if (result is String) {
                                setState(() {
                                  _addressController.text = result;
                                });
                              }
                            },
                            child: Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                color: ColorApp.softGrey,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.map_outlined,
                                  color: ColorApp.textGrey, size: 24),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _buildExpandableSectionCard(
                  title: "Booking Configuration",
                  icon: Icons.settings_outlined,
                  isExpanded: _isBookingConfigExpanded,
                  onTap: () => setState(() =>
                      _isBookingConfigExpanded = !_isBookingConfigExpanded),
                  child: Column(
                    children: [
                      const Divider(height: 24, thickness: 0.5),
                      _detailRow("Duration", "${widget.duration} Hours",
                          Icons.timer_outlined),
                      _detailRow("Cleaners", "${widget.cleaners} Professionals",
                          Icons.people_outline_rounded),
                      _detailRow(
                          "Materials",
                          widget.needMaterials ? "Provided" : "Not needed",
                          Icons.inventory_2_outlined),
                      _detailRow(
                          "Equipment",
                          widget.needEquipment ? "Provided" : "Not needed",
                          Icons.handyman_outlined),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Padding(
                  padding: EdgeInsets.only(left: 4),
                  child: Text(
                    "Notes",
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: ColorApp.textBlack),
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 4)),
                    ],
                  ),
                  child: TextField(
                    controller: _notesController,
                    minLines: 3,
                    maxLines: 5,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: ColorApp.textBlack),
                    decoration: InputDecoration(
                      hintText: "Add any special instructions or notes...",
                      hintStyle: TextStyle(
                          color: Colors.grey.shade400,
                          fontSize: 14,
                          fontWeight: FontWeight.w500),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide:
                            BorderSide(color: Colors.grey.shade200, width: 1.5),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide:
                            BorderSide(color: Colors.grey.shade100, width: 1.5),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: const BorderSide(
                            color: ColorApp.primary, width: 1.5),
                      ),
                      contentPadding: const EdgeInsets.all(20),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Padding(
                  padding: EdgeInsets.only(left: 4),
                  child: Text(
                    "Photos (optional)",
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: ColorApp.textBlack),
                  ),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ...List.generate(_selectedPhotos.length, (index) {
                        return Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              margin: const EdgeInsets.only(
                                  right: 12, top: 8, bottom: 8),
                              decoration: BoxDecoration(
                                color: ColorApp.softGrey,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.grey.shade300),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: Image.file(
                                  File(_selectedPhotos[index]),
                                  width: double.infinity,
                                  height: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    color: const Color(0xFFE6ECE9),
                                    child: const Center(
                                      child: Icon(
                                          Icons.image_not_supported_outlined,
                                          color: Color(0xFF0E4337),
                                          size: 32),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Positioned(
                              top: 0,
                              right: 4,
                              child: GestureDetector(
                                onTap: () => _removePhoto(index),
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: Colors.red,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.close_rounded,
                                      color: Colors.white, size: 12),
                                ),
                              ),
                            ),
                          ],
                        );
                      }),
                      if (_selectedPhotos.length < 5)
                        GestureDetector(
                          onTap: _pickImageFromDevice,
                          child: Container(
                            width: 80,
                            height: 80,
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F3),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.add_a_photo_outlined,
                                  color: Color(0xFF0E4337),
                                  size: 24,
                                ),
                                SizedBox(height: 4),
                                Text(
                                  "Add photos",
                                  style: TextStyle(
                                    color: Color(0xFF0E4337),
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.only(left: 4),
                  child: Text(
                    "${_selectedPhotos.length}/5",
                    style: const TextStyle(
                      color: ColorApp.textGrey,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                _buildSectionCard(
                  title: "Financial Summary",
                  icon: Icons.account_balance_wallet_outlined,
                  child: Column(
                    children: [
                      _summaryRow("Subtotal",
                          "${widget.subtotal.toStringAsFixed(2)} DZ"),
                      const SizedBox(height: 16),
                      _buildPromoSection(),
                      if (_promoDiscountPercent > 0) ...[
                        const SizedBox(height: 16),
                        _summaryRow(
                          "Discount (-${_promoDiscountPercent.toStringAsFixed(0)}%)",
                          "-${_discountAmount.toStringAsFixed(2)} DZ",
                        ),
                      ],
                      const Divider(height: 32, thickness: 0.5),
                      _summaryRow(
                          "Grand Total", "${_grandTotal.toStringAsFixed(2)} DZ",
                          isTotal: true),
                    ],
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 20,
                      offset: const Offset(0, -5)),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Total",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: ColorApp.textBlack,
                          fontFamily: 'Gilmer',
                        ),
                      ),
                      Text(
                        "${_grandTotal.toStringAsFixed(0)}Da",
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF0E4337),
                          fontFamily: 'Gilmer',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _confirmBooking,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ColorApp.primary,
                        disabledBackgroundColor: ColorApp.softGrey,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20)),
                        elevation: 0,
                      ),
                      child: Text(
                        _isSubmitting
                            ? "Creating Booking..."
                            : "Confirm Booking",
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          fontFamily: 'Gilmer',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard(
      {required String title, required IconData icon, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: ColorApp.primary),
              const SizedBox(width: 8),
              Text(
                title.toUpperCase(),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: ColorApp.primary,
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildExpandableSectionCard({
    required String title,
    required IconData icon,
    required bool isExpanded,
    required VoidCallback onTap,
    required Widget child,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 10,
                offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: ColorApp.primary),
                const SizedBox(width: 8),
                Text(
                  title.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: ColorApp.primary,
                    letterSpacing: 1.2,
                  ),
                ),
                const Spacer(),
                Icon(
                  isExpanded
                      ? Icons.keyboard_arrow_down_rounded
                      : Icons.keyboard_arrow_right_rounded,
                  color: ColorApp.textGrey,
                  size: 20,
                ),
              ],
            ),
            AnimatedCrossFade(
              firstChild: const SizedBox.shrink(),
              secondChild: child,
              crossFadeState: isExpanded
                  ? CrossFadeState.showSecond
                  : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 200),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlainCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: child,
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: ColorApp.textGrey),
        const SizedBox(width: 8),
        Text(
          "$label: ",
          style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: ColorApp.textGrey),
        ),
        Text(
          text,
          style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: ColorApp.textBlack),
        ),
      ],
    );
  }

  Widget _detailRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: ColorApp.textGrey.withValues(alpha: 0.5)),
          const SizedBox(width: 12),
          Text(label,
              style: const TextStyle(
                  color: ColorApp.textGrey,
                  fontSize: 14,
                  fontWeight: FontWeight.w500)),
          const Spacer(),
          Text(value,
              style: const TextStyle(
                  color: ColorApp.textBlack,
                  fontWeight: FontWeight.w700,
                  fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildPromoSection() {
    return GestureDetector(
      onTap: () => _showPromoBottomSheet(context),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFF0FDF4),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.green.withValues(alpha: 0.2)),
        ),
        child: Row(
          children: [
            const Icon(Icons.confirmation_num_outlined,
                color: Colors.green, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _appliedPromo != null
                        ? "Code: $_appliedPromo"
                        : "Have a promo code?",
                    style: const TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.w800,
                        fontSize: 13),
                  ),
                  if (_appliedPromo == null)
                    const Text("Tap here to apply a discount",
                        style: TextStyle(color: Colors.green, fontSize: 11)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded,
                color: Colors.green, size: 14),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 18 : 14,
            fontWeight: isTotal ? FontWeight.w900 : FontWeight.w600,
            color: isTotal ? ColorApp.textBlack : ColorApp.textGrey,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isTotal ? 20 : 14,
            fontWeight: isTotal ? FontWeight.w900 : FontWeight.w700,
            color: isTotal ? ColorApp.primary : ColorApp.textBlack,
          ),
        ),
      ],
    );
  }
}
