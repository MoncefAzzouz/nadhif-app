import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'dart:ui';

class ServiceBookingPage extends StatefulWidget {
  final String serviceName;

  const ServiceBookingPage({super.key, required this.serviceName});

  @override
  State<ServiceBookingPage> createState() => _ServiceBookingPageState();
}

class _ServiceBookingPageState extends State<ServiceBookingPage> with SingleTickerProviderStateMixin {
  int _selectedHours = 4;
  int _selectedCleaners = 1;
  String _selectedTimeSlot = "05:30 pm - 06:00 pm";
  bool _needMaterials = false;
  String _materialType = "Algerian"; // "Algerian" or "Imported"
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  bool _showBreakdown = false;

  final double _basePricePerHour = 22.0;
  final double _materialPriceAlgerian = 7.0;
  final double _materialPriceImported = 15.0;

  double get _totalPrice {
    double price = _selectedHours * _selectedCleaners * _basePricePerHour;
    if (_needMaterials) {
      double matPrice = _materialType == "Algerian" ? _materialPriceAlgerian : _materialPriceImported;
      price += _selectedHours * matPrice;
    }
    return price;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                color: ColorApp.primary.withAlpha(20),
                shape: BoxShape.circle,
              ),
              child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80), child: Container()),
            ),
          ),
          
          SafeArea(
            child: Column(
              children: [
                _buildAppBar(),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeaderInfo(),
                        const SizedBox(height: 16),
                        _buildSectionHeader("Select Date", "May 2026"),
                        _buildHorizontalCalendar(),
                        const SizedBox(height: 16),
                        _buildSectionHeader("How Many Hours", "$_selectedHours Hours"),
                        _buildHoursPicker(),
                        const SizedBox(height: 16),
                        _buildSectionHeader("Number Of Cleaners", "$_selectedCleaners Pro"),
                        _buildCleanersPicker(),
                        const SizedBox(height: 16),
                        _buildSectionHeader("Time Slot", _selectedTimeSlot.split(" ")[0]),
                        _buildTimeSlotPicker(),
                        const SizedBox(height: 16),
                        _buildMaterialsCard(),
                        const SizedBox(height: 120), // Bottom bar space
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          _buildBottomAction(),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 24, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: const Icon(Icons.arrow_back_rounded, color: ColorApp.textBlack, size: 20),
            ),
          ),
          const Text(
            "Booking Details",
            style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: ColorApp.textBlack),
          ),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: const Icon(Icons.favorite_border_rounded, color: ColorApp.textBlack, size: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderInfo() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ColorApp.primary, ColorApp.primary.withAlpha(180)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(color: ColorApp.primary.withAlpha(60), blurRadius: 25, offset: const Offset(0, 10)),
        ],
      ),
      child: Row(
        children: [
          Hero(
            tag: "service_${widget.serviceName}",
            child: Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(50),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withAlpha(80)),
              ),
              child: const Icon(Icons.cleaning_services_rounded, color: Colors.white, size: 35),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.serviceName,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.star_rounded, color: Colors.amber.shade400, size: 18),
                    const SizedBox(width: 4),
                    const Text(
                      "4.8 (1.2k Reviews)",
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, String trailing) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: ColorApp.textBlack, letterSpacing: -0.5),
          ),
          Text(
            trailing,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: ColorApp.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildHorizontalCalendar() {
    final days = List.generate(14, (index) => DateTime.now().add(Duration(days: index + 1)));
    final weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

    return SizedBox(
      height: 88,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: days.length,
        itemBuilder: (context, index) {
          final date = days[index];
          final isSelected = _selectedDate.day == date.day && _selectedDate.month == date.month;
          return GestureDetector(
            onTap: () => setState(() => _selectedDate = date),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: 62,
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: isSelected ? ColorApp.primary : Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: isSelected ? Colors.transparent : ColorApp.greyBorder, width: 1.5),
                boxShadow: isSelected ? [
                  BoxShadow(color: ColorApp.primary.withAlpha(60), blurRadius: 15, offset: const Offset(0, 8)),
                ] : [],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    weekDays[date.weekday - 1],
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: isSelected ? Colors.white.withAlpha(200) : ColorApp.textGrey,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    date.day.toString().padLeft(2, '0'),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: isSelected ? Colors.white : ColorApp.textBlack,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHoursPicker() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: List.generate(7, (index) {
          int hour = index + 4;
          bool isSelected = _selectedHours == hour;
          return GestureDetector(
            onTap: () => setState(() => _selectedHours = hour),
            child: AnimatedScale(
              scale: isSelected ? 1.05 : 1.0,
              duration: const Duration(milliseconds: 200),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 54,
                height: 54,
                margin: const EdgeInsets.only(right: 10),
                decoration: BoxDecoration(
                  color: isSelected ? ColorApp.textBlack : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isSelected ? Colors.transparent : ColorApp.greyBorder, width: 1.5),
                ),
                child: Center(
                  child: Text(
                    hour.toString().padLeft(2, '0'),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: isSelected ? Colors.white : ColorApp.textBlack,
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildCleanersPicker() {
    return Row(
      children: List.generate(5, (index) {
        int count = index + 1;
        bool isSelected = _selectedCleaners == count;
        return Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _selectedCleaners = count),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: 50,
              margin: EdgeInsets.only(right: index == 4 ? 0 : 8),
              decoration: BoxDecoration(
                color: isSelected ? ColorApp.primary.withAlpha(30) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isSelected ? ColorApp.primary : ColorApp.greyBorder, width: 1.5),
              ),
              child: Center(
                child: Text(
                  count.toString().padLeft(2, '0'),
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
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

  Widget _buildTimeSlotPicker() {
    final slots = ["08:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "06:00 PM"];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: slots.map((slot) {
          bool isSelected = _selectedTimeSlot.contains(slot);
          return GestureDetector(
            onTap: () => setState(() => _selectedTimeSlot = slot),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: isSelected ? ColorApp.primary : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: isSelected ? Colors.transparent : ColorApp.greyBorder, width: 1.5),
              ),
              child: Text(
                slot,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: isSelected ? Colors.white : ColorApp.textBlack,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMaterialsCard() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: ColorApp.softGrey,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.black.withAlpha(5)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.auto_awesome_rounded, color: ColorApp.primary, size: 22),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Cleaning Materials",
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: ColorApp.textBlack),
                    ),
                    Text(
                      "Choose your preferred products",
                      style: TextStyle(fontSize: 12, color: ColorApp.textGrey, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              Switch.adaptive(
                value: _needMaterials,
                onChanged: (val) => setState(() => _needMaterials = val),
                activeColor: ColorApp.primary,
                activeTrackColor: ColorApp.primary.withAlpha(100),
              ),
            ],
          ),
        ),
        if (_needMaterials) ...[
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildMaterialTypeOption("Algerian", "DA ${_materialPriceAlgerian.toInt()}/hr")),
              const SizedBox(width: 12),
              Expanded(child: _buildMaterialTypeOption("Imported", "DA ${_materialPriceImported.toInt()}/hr")),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildMaterialTypeOption(String type, String price) {
    final isSelected = _materialType == type;
    final String label = type == "Algerian" ? "Algerian Products" : "Imported (France)";
    
    return GestureDetector(
      onTap: () => setState(() => _materialType = type),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? ColorApp.textBlack : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? Colors.transparent : ColorApp.greyBorder, width: 1.5),
          boxShadow: isSelected ? [
            BoxShadow(color: Colors.black.withAlpha(30), blurRadius: 10, offset: const Offset(0, 4)),
          ] : [],
        ),
        child: Column(
          children: [
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w900,
                color: isSelected ? Colors.white : ColorApp.textBlack,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              price,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isSelected ? Colors.white.withAlpha(180) : ColorApp.textGrey,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomAction() {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Container(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 30),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(topLeft: Radius.circular(40), topRight: Radius.circular(40)),
          boxShadow: [
            BoxShadow(color: Colors.black.withAlpha(15), blurRadius: 30, offset: const Offset(0, -10)),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_showBreakdown) _buildPriceBreakdown(),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      GestureDetector(
                        onTap: () => setState(() => _showBreakdown = !_showBreakdown),
                        child: Row(
                          children: [
                            const Text("Total Price", style: TextStyle(color: ColorApp.textGrey, fontWeight: FontWeight.w700, fontSize: 11)),
                            const SizedBox(width: 4),
                            Icon(_showBreakdown ? Icons.keyboard_arrow_down_rounded : Icons.keyboard_arrow_up_rounded, size: 14, color: ColorApp.textGrey),
                          ],
                        ),
                      ),
                      const SizedBox(height: 2),
                      TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0, end: _totalPrice),
                        duration: const Duration(milliseconds: 600),
                        curve: Curves.easeOutQuart,
                        builder: (context, value, child) {
                          return Text(
                            "DA ${value.toStringAsFixed(2)}",
                            style: const TextStyle(color: ColorApp.textBlack, fontSize: 16, fontWeight: FontWeight.w900),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  flex: 2,
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [ColorApp.primary, Color(0xFF00BFA5)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(color: ColorApp.primary.withAlpha(100), blurRadius: 15, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        "Book Now",
                        style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceBreakdown() {
    return Container(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        children: [
          _breakdownRow("Base Price", "DA $_basePricePerHour/hr"),
          const SizedBox(height: 8),
          _breakdownRow("Professionals", "x $_selectedCleaners"),
          const SizedBox(height: 8),
          _breakdownRow("Duration", "$_selectedHours Hours"),
          if (_needMaterials) ...[
            const SizedBox(height: 8),
            _breakdownRow("${_materialType == 'Algerian' ? 'Local' : 'Imported'} Materials", "DA ${((_materialType == 'Algerian' ? _materialPriceAlgerian : _materialPriceImported) * _selectedHours).toStringAsFixed(0)}"),
          ],
          const Divider(height: 32),
        ],
      ),
    );
  }

  Widget _breakdownRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: ColorApp.textGrey, fontWeight: FontWeight.w600)),
        Text(value, style: const TextStyle(color: ColorApp.textBlack, fontWeight: FontWeight.w800)),
      ],
    );
  }
}
