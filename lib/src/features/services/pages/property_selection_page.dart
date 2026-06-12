import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:cleanapp/src/features/services/pages/service_booking_page.dart';
import 'package:cleanapp/src/features/subscriptions/pages/subscription_booking_page.dart';
import 'package:flutter/material.dart';

class PropertyItem {
  final String title;
  final IconData icon;

  const PropertyItem({required this.title, required this.icon});
}

class PropertySelectionPage extends StatefulWidget {
  final String serviceName;
  final AppService? service;
  final AppCategory? category;
  final String? serviceImage;
  final IconData? serviceIcon;

  /// When true, "Next" continues into the subscription booking flow instead
  /// of the one-time service booking.
  final bool isSubscription;

  const PropertySelectionPage({
    super.key,
    required this.serviceName,
    this.service,
    this.category,
    this.serviceImage,
    this.serviceIcon,
    this.isSubscription = false,
  });

  @override
  State<PropertySelectionPage> createState() => _PropertySelectionPageState();
}

class _PropertySelectionPageState extends State<PropertySelectionPage> {
  String? _selectedProperty;

  final List<PropertyItem> _properties = const [
    PropertyItem(title: "Apartment", icon: Icons.apartment_rounded),
    PropertyItem(title: "House", icon: Icons.home_rounded),
    PropertyItem(title: "Villa", icon: Icons.holiday_village_rounded),
    PropertyItem(title: "Store", icon: Icons.storefront_rounded),
    PropertyItem(title: "Office", icon: Icons.business_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: ColorApp.textBlack, size: 18),
            onPressed: () => Navigator.pop(context),
            style: IconButton.styleFrom(
              backgroundColor: ColorApp.softGrey,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
      ),
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "New Reservation",
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: ColorApp.textBlack,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                // Elegant underline under title like the picture
                Container(
                  width: 140,
                  height: 3,
                  decoration: BoxDecoration(
                    color: ColorApp.textBlack,
                    borderRadius: BorderRadius.circular(1.5),
                  ),
                ),
                const SizedBox(height: 32),
                const Text(
                  "What do you want to clean?",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: ColorApp.textBlack,
                  ),
                ),
                const SizedBox(height: 24),
                Expanded(
                  child: GridView.builder(
                    physics: const BouncingScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.82,
                    ),
                    itemCount: _properties.length,
                    itemBuilder: (context, index) {
                      final item = _properties[index];
                      final isSelected = _selectedProperty == item.title;

                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedProperty = item.title;
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: isSelected ? ColorApp.primary : Colors.black.withValues(alpha: 0.05),
                              width: isSelected ? 3 : 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: isSelected ? ColorApp.primary.withValues(alpha: 0.08)
                                    : Colors.black.withValues(alpha: 0.02),
                                blurRadius: 15,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Top Gradient Portion
                              Expanded(
                                flex: 3,
                                child: Container(
                                  decoration: const BoxDecoration(
                                    borderRadius: BorderRadius.only(
                                      topLeft: Radius.circular(21),
                                      topRight: Radius.circular(21),
                                    ),
                                    gradient: LinearGradient(
                                      colors: [
                                        ColorApp.primary,
                                        ColorApp.primaryDark,
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                  ),
                                  child: Center(
                                    child: Icon(
                                      item.icon,
                                      color: Colors.white.withValues(alpha: 0.95),
                                      size: 44,
                                    ),
                                  ),
                                ),
                              ),
                              // Bottom Title Portion
                              Expanded(
                                flex: 2,
                                child: Container(
                                  decoration: const BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.only(
                                      bottomLeft: Radius.circular(21),
                                      bottomRight: Radius.circular(21),
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      item.title,
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                                        color: isSelected ? ColorApp.primary : ColorApp.textBlack,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          // Bottom next button
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, -5)),
                ],
              ),
              child: SafeArea(
                top: false,
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _selectedProperty == null
                        ? null
                        : () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => widget.isSubscription
                                    ? SubscriptionBookingPage(
                                        serviceName: widget.serviceName,
                                        propertyTypeName: _selectedProperty,
                                        serviceImage: widget.serviceImage,
                                      )
                                    : ServiceBookingPage(
                                        serviceName: widget.serviceName,
                                        service: widget.service,
                                        category: widget.category,
                                        serviceImage: widget.serviceImage,
                                        serviceIcon: widget.serviceIcon,
                                        selectedPropertyType:
                                            _selectedProperty,
                                      ),
                              ),
                            );
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ColorApp.primary,
                      disabledBackgroundColor: const Color(0xFFE2E8F0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      elevation: 0,
                    ),
                    child: Text(
                      "Next",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: _selectedProperty == null ? ColorApp.textGrey : Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
