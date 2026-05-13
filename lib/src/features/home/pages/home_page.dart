import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/features/services/pages/services_page.dart';
import 'package:cleanapp/src/features/orders/pages/orders_page.dart';
import 'package:cleanapp/src/features/profile/pages/profile_page.dart';

import 'package:cleanapp/src/features/services/pages/service_booking_page.dart';

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

  final double _recommendedCardWidth = 220.0;

  @override
  void initState() {
    super.initState();
    _recommendedController = ScrollController();
    _heroPageController = PageController();
    _startAutoScrolls();
  }

  void _startAutoScrolls() {
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
      backgroundColor: const Color(0xFFF9F9F9),
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
          const SizedBox(height: 10),
          _buildHeroCarousel(),
          const SizedBox(height: 12),
          _buildSectionHeader("Recommended Services", showViewAll: true),
          _buildHorizontalServices(),
          const SizedBox(height: 24),
          _buildSectionHeader("Our Services"),
          _buildServiceGrid(),
          const SizedBox(height: 32),
          _buildBrandsSection(),
          const SizedBox(height: 32),
          _buildCustomizeSection(),
          const SizedBox(height: 140),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 60, 24, 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on_rounded,
                      color: ColorApp.primary, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    "Home, West Bay",
                    style: TextStyle(
                      color: ColorApp.textGrey.withOpacity(0.8),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Icon(Icons.keyboard_arrow_down_rounded,
                      color: ColorApp.textGrey, size: 16),
                ],
              ),
              const SizedBox(height: 4),
              const Text(
                "Hello, John Doe 👋",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: ColorApp.textBlack,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: ColorApp.softGrey,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.black.withOpacity(0.05)),
            ),
            child: const Badge(
              label: Text("2"),
              backgroundColor: ColorApp.primary,
              child: Icon(Icons.notifications_outlined,
                  color: ColorApp.textBlack, size: 22),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroCarousel() {
    return SizedBox(
      height: 220,
      child: PageView(
        controller: _heroPageController,
        onPageChanged: (index) => _currentHeroIndex = index,
        children: [
          _buildHeroCard(
            "WELCOME TO NADHIF",
            "Professional cleaning\nservices at your door",
            const [ColorApp.primary, Color(0xFF00BFA5)],
          ),
          _buildBannerOnlyCard("assets/images/cleanair.png"),
          _buildOfferCard(
            "FLASH SALE",
            "Home Deep Cleaning\nPackage",
            "Special 30% discount",
            "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=400",
          ),
        ],
      ),
    );
  }

  Widget _buildHeroCard(String tag, String title, List<Color> colors) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: colors[0].withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              tag,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w900),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w900,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              "Book Now",
              style: TextStyle(
                  color: ColorApp.primary,
                  fontWeight: FontWeight.w800,
                  fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOfferCard(
      String tag, String title, String subtitle, String imageUrl) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Row(
          children: [
            Expanded(
              flex: 3,
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      tag,
                      style: const TextStyle(
                        color: ColorApp.primary,
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        height: 1.2,
                        color: ColorApp.textBlack,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                          color: ColorApp.textGrey.withOpacity(0.7),
                          fontSize: 11,
                          fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Image.network(
                imageUrl,
                height: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    Container(color: ColorApp.softGrey),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBannerOnlyCard(String imagePath) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Image.asset(
          imagePath,
          fit: BoxFit.cover,
        ),
      ),
    );
  }

  Widget _buildHorizontalServices() {
    return SizedBox(
      height: 220,
      child: ListView(
        controller: _recommendedController,
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 24),
        children: [
          _buildHorizontalCard(
            "Urgent Cleaning",
            "Starting 3 Hours",
            "DA 69",
            const Color(0xFFFFF1F2),
            "assets/images/urgent.png",
          ),
          _buildHorizontalCard(
            "Subscription Pack",
            "Full Maintenance",
            "DA 120",
            const Color(0xFFF0FDF4),
            "assets/images/pack.png",
            isNew: true,
          ),
          _buildHorizontalCard(
            "AC Services",
            "Foam Deep Cleaning",
            "DA 150",
            const Color(0xFFF0F9FF),
            "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200",
          ),
        ],
      ),
    );
  }

  Widget _buildHorizontalCard(String title, String subtitle, String price,
      Color bgColor, String imageUrl,
      {bool isNew = false}) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => ServiceBookingPage(serviceName: title)),
        );
      },
      child: Container(
        width: 200,
        margin: const EdgeInsets.only(right: 16, bottom: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(28),
                    topRight: Radius.circular(28),
                  ),
                ),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(28),
                          topRight: Radius.circular(28),
                        ),
                        child: imageUrl.startsWith('http')
                            ? Image.network(imageUrl, fit: BoxFit.fitWidth)
                            : Image.asset(imageUrl, fit: BoxFit.fitWidth),
                      ),
                    ),
                    if (isNew)
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: ColorApp.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            "NEW",
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 8,
                                fontWeight: FontWeight.w900),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 15,
                        color: ColorApp.textBlack),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        subtitle,
                        style: TextStyle(
                            color: ColorApp.textGrey.withOpacity(0.7),
                            fontSize: 11,
                            fontWeight: FontWeight.w500),
                      ),
                      Text(
                        price,
                        style: const TextStyle(
                            color: ColorApp.primary,
                            fontWeight: FontWeight.w900,
                            fontSize: 13),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceGrid() {
    final services = [
      {"name": "Laundry", "icon": Icons.local_laundry_service_rounded},
      {"name": "Home Clean", "icon": Icons.home_work_rounded},
      {"name": "Car Wash", "icon": Icons.directions_car_filled_rounded},
      {"name": "Carpet", "icon": Icons.texture_rounded},
      {"name": "Shoe Care", "icon": Icons.shopping_bag_rounded},
      {"name": "AC Repair", "icon": Icons.ac_unit_rounded},
      {"name": "Furniture", "icon": Icons.weekend_rounded},
      {"name": "Deep Clean", "icon": Icons.auto_awesome_rounded},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 20,
        crossAxisSpacing: 16,
        childAspectRatio: 0.75,
      ),
      itemCount: services.length,
      itemBuilder: (context, index) {
        final service = services[index];
        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => ServiceBookingPage(
                      serviceName: service["name"] as String)),
            );
          },
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(services[index]["icon"] as IconData,
                    color: ColorApp.primary, size: 24),
              ),
              const SizedBox(height: 8),
              Text(
                services[index]["name"] as String,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: ColorApp.textBlack,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBrandsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader("Official Partners"),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Row(
            children: [
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) =>
                            ServiceBookingPage(serviceName: "Dior")),
                  );
                },
                child: _buildBrandCard(
                    "Luxury Care", "Dior", const Color(0xFFF1F5F9)),
              ),
              const SizedBox(width: 16),
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) =>
                            ServiceBookingPage(serviceName: "Nadhif Kids")),
                  );
                },
                child: _buildBrandCard(
                    "Baby Safe", "Nadhif Kids", const Color(0xFFFFF7ED)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBrandCard(String title, String subtitle, Color bgColor) {
    return Container(
      width: 200,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  subtitle,
                  style: const TextStyle(
                      color: ColorApp.primary,
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 15,
                      color: ColorApp.textBlack),
                )
              ],
            ),
          ),
          const Icon(Icons.verified_rounded, size: 24, color: ColorApp.primary),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, {bool showViewAll = false}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 18,
                color: ColorApp.textBlack,
                letterSpacing: -0.5),
          ),
          if (showViewAll)
            const Text(
              "See All",
              style: TextStyle(
                  color: ColorApp.primary,
                  fontWeight: FontWeight.w800,
                  fontSize: 13),
            ),
        ],
      ),
    );
  }

  Widget _buildCustomizeSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ColorApp.textBlack, Color(0xFF475569)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 20,
              offset: const Offset(0, 10)),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Exclusive Offers\nfor You",
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      height: 1.1),
                ),
                const SizedBox(height: 10),
                Text(
                  "Join our premium membership!",
                  style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 12,
                      fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 20),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                      color: ColorApp.primary,
                      borderRadius: BorderRadius.circular(12)),
                  child: const Text("Join Now",
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 13)),
                )
              ],
            ),
          ),
          Icon(Icons.stars_rounded,
              size: 60, color: Colors.white.withOpacity(0.1)),
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
