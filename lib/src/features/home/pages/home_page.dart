import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/media_res.dart';
import 'package:cleanapp/src/core/res/shadows.dart';
import 'package:cleanapp/src/features/home/cubit/home_tab_cubit.dart';
import 'package:cleanapp/src/features/orders/pages/orders_page.dart';
import 'package:cleanapp/src/features/profile/data/user_profile.dart';
import 'package:cleanapp/src/features/profile/pages/profile_page.dart';
import 'package:cleanapp/src/features/services/pages/service_booking_page.dart';
import 'package:cleanapp/src/features/services/pages/services_page.dart';
import 'package:cleanapp/src/features/home/pages/location_setup_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomePage extends StatefulWidget {
  final int initialIndex;
  final ProfileRepository profileRepository;

  const HomePage({
    super.key,
    this.initialIndex = 0,
    this.profileRepository = const InMemoryProfileRepository(),
  });

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage>
    with WidgetsBindingObserver {
  static const List<String> _heroBanners = <String>[
    MediaRes.promoBanner,
    MediaRes.cleanAirBanner,
    MediaRes.aidBanner,
  ];

  static const double _recommendedCardWidth = 220.0;
  static const int _recommendedCount = 3;
  static const Duration _recommendedInterval = Duration(seconds: 4);
  static const Duration _heroInterval = Duration(seconds: 5);

  late final HomeTabCubit _tabCubit;
  late final ScrollController _recommendedController;
  late final PageController _heroPageController;

  Timer? _recommendedTimer;
  Timer? _heroTimer;
  int _currentRecommendedIndex = 0;
  int _currentHeroIndex = 0;
  bool _isAppActive = true;
  late String _currentLocation;

  @override
  void initState() {
    super.initState();
    _tabCubit = HomeTabCubit(widget.initialIndex);
    _recommendedController = ScrollController();
    _heroPageController = PageController();
    _currentLocation = widget.profileRepository.getCurrentUser().location;
    WidgetsBinding.instance.addObserver(this);
    _startAutoScrolls();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final bool nextActive = state == AppLifecycleState.resumed;
    if (nextActive == _isAppActive) return;
    _isAppActive = nextActive;
    if (_isAppActive) {
      _startAutoScrolls();
    } else {
      _cancelAutoScrolls();
    }
  }

  bool get _autoScrollAllowed => _isAppActive && _tabCubit.state == 0;

  void _startAutoScrolls() {
    _cancelAutoScrolls();
    _recommendedTimer = Timer.periodic(_recommendedInterval, (_) {
      if (!_autoScrollAllowed || !_recommendedController.hasClients) return;
      _currentRecommendedIndex =
          (_currentRecommendedIndex + 1) % _recommendedCount;
      _recommendedController.animateTo(
        _currentRecommendedIndex * _recommendedCardWidth,
        duration: const Duration(milliseconds: 1000),
        curve: Curves.easeInOutCubic,
      );
    });

    _heroTimer = Timer.periodic(_heroInterval, (_) {
      if (!_autoScrollAllowed || !_heroPageController.hasClients) return;
      _currentHeroIndex = (_currentHeroIndex + 1) % _heroBanners.length;
      _heroPageController.animateToPage(
        _currentHeroIndex,
        duration: const Duration(milliseconds: 1000),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  void _cancelAutoScrolls() {
    _recommendedTimer?.cancel();
    _heroTimer?.cancel();
    _recommendedTimer = null;
    _heroTimer = null;
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cancelAutoScrolls();
    _recommendedController.dispose();
    _heroPageController.dispose();
    _tabCubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _tabCubit,
      child: Scaffold(
        backgroundColor: ColorApp.scaffoldBg,
        body: Stack(
          children: [
            BlocBuilder<HomeTabCubit, int>(
              builder: (context, selectedTab) => IndexedStack(
                index: selectedTab,
                children: [
                  _buildHomeView(context),
                  const ServicesPage(),
                  const OrdersPage(),
                  const ProfilePage(),
                ],
              ),
            ),
            const Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: _BottomNavBar(),
            ),
          ],
        ),
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
          _buildHeroCarousel(),
          const SizedBox(height: 4),
          _SectionHeader(title: l10n.recommendedServices, showViewAll: true),
          _buildHorizontalServices(context),
          const SizedBox(height: 4),
          _SectionHeader(title: l10n.ourServices),
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
    final user = widget.profileRepository.getCurrentUser();
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
          GestureDetector(
            onTap: () async {
              final newLocation = await Navigator.push<String>(
                context,
                MaterialPageRoute(builder: (context) => const LocationSetupPage()),
              );
              if (newLocation != null) {
                setState(() {
                  _currentLocation = newLocation;
                });
              }
            },
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded,
                        color: ColorApp.primary, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      _currentLocation,
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
                  '${l10n.hello}, ${user.firstName}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: ColorApp.textBlack,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: ColorApp.softGrey,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
            ),
            child: const Badge(
              label: Text('2'),
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
      child: PageView.builder(
        controller: _heroPageController,
        onPageChanged: (index) => _currentHeroIndex = index,
        itemCount: _heroBanners.length,
        itemBuilder: (context, index) =>
            _BannerOnlyCard(imagePath: _heroBanners[index]),
      ),
    );
  }

  Widget _buildHorizontalServices(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final cards = <_RecommendedCardData>[
      _RecommendedCardData(
        title: l10n.urgentCleaning,
        subtitle: l10n.startingHours(3),
        price: 'DA 69',
        bgColor: ColorApp.tintRose,
        imageUrl: 'assets/images/urgent.png',
      ),
      _RecommendedCardData(
        title: l10n.subscriptionPack,
        subtitle: l10n.fullMaintenance,
        price: 'DA 120',
        bgColor: ColorApp.tintMint,
        imageUrl: 'assets/images/pack.png',
        isNew: true,
      ),
      _RecommendedCardData(
        title: l10n.acServices,
        subtitle: l10n.foamDeepCleaning,
        price: 'DA 150',
        bgColor: ColorApp.tintSky,
        imageUrl: MediaRes.acRepairIcon,
      ),
    ];

    return SizedBox(
      height: 220,
      child: ListView.builder(
        controller: _recommendedController,
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 24),
        itemCount: cards.length,
        itemBuilder: (context, index) =>
            _HorizontalServiceCard(data: cards[index]),
      ),
    );
  }

  Widget _buildServiceGrid(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final services = <_ServiceTile>[
      _ServiceTile(
        name: l10n.laundry,
        image: MediaRes.laundryIcon,
        icon: Icons.local_laundry_service_rounded,
      ),
      _ServiceTile(
        name: l10n.carpet,
        image: MediaRes.carpetIcon,
        icon: Icons.texture_rounded,
      ),
      _ServiceTile(
        name: l10n.acRepair,
        image: MediaRes.acRepairIcon,
        icon: Icons.ac_unit_rounded,
      ),
      _ServiceTile(
        name: l10n.deepClean,
        image: MediaRes.deepCleanIcon,
        icon: Icons.auto_awesome_rounded,
      ),
      _ServiceTile(
        name: l10n.homeClean,
        image: MediaRes.fastCleanIcon,
        icon: Icons.home_work_rounded,
      ),
      _ServiceTile(
        name: l10n.carWash,
        image: MediaRes.carWashIcon,
        icon: Icons.directions_car_filled_rounded,
      ),
      _ServiceTile(name: l10n.shoeCare, icon: Icons.shopping_bag_rounded),
      _ServiceTile(
        name: l10n.furniture,
        image: MediaRes.furnitureIcon,
        icon: Icons.weekend_rounded,
      ),
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
      itemBuilder: (context, index) =>
          _ServiceGridTile(service: services[index]),
    );
  }

  Widget _buildBrandsSection(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeader(title: l10n.officialPartners),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
          child: Row(
            children: [
              _BrandCard(
                title: l10n.luxuryCare,
                subtitle: 'Dior',
                bgColor: ColorApp.tintSlate,
                serviceIcon: Icons.verified_rounded,
              ),
              const SizedBox(width: 16),
              _BrandCard(
                title: l10n.babySafe,
                subtitle: 'Nadhif Kids',
                bgColor: ColorApp.tintAmberSoft,
                serviceIcon: Icons.child_care_rounded,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCustomizeSection(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ColorApp.textBlack, ColorApp.gradientSecondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
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
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  l10n.joinPremium,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: ColorApp.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    l10n.joinNow,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.stars_rounded,
            size: 60,
            color: Colors.white.withValues(alpha: 0.1),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final bool showViewAll;

  const _SectionHeader({required this.title, this.showViewAll = false});

  @override
  Widget build(BuildContext context) {
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
              letterSpacing: -0.5,
            ),
          ),
          if (showViewAll)
            Text(
              l10n.seeAll,
              style: const TextStyle(
                color: ColorApp.primary,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
        ],
      ),
    );
  }
}

class _BannerOnlyCard extends StatelessWidget {
  final String imagePath;
  const _BannerOnlyCard({required this.imagePath});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.all(Radius.circular(32)),
        boxShadow: AppShadows.elevated,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Image.asset(imagePath, fit: BoxFit.contain),
      ),
    );
  }
}

class _RecommendedCardData {
  final String title;
  final String subtitle;
  final String price;
  final Color bgColor;
  final String imageUrl;
  final bool isNew;

  const _RecommendedCardData({
    required this.title,
    required this.subtitle,
    required this.price,
    required this.bgColor,
    required this.imageUrl,
    this.isNew = false,
  });
}

class _HorizontalServiceCard extends StatelessWidget {
  final _RecommendedCardData data;
  const _HorizontalServiceCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ServiceBookingPage(
              serviceName: data.title,
              serviceImage: data.imageUrl,
            ),
          ),
        );
      },
      child: Container(
        width: 200,
        margin: const EdgeInsets.only(right: 16, bottom: 8),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(28)),
          boxShadow: AppShadows.cardSubtle,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(28),
                        topRight: Radius.circular(28),
                      ),
                      child: data.imageUrl.startsWith('http')
                          ? CachedNetworkImage(
                              imageUrl: data.imageUrl,
                              fit: BoxFit.fitWidth,
                              placeholder: (_, __) => Container(
                                color: ColorApp.softGrey,
                              ),
                              errorWidget: (_, __, ___) => Container(
                                color: ColorApp.softGrey,
                                child: const Icon(Icons.image_not_supported,
                                    color: ColorApp.textGrey),
                              ),
                            )
                          : Image.asset(data.imageUrl, fit: BoxFit.fitWidth),
                    ),
                  ),
                  if (data.isNew)
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
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    data.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                      color: ColorApp.textBlack,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          data.subtitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: ColorApp.textGrey,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        data.price,
                        style: const TextStyle(
                          color: ColorApp.primary,
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                        ),
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
}

