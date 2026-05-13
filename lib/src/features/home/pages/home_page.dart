import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/features/services/pages/services_page.dart';
import 'package:cleanapp/src/features/orders/pages/orders_page.dart';
import 'package:cleanapp/src/features/profile/pages/profile_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedTab = 0;

  // Controllers for auto-scrolling
  late ScrollController _recommendedController;
  late PageController _heroPageController;

  Timer? _recommendedTimer;
  Timer? _heroTimer;

  int _currentRecommendedIndex = 0;
  int _currentHeroIndex = 0;

  final double _recommendedCardWidth = 206.0;

  @override
  void initState() {
    super.initState();
    _recommendedController = ScrollController();
    _heroPageController = PageController();
    _startAutoScrolls();
  }

  void _startAutoScrolls() {
    // Timer for Recommended Services
    _recommendedTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_recommendedController.hasClients && _selectedTab == 0) {
        _currentRecommendedIndex++;
        if (_currentRecommendedIndex >= 3) {
          _currentRecommendedIndex = 0;
          _recommendedController.animateTo(0,
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeInOutBack);
        } else {
          _recommendedController.animateTo(
              _currentRecommendedIndex * _recommendedCardWidth,
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeInOutCubic);
        }
      }
    });

    // Timer for Hero Carousel
    _heroTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (_heroPageController.hasClients && _selectedTab == 0) {
        _currentHeroIndex++;
        if (_currentHeroIndex >= 3) {
          _currentHeroIndex = 0;
          _heroPageController.animateToPage(0,
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeInOutCubic);
        } else {
          _heroPageController.nextPage(
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeInOutCubic);
        }
      }
    });
  }

  @override
  void dispose() {
    _recommendedTimer?.cancel();
    _heroTimer?.cancel();
    _recommendedController.dispose();
    _heroPageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          IndexedStack(
            index: _selectedTab,
            children: [
              _buildHomeView(),
              const ServicesPage(),
              const OrdersPage(),
              const ProfilePage(),
            ],
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _buildBottomNavBar(),
          ),
        ],
      ),
    );
  }

  Widget _buildHomeView() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          _buildHeroCarousel(), // Now a carousel
          const SizedBox(height: 12),
          _buildSectionHeader("Recommended Services", showViewAll: true),
          _buildHorizontalServices(),
          const SizedBox(height: 12),
          _buildSectionHeader("Our Services"),
          _buildServiceGrid(),
          const SizedBox(height: 32),
          _buildBrandsSection(),
          const SizedBox(height: 32),
          _buildCustomizeSection(),
          const SizedBox(height: 120),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.only(top: 60, left: 20, right: 20, bottom: 10),
      color: ColorApp.primary,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.cleaning_services_rounded,
                    color: ColorApp.primary, size: 24),
              ),
              const SizedBox(width: 10),
              const Text(
                "Nadhif",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white.withOpacity(0.5)),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                Icon(Icons.language, size: 16, color: Colors.white),
                SizedBox(width: 4),
                Text("EN",
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: Colors.white)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroCarousel() {
    return SizedBox(
      height: 240,
      child: PageView(
        controller: _heroPageController,
        onPageChanged: (index) => _currentHeroIndex = index,
        children: [
          _buildHeroCard(),
          _buildOfferCard(
            "NEW OFFER",
            "Washing machine\nmaintenance",
            "Quality service at your door",
            "https://images.unsplash.com/photo-1582733775062-eb92170f5de0?w=400",
          ),
          _buildOfferCard(
            "FLASH SALE",
            "Home Deep Cleaning\nPackage",
            "Special 30% discount today",
            "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=400",
          ),
        ],
      ),
    );
  }

  Widget _buildHeroCard() {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ColorApp.primary, Color(0xFF00BFA5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: ColorApp.primary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            "WELCOME TO NADHIF",
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w900,
                height: 1.1),
          ),
          const SizedBox(height: 8),
          const Text(
            "كل الخدمات المنزلية التي تحتاجها في بلاصة وحدة مع تطبيق نظيف",
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 16,
                height: 1.4),
          ),
          const SizedBox(height: 16),
          _buildHeroButton("Book Now", Colors.white, ColorApp.primary),
        ],
      ),
    );
  }

  Widget _buildOfferCard(
      String tag, String title, String subtitle, String imageUrl) {
    return Container(
      margin: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: ColorApp.greyBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              flex: 3,
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: ColorApp.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(tag,
                          style: const TextStyle(
                              color: ColorApp.primary,
                              fontSize: 9,
                              fontWeight: FontWeight.w900)),
                    ),
                    const SizedBox(height: 12),
                    Text(title,
                        style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 16,
                            height: 1.2,
                            color: Color(0xFF1E293B))),
                    const SizedBox(height: 6),
                    Text(subtitle,
                        style: const TextStyle(
                            color: ColorApp.textGrey, fontSize: 11)),
                    const SizedBox(height: 12),
                    Text("Book Now",
                        style: TextStyle(
                            color: ColorApp.primary,
                            fontWeight: FontWeight.w900,
                            fontSize: 13)),
                  ],
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Image.network(
                imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                    color: const Color(0xFFF0FDFA),
                    child: const Icon(Icons.settings_suggest,
                        color: ColorApp.primary)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroButton(String text, Color bgColor, Color textColor) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(
            color: textColor, fontWeight: FontWeight.w800, fontSize: 14),
      ),
    );
  }

  Widget _buildHorizontalServices() {
    return SizedBox(
      height: 240,
      child: ListView(
        controller: _recommendedController,
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        children: [
          _buildHorizontalCard(
              "Home Cleaning",
              "Starting\n3 Hours",
              "QAR 69*",
              const Color(0xFFF0FDFA),
              "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=200"),
          _buildHorizontalCard(
              "Washing Machine",
              "Washing\nMachine Service",
              "30 DAY WARRANTY",
              const Color(0xFFF0FDF4),
              "https://images.unsplash.com/photo-1582733775062-eb92170f5de0?w=200",
              isNew: true),
          _buildHorizontalCard(
              "AC Services",
              "Foam\nDeep Cleaning",
              "PREMIUM CARE",
              const Color(0xFFF0F9FF),
              "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200"),
        ],
      ),
    );
  }

  Widget _buildHorizontalCard(String title, String subtitle, String price,
      Color bgColor, String imageUrl,
      {bool isNew = false}) {
    return Container(
      width: 190,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: ColorApp.primary.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                    child: Text(title,
                        style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: ColorApp.primary),
                        overflow: TextOverflow.ellipsis)),
                if (isNew)
                  Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                          color: ColorApp.primary,
                          borderRadius: BorderRadius.circular(8)),
                      child: const Text("NEW",
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 8,
                              fontWeight: FontWeight.w900))),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(subtitle,
                style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF1E293B),
                    height: 1.1)),
          ),
          const Spacer(),
          Center(
              child: Image.network(imageUrl,
                  height: 90,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => const Icon(
                      Icons.broken_image,
                      size: 50,
                      color: Colors.grey))),
          const Spacer(),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: const BoxDecoration(
                color: ColorApp.primary,
                borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(28),
                    bottomRight: Radius.circular(28))),
            child: Text(price,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 13)),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceGrid() {
    final services = [
      {"name": "Laundry", "icon": Icons.local_laundry_service_rounded},
      {"name": "Home Cleaning", "icon": Icons.home_work_rounded},
      {"name": "Car Wash", "icon": Icons.directions_car_filled_rounded},
      {"name": "Carpet Cleaning", "icon": Icons.texture_rounded},
      {"name": "Shoe Care", "icon": Icons.shopping_bag_rounded},
      {"name": "Charity", "icon": Icons.favorite_rounded},
      {"name": "Furniture", "icon": Icons.weekend_rounded},
      {"name": "Deep Clean", "icon": Icons.auto_awesome_rounded},
      {"name": "AC Services", "icon": Icons.ac_unit_rounded},
      {"name": "Pest Control", "icon": Icons.bug_report_rounded},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.8,
      ),
      itemCount: services.length,
      itemBuilder: (context, index) {
        return Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0A000000),
                    blurRadius: 15,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(services[index]["icon"] as IconData,
                  color: ColorApp.primary, size: 28),
            ),
            const SizedBox(height: 6),
            Text(
              services[index]["name"] as String,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: Color(0xFF475569),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildBrandsSection() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          _buildBrandCard("Luxury\nLaundry", "Dior"),
          const SizedBox(width: 16),
          _buildBrandCard("Baby\nLaundry", "New Launch", isBaby: true),
        ],
      ),
    );
  }

  Widget _buildBrandCard(String title, String subtitle, {bool isBaby = false}) {
    return Container(
      width: 220,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: ColorApp.greyBorder)),
      child: Row(
        children: [
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                if (isBaby)
                  const Text("NEW LAUNCH",
                      style: TextStyle(
                          color: ColorApp.primary,
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5)),
                const SizedBox(height: 4),
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 17,
                        color: Color(0xFF1E293B)))
              ])),
          if (!isBaby)
            const Text("Dior",
                style: TextStyle(
                    fontFamily: 'Serif',
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: ColorApp.primary)),
          if (isBaby)
            const Icon(Icons.child_friendly_rounded,
                size: 38, color: ColorApp.primary),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, {bool showViewAll = false}) {
    return Padding(
      padding: const EdgeInsets.only(left: 20, right: 20, bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 19,
                  color: Color(0xFF0F172A))),
          if (showViewAll)
            const Text("View All",
                style: TextStyle(
                    color: ColorApp.primary,
                    fontWeight: FontWeight.w700,
                    fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildCustomizeSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
            colors: [ColorApp.primary, Color(0xFF00BFA5)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
              color: ColorApp.primary.withOpacity(0.3),
              blurRadius: 25,
              offset: const Offset(0, 12))
        ],
      ),
      child: Row(
        children: [
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                const Text("Customize your\nexperience",
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        height: 1.1)),
                const SizedBox(height: 10),
                const Text("Tailor Nadhif to your preferences!",
                    style: TextStyle(
                        color: Colors.white70,
                        fontSize: 13,
                        fontWeight: FontWeight.w500)),
                const SizedBox(height: 20),
                ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: ColorApp.primary,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16))),
                    child: const Text("Explore Now",
                        style: TextStyle(fontWeight: FontWeight.w800)))
              ])),
          const Icon(Icons.auto_fix_high_rounded,
              size: 70, color: Colors.white24),
        ],
      ),
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      margin: const EdgeInsets.only(left: 20, right: 20, bottom: 24),
      height: 80,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 30,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(0, Icons.home_filled, "Home"),
          _buildNavItem(1, Icons.electric_bolt_rounded, "Services"),
          _buildNavItem(2, Icons.receipt_long_rounded, "Orders"),
          _buildNavItem(3, Icons.person_rounded, "Profile"),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isActive = _selectedTab == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isActive
              ? ColorApp.primary.withOpacity(0.12)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(32),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isActive ? ColorApp.primary : const Color(0xFF64748B),
              size: 28,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isActive ? ColorApp.primary : const Color(0xFF64748B),
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w900 : FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
