import 'package:cleanapp/src/features/home/pages/home_page.dart';
import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/l10n/app_localizations.dart';
import 'dart:ui';

class OrderSummaryPage extends StatefulWidget {
  final String serviceName;
  final String date;
  final String time;
  final String address;
  final String frequency;
  final int duration;
  final int cleaners;
  final bool needMaterials;
  final double subtotal;

  const OrderSummaryPage({
    super.key,
    required this.serviceName,
    required this.date,
    required this.time,
    required this.address,
    required this.frequency,
    required this.duration,
    required this.cleaners,
    required this.needMaterials,
    required this.subtotal,
  });

  @override
  State<OrderSummaryPage> createState() => _OrderSummaryPageState();
}

class _OrderSummaryPageState extends State<OrderSummaryPage> {
  String _selectedPayment = '';
  String? _appliedPromo;

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
                        decoration: const BoxDecoration(color: ColorApp.softGrey, shape: BoxShape.circle),
                        child: const Icon(Icons.close_rounded, size: 20, color: ColorApp.textGrey),
                      ),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: codeController,
                  textCapitalization: TextCapitalization.characters,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                  decoration: InputDecoration(
                    hintText: l10n.tapYourCodeHere,
                    filled: true,
                    fillColor: ColorApp.softGrey,
                    prefixIcon: const Icon(Icons.confirmation_num_outlined, color: ColorApp.primary),
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
                    onPressed: () {
                      if (codeController.text.isNotEmpty) {
                        setState(() {
                          _appliedPromo = codeController.text;
                        });
                        Navigator.pop(context);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ColorApp.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      elevation: 0,
                    ),
                    child: Text(
                      l10n.apply,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
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

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

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
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: ColorApp.textBlack, size: 18),
            onPressed: () => Navigator.pop(context),
            style: IconButton.styleFrom(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
            padding: EdgeInsets.fromLTRB(24, MediaQuery.of(context).padding.top + 80, 24, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionCard(
                  title: "Logistics",
                  icon: Icons.local_shipping_outlined,
                  child: Column(
                    children: [
                      _buildInfoRow(Icons.calendar_today_rounded, widget.date),
                      const SizedBox(height: 12),
                      _buildInfoRow(Icons.access_time_rounded, widget.time),
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
                            child: const Icon(Icons.location_on_rounded, color: ColorApp.primary, size: 20),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Service Address",
                                  style: TextStyle(fontSize: 12, color: ColorApp.textGrey, fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  widget.address,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: ColorApp.textBlack,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: ColorApp.softGrey,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.map_outlined, color: ColorApp.textGrey, size: 24),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _buildSectionCard(
                  title: "Booking Configuration",
                  icon: Icons.settings_outlined,
                  child: Column(
                    children: [
                      _detailRow("Frequency", widget.frequency, Icons.repeat_rounded),
                      _detailRow("Duration", "${widget.duration} Hours", Icons.timer_outlined),
                      _detailRow("Cleaners", "${widget.cleaners} Professionals", Icons.people_outline_rounded),
                      _detailRow("Materials", widget.needMaterials ? "Provided" : "Not needed", Icons.inventory_2_outlined),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Padding(
                  padding: EdgeInsets.only(left: 4, bottom: 12),
                  child: Text(
                    "Payment Method",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: ColorApp.textBlack),
                  ),
                ),
                _paymentOption(l10n.baridiMobCCP, Icons.account_balance_wallet_rounded),
                const SizedBox(height: 12),
                _paymentOption("Cash on Delivery", Icons.payments_outlined),
                const SizedBox(height: 24),
                _buildSectionCard(
                  title: "Financial Summary",
                  icon: Icons.account_balance_wallet_outlined,
                  child: Column(
                    children: [
                      _summaryRow("Subtotal", "${widget.subtotal.toStringAsFixed(2)} DZ"),
                      const SizedBox(height: 16),
                      _buildPromoSection(),
                      const Divider(height: 32, thickness: 0.5),
                      _summaryRow("Grand Total", "${widget.subtotal.toStringAsFixed(2)} DZ", isTotal: true),
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
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 40),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, -5)),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: _selectedPayment.isEmpty ? null : () => _showSuccessAnimation(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColorApp.primary,
                    disabledBackgroundColor: ColorApp.softGrey,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 0,
                  ),
                  child: Text(
                    _selectedPayment.isEmpty ? "Select Payment Type" : "Confirm Booking",
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({required String title, required IconData icon, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4)),
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

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: ColorApp.textGrey),
        const SizedBox(width: 8),
        Text(
          text,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: ColorApp.textBlack),
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
          Text(label, style: const TextStyle(color: ColorApp.textGrey, fontSize: 14, fontWeight: FontWeight.w500)),
          const Spacer(),
          Text(value, style: const TextStyle(color: ColorApp.textBlack, fontWeight: FontWeight.w700, fontSize: 14)),
        ],
      ),
    );
  }

  Widget _paymentOption(String title, IconData icon) {
    final isSelected = _selectedPayment == title;
    return GestureDetector(
      onTap: () => setState(() => _selectedPayment = title),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        decoration: BoxDecoration(
          color: isSelected ? ColorApp.primary.withValues(alpha: 0.03) : Colors.white,
          border: Border.all(color: isSelected ? ColorApp.primary : Colors.transparent, width: 2),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: ColorApp.softGrey, borderRadius: BorderRadius.circular(12)),
              child: Icon(
                icon,
                color: ColorApp.textBlack,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Text(
              title,
              style: TextStyle(
                color: ColorApp.textBlack,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                fontSize: 15,
              ),
            ),
            const Spacer(),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: ColorApp.primary, size: 24)
            else
              Icon(Icons.circle_outlined, color: Colors.grey.shade300, size: 24),
          ],
        ),
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
            const Icon(Icons.confirmation_num_outlined, color: Colors.green, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _appliedPromo != null ? "Code: $_appliedPromo" : "Have a promo code?",
                    style: const TextStyle(color: Colors.green, fontWeight: FontWeight.w800, fontSize: 13),
                  ),
                  if (_appliedPromo == null)
                    const Text("Tap here to apply a discount", style: TextStyle(color: Colors.green, fontSize: 11)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, color: Colors.green, size: 14),
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