class _ServiceTile {
  final String name;
  final String? image;
  final IconData icon;

  const _ServiceTile({
    required this.name,
    required this.icon,
    this.image,
  });
}

class _ServiceGridTile extends StatelessWidget {
  final _ServiceTile service;
  const _ServiceGridTile({required this.service});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ServiceBookingPage(
              serviceName: service.name,
              serviceImage: service.image,
              serviceIcon: service.icon,
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
            child: service.image != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.asset(
                      service.image!,
                      width: 48,
                      height: 48,
                      fit: BoxFit.cover,
                    ),
                  )
                : Icon(service.icon, color: ColorApp.primary, size: 32),
          ),
          const SizedBox(height: 8),
          Text(
            service.name,
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
  }
}

class _BrandCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final Color bgColor;
  final IconData serviceIcon;

  const _BrandCard({
    required this.title,
    required this.subtitle,
    required this.bgColor,
    required this.serviceIcon,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ServiceBookingPage(
              serviceName: subtitle,
              serviceIcon: serviceIcon,
            ),
          ),
        );
      },
      child: Container(
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
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                      color: ColorApp.textBlack,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.verified_rounded,
                size: 24, color: ColorApp.primary),
          ],
        ),
      ),
    );
  }
}

class _BottomNavBar extends StatelessWidget {
  const _BottomNavBar();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final selectedIndex = context.watch<HomeTabCubit>().state;
    return Container(
      margin: const EdgeInsets.only(left: 20, right: 20, bottom: 24),
      height: 80,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(Radius.circular(32)),
        boxShadow: AppShadows.bottomBar,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _NavItem(
            index: 0,
            label: l10n.homeLabel,
            icon: Icons.home_rounded,
            isActive: selectedIndex == 0,
          ),
          _NavItem(
            index: 1,
            label: l10n.servicesLabel,
            icon: Icons.grid_view_rounded,
            isActive: selectedIndex == 1,
          ),
          _NavItem(
            index: 2,
            label: l10n.ordersLabel,
            icon: Icons.receipt_long_rounded,
            isActive: selectedIndex == 2,
          ),
          _NavItem(
            index: 3,
            label: l10n.profileLabel,
            icon: Icons.person_rounded,
            isActive: selectedIndex == 3,
          ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final int index;
  final String label;
  final IconData icon;
  final bool isActive;

  const _NavItem({
    required this.index,
    required this.label,
    required this.icon,
    required this.isActive,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.read<HomeTabCubit>().select(index),
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
              color: isActive ? ColorApp.primary : ColorApp.textGrey,
              size: 28,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isActive ? ColorApp.primary : ColorApp.textGrey,
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
