import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/features/services/pages/services_page.dart';
import 'package:cleanapp/src/features/orders/pages/orders_page.dart';
import 'package:cleanapp/src/features/profile/pages/profile_page.dart';
import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/media_res.dart';
import 'package:cleanapp/src/features/services/pages/service_booking_page.dart';

class HomePage extends StatefulWidget {
  final int initialIndex;
  const HomePage({super.key, this.initialIndex = 0});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late int _selectedTab;

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
    _selectedTab = widget.initialIndex;
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
              _buildHomeView(context),
              const ServicesPage(),
              const OrdersPage(),
              const ProfilePage(),
            ],
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _buildBottomNavBar(context),
          ),
        ],
      ),
    );
  }

  Widget _buildHomeView(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          const SizedBox(height: 2),
          _buildHeroCarousel(context),
          const SizedBox(height: 4),
          _buildSectionHeader(context, l10n.recommendedServices,
              showViewAll: true),
          _buildHorizontalServices(context),
          const SizedBox(height: 4),
          _buildSectionHeader(context, l10n.ourServices),
          _buildServiceGrid(context),
          const SizedBox(height: 10),
          _buildBrandsSection(context),
          const SizedBox(height: 10),
          _buildCustomizeSection(context),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Container(
      padding: const EdgeInsets.fromLTRB(24, 50, 24, 12),
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
                    "Setif center ville",
                    style: const TextStyle(
                      color: ColorApp.textGrey,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Icon(Icons.keyboard_arrow_down_rounded,
                      color: ColorApp.textGrey, size: 16),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                "${l10n.hello},Moncef az",
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
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
              border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
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

  Widget _buildHeroCarousel(BuildContext context) {
    return SizedBox(
      height: 220,
      child: PageView(
        controller: _heroPageController,
        onPageChanged: (index) => _currentHeroIndex = index,
        children: [
          _buildBannerOnlyCard(MediaRes.promoBanner),
          _buildBannerOnlyCard(MediaRes.cleanAirBanner),
          _buildBannerOnlyCard(MediaRes.aidBanner),
        ],
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
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Image.asset(
          imagePath,
          fit: BoxFit.contain,
        ),
      ),
    );
  }

  Widget _buildHorizontalServices(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SizedBox(
      height: 220,
      child: ListView(
        controller: _recommendedController,
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 24),
        children: [
          _buildHorizontalCard(
            context,
            l10n.urgentCleaning,
            l10n.startingHours(3),
            "DA 69",
            const Color(0xFFFFF1F2),
            "assets/images/urgent.png",
          ),
          _buildHorizontalCard(
            context,
            l10n.subscriptionPack,
            l10n.fullMaintenance,
            "DA 120",
            const Color(0xFFF0FDF4),
            "assets/images/pack.png",
            isNew: true,
          ),
          _buildHorizontalCard(
            context,
            l10n.acServices,
            l10n.foamDeepCleaning,
            "DA 150",
            const Color(0xFFF0F9FF),
            MediaRes.acRepairIcon,
          ),
        ],
      ),
    );
  }

  Widget _buildHorizontalCard(BuildContext context, String title,
      String subtitle, String price, Color bgColor, String imageUrl,
      {bool isNew = false}) {
    final l10n = AppLocalizations.of(context)!;
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ServiceBookingPage(
              serviceName: title,
              serviceImage: imageUrl,
            ),
          ),
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
              color: Colors.black.withValues(alpha: 0.02),
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
                          child: Text(
                            l10n.newLabel,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 8,
                                fontWeight: FontWeight.w800),
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
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                        color: ColorApp.textBlack),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        subtitle,
                        style: const TextStyle(
                            color: ColorApp.textGrey,
                            fontSize: 11,
                            fontWeight: FontWeight.w800),
                      ),
                      Text(
                        price,
                        style: const TextStyle(
                            color: ColorApp.primary,
                            fontWeight: FontWeight.w800,
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

  Widget _buildServiceGrid(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final services = [
      {
        "name": l10n.laundry,
        "image": MediaRes.laundryIcon,
        "icon": Icons.local_laundry_service_rounded
      },
      {
        "name": l10n.carpet,
        "image": MediaRes.carpetIcon,
        "icon": Icons.texture_rounded
      },
      {
        "name": l10n.acRepair,
        "image": MediaRes.acRepairIcon,
        "icon": Icons.ac_unit_rounded
      },
      {
        "name": l10n.deepClean,
        "image": MediaRes.deepCleanIcon,
        "icon": Icons.auto_awesome_rounded
      },
      {"name": l10n.homeClean, "icon": Icons.home_work_rounded},
      {"name": l10n.carWash, "icon": Icons.directions_car_filled_rounded},
      {"name": l10n.shoeCare, "icon": Icons.shopping_bag_rounded},
      {"name": l10n.furniture, "icon": Icons.weekend_rounded},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 12,
        crossAxisSpacing: 16,
        childAspectRatio: 0.7,
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
                      serviceName: service["name"] as String,
                      serviceImage: service["image"] as String?,
                      serviceIcon: service["icon"] as IconData?,
                    ),
                  ),
                );
          },
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: service["image"] != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.asset(
                          service["image"] as String,
                          width: 48,
                          height: 48,
                          fit: BoxFit.cover,
                        ),
                      )
                    : Icon(service["icon"] as IconData,
                        color: ColorApp.primary, size: 32),
              ),
              const SizedBox(height: 8),
              Text(
                services[index]["name"] as String,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: ColorApp.textBlack,
                  height: 1,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBrandsSection(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(context, l10n.officialPartners),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
          child: Row(
            children: [
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ServiceBookingPage(
                        serviceName: "Dior",
                        serviceIcon: Icons.verified_rounded,
                      ),
                    ),
                  );
                },
                child: _buildBrandCard(
                    l10n.luxuryCare, "Dior", const Color(0xFFF1F5F9)),
              ),
              const SizedBox(width: 16),
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ServiceBookingPage(
                        serviceName: "Nadhif Kids",
                        serviceIcon: Icons.child_care_rounded,
                      ),
                    ),
                  );
                },
                child: _buildBrandCard(
                    l10n.babySafe, "Nadhif Kids", const Color(0xFFFFF7ED)),
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
        border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
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
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: const TextStyle(
                      fontWeight: FontWeight.w800,
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

  Widget _buildSectionHeader(BuildContext context, String title,
      {bool showViewAll = false}) {
    final l10n = AppLocalizations.of(context)!;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 18,
                color: ColorApp.textBlack,
                letterSpacing: -0.5),
          ),
          if (showViewAll)
            Text(
              l10n.seeAll,
              style: const TextStyle(
                  color: ColorApp.primary,
                  fontWeight: FontWeight.w700,
                  fontSize: 13),
            ),
        ],
      ),
    );
  }

  Widget _buildCustomizeSection(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
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
              color: Colors.black.withValues(alpha: 0.2),
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
                Text(
                  l10n.exclusiveOffers,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      height: 1.1),
                ),
                const SizedBox(height: 10),
                Text(
                  l10n.joinPremium,
                  style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
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
                  child: Text(l10n.joinNow,
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 13)),
                )
              ],
            ),
          ),
          Icon(Icons.stars_rounded,
              size: 60, color: Colors.white.withValues(alpha: 0.1)),
        ],
      ),
    );
  }

  Widget _buildBottomNavBar(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Container(
      margin: const EdgeInsets.only(left: 20, right: 20, bottom: 24),
      height: 80,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 30,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(0, l10n.homeLabel, Icons.home_rounded),
          _buildNavItem(1, l10n.servicesLabel, Icons.grid_view_rounded),
          _buildNavItem(2, l10n.ordersLabel, Icons.receipt_long_rounded),
          _buildNavItem(3, l10n.profileLabel, Icons.person_rounded),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, String label, IconData icon) {
    final isActive = _selectedTab == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isActive
              ? ColorApp.primary.withValues(alpha: 0.12)
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
