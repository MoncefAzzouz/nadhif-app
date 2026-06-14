import 'dart:async';
import 'dart:ui';

import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/media_res.dart';
import 'package:cleanapp/src/core/res/shadows.dart';
import 'package:cleanapp/src/core/services/auth_token_store.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/core/widgets/app_image.dart';
import 'package:cleanapp/src/features/home/cubit/home_content_cubit.dart';
import 'package:cleanapp/src/features/home/cubit/home_tab_cubit.dart';
import 'package:cleanapp/src/features/home/pages/location_setup_page.dart';
import 'package:cleanapp/src/features/orders/data/orders_api_service.dart';
import 'package:cleanapp/src/features/orders/pages/orders_page.dart';
import 'package:cleanapp/src/features/profile/data/user_profile.dart';
import 'package:cleanapp/src/features/profile/pages/profile_page.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:cleanapp/src/features/services/pages/service_booking_page.dart';
import 'package:cleanapp/src/features/services/pages/service_details_page.dart';
import 'package:cleanapp/src/features/services/pages/services_page.dart';
import 'package:cleanapp/src/features/services/pages/rapid_selection_page.dart';
import 'package:cleanapp/src/features/slides/data/slides_api_service.dart';
import 'package:cleanapp/src/features/subscriptions/pages/subscriptions_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomePage extends StatefulWidget {
  final int initialIndex;
  final ProfileRepository profileRepository;

  const HomePage({
    super.key,
    this.initialIndex = 0,
    this.profileRepository = const ApiProfileRepository(),
  });

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with WidgetsBindingObserver {
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
  late final HomeContentCubit _contentCubit;
  late final ScrollController _recommendedController;
  late final PageController _heroPageController;

  Timer? _recommendedTimer;
  Timer? _heroTimer;
  int _currentRecommendedIndex = 0;
  int _currentHeroIndex = 0;

  /// Image sources driving the hero carousel: backend slides if any, else the
  /// bundled fallback banners.
  List<String> get _heroSources {
    final slides = _contentCubit.state.slides;
    return slides.isNotEmpty
        ? slides.map((s) => s.imageUrl).toList()
        : _heroBanners;
  }

  bool _isAppActive = true;
  late String _currentLocation;
  UserProfile? _profile;
  int _activeOrdersCount = 0;

  // Actual number of cards in the rail (dynamic once backend data loads).
  int _recommendedCardsCount = _recommendedCount;

  @override
  void initState() {
    super.initState();
    _tabCubit = HomeTabCubit(widget.initialIndex);
    _contentCubit = context.read<HomeContentCubit>();
    _recommendedController = ScrollController();
    _heroPageController = PageController();
    _currentLocation = 'Setif center ville';
    _loadProfile();
    _loadOrdersCount();
    WidgetsBinding.instance.addObserver(this);
    _startAutoScrolls();
  }

  /// Opens the service/category named by the slide's actionRoute, if any.
  void _openSlide(AppSlide slide) {
    final route = slide.actionRoute.trim().toLowerCase();
    if (route.isEmpty) return;
    final localeCode = Localizations.localeOf(context).languageCode;
    final content = _contentCubit.state;

    for (final category in content.categories) {
      if (category.name.toLowerCase() == route) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ServiceDetailsPage(
              serviceName: category.nameFor(localeCode),
              category: category,
              serviceImage: category.picture,
            ),
          ),
        );
        return;
      }
    }

    for (final service in content.services) {
      if (service.name.toLowerCase() == route) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ServiceDetailsPage(
              serviceName: service.nameFor(localeCode),
              service: service,
              serviceImage: service.picture,
            ),
          ),
        );
        return;
      }
    }
    // No matching target: the slide stays a plain banner.
  }

  Future<void> _loadProfile() async {
    // Seed the greeting from the locally stored user so the name shows on
    // the first frame instead of flashing "Customer".
    try {
      final storedUser = await locator<AuthTokenStore>().readUser();
      if (storedUser != null && mounted && _profile == null) {
        setState(() {
          _profile = UserProfile(
            fullName: storedUser.fullName,
            email: storedUser.email,
            phone: storedUser.phone,
            location: _currentLocation,
          );
        });
      }
    } catch (_) {
      // Fall through to the network fetch.
    }

    try {
      final profile = await widget.profileRepository.getCurrentUser();
      if (!mounted) return;
      setState(() {
        _profile = profile;
        _currentLocation = profile.location;
      });
    } catch (_) {
      // Keep the home header usable even if profile fetch fails.
    }
  }

  Future<void> _loadOrdersCount() async {
    try {
      final orders = await locator<OrdersApiService>().getOrders();
      if (!mounted) return;
      setState(() {
        _activeOrdersCount = orders.where((order) {
          final status = order['status'] as String?;
          return status != 'COMPLETED' && status != 'CANCELLED';
        }).length;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _activeOrdersCount = 0);
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final bool nextActive = state == AppLifecycleState.resumed;
    if (nextActive == _isAppActive) return;
    _isAppActive = nextActive;
    if (_isAppActive) {
      _loadOrdersCount();
      _contentCubit.refresh(force: true);
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
      if (_recommendedCardsCount <= 0) return;
      _currentRecommendedIndex =
          (_currentRecommendedIndex + 1) % _recommendedCardsCount;
      _recommendedController.animateTo(
        _currentRecommendedIndex * _recommendedCardWidth,
        duration: const Duration(milliseconds: 1000),
        curve: Curves.easeInOutCubic,
      );
    });

    _heroTimer = Timer.periodic(_heroInterval, (_) {
      if (!_autoScrollAllowed || !_heroPageController.hasClients) return;
      _currentHeroIndex = (_currentHeroIndex + 1) % _heroSources.length;
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
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: _BottomNavBar(ordersCount: _activeOrdersCount),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHomeView(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final content = context.watch<HomeContentCubit>().state;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          const SizedBox(height: 2),
          _buildHeroCarousel(content.slides),
          const SizedBox(height: 2),
          _SectionHeader(title: l10n.recommendedServices, showViewAll: true),
          _buildHorizontalServices(context, content.services),
          const SizedBox(height: 0),
          _SectionHeader(title: l10n.ourServices),
          _buildServiceGrid(context, content.categories),
          const SizedBox(height: 10),
          _buildSubscriptionBanner(context),
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
    final firstName =
        (_profile?.fullName.trim().split(RegExp(r'\s+')).first ?? '').isEmpty
            ? 'Customer'
            : _profile!.fullName.trim().split(RegExp(r'\s+')).first;
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
                MaterialPageRoute(
                    builder: (context) => const LocationSetupPage()),
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
                  '${l10n.hello}, $firstName',
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

  Widget _buildHeroCarousel(List<AppSlide> slides) {
    final sources = slides.isNotEmpty
        ? slides.map((s) => s.imageUrl).toList()
        : _heroBanners;
    return SizedBox(
      height: 184,
      child: PageView.builder(
        controller: _heroPageController,
        onPageChanged: (index) => _currentHeroIndex = index,
        itemCount: sources.length,
        itemBuilder: (context, index) => GestureDetector(
          // Backend slides can deep-link to a service via actionRoute.
          onTap: slides.isNotEmpty ? () => _openSlide(slides[index]) : null,
          child: _BannerOnlyCard(imagePath: sources[index]),
        ),
      ),
    );
  }

  /// Demo cards shown until/unless backend services are available.
  List<_RecommendedCardData> _demoRecommendedCards(AppLocalizations l10n) => [
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
          onTap: _openSubscriptionFlow,
        ),
        _RecommendedCardData(
          title: l10n.acServices,
          subtitle: l10n.foamDeepCleaning,
          price: 'DA 150',
          bgColor: ColorApp.tintSky,
          imageUrl: MediaRes.acRepairIcon,
        ),
      ];

  /// Subscription card flow: description page -> property selection ->
  /// subscription booking (Booking Details style).
  void _openSubscriptionFlow() {
    final l10n = AppLocalizations.of(context)!;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ServiceDetailsPage(
          serviceName: l10n.subscriptionPack,
          serviceImage: 'assets/images/pack.png',
          isSubscription: true,
        ),
      ),
    );
  }

  void _openRapidSelectionFlow() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const RapidSelectionPage(),
      ),
    );
  }

  void _openServiceDetails(AppService service, String localeCode) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ServiceDetailsPage(
          serviceName: service.nameFor(localeCode),
          service: service,
          serviceImage: service.picture,
        ),
      ),
    );
  }

  /// Cards from the admin panel: one per service, a ⚡ variant for services
  /// with rapid pricing, and the subscription packs entry.
  List<_RecommendedCardData> _backendRecommendedCards(
      AppLocalizations l10n, String localeCode, List<AppService> services) {
    const tints = [ColorApp.tintRose, ColorApp.tintMint, ColorApp.tintSky];
    var tintIndex = 0;
    Color nextTint() => tints[tintIndex++ % tints.length];

    final cards = <_RecommendedCardData>[];

    // 1. Rapid Service Card
    cards.add(_RecommendedCardData(
      title: '⚡ ${l10n.urgentCleaning}',
      subtitle: 'Priority booking in 24 hours',
      price: 'Premium',
      bgColor: nextTint(),
      imageUrl: 'assets/images/urgent.png',
      isNew: true,
      onTap: _openRapidSelectionFlow,
    ));

    // 2. Normal Service Cards
    for (final service in services) {
      final config = service.defaultHouseConfig;
      cards.add(_RecommendedCardData(
        title: service.nameFor(localeCode),
        subtitle: l10n.startingHours(config?.durationHours ?? 3),
        price: 'DA ${(config?.basePrice ?? 0).toStringAsFixed(0)}',
        bgColor: nextTint(),
        imageUrl: service.picture,
        onTap: () => _openServiceDetails(service, localeCode),
      ));
    }

    // 3. Subscription Pack Card
    cards.add(_RecommendedCardData(
      title: l10n.subscriptionPack,
      subtitle: l10n.fullMaintenance,
      price: l10n.monthly,
      bgColor: nextTint(),
      imageUrl: 'assets/images/pack.png',
      isNew: true,
      onTap: _openSubscriptionFlow,
    ));

    return cards;
  }

  Widget _buildHorizontalServices(
      BuildContext context, List<AppService> services) {
    final l10n = AppLocalizations.of(context)!;
    final localeCode = Localizations.localeOf(context).languageCode;
    final cards = services.isNotEmpty
        ? _backendRecommendedCards(l10n, localeCode, services)
        : _demoRecommendedCards(l10n);
    _recommendedCardsCount = cards.length;

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

  /// Entry point to the subscription packs (recurring cleaning) flow.
  Widget _buildSubscriptionBanner(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: GestureDetector(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const SubscriptionsPage()),
        ),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                ColorApp.primary,
                ColorApp.primary.withValues(alpha: 0.75),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: AppShadows.primaryGlow(),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.autorenew_rounded,
                    color: Colors.white, size: 26),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.subscriptionPacks,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      l10n.subscriptionPacksSubtitle,
                      style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios_rounded,
                  color: Colors.white, size: 18),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildServiceGrid(BuildContext context, List<AppCategory> categories) {
    // "Our services" on the home page shows only what the admin adds at
    // /admin/categories (backend categories). Items from /admin/services are
    // intentionally excluded here.
    final localeCode = Localizations.localeOf(context).languageCode;
    final tiles = categories
        .map(
          (category) => _ServiceTile(
            name: category.nameFor(localeCode),
            image: category.picture,
            icon: Icons.category_rounded,
            category: category,
          ),
        )
        .toList();

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
      itemCount: tiles.length,
      itemBuilder: (context, index) => _ServiceGridTile(service: tiles[index]),
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
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
        child: AppImage(
          source: imagePath,
          fit: BoxFit.contain,
          fallback: Container(color: const Color(0xFFF1F5F3)),
        ),
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
  final VoidCallback? onTap;

  const _RecommendedCardData({
    required this.title,
    required this.subtitle,
    required this.price,
    required this.bgColor,
    required this.imageUrl,
    this.isNew = false,
    this.onTap,
  });
}

class _HorizontalServiceCard extends StatelessWidget {
  final _RecommendedCardData data;
  const _HorizontalServiceCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return GestureDetector(
      onTap: data.onTap ??
          () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ServiceDetailsPage(
                  serviceName: data.title,
                  serviceImage: data.imageUrl,
                  fromRecommendation: true,
                ),
              ),
            );
          },
      child: Align(
        alignment: Alignment.topCenter,
        child: SizedBox(
          height: 190,
          child: Container(
            width: 200,
            margin: const EdgeInsets.only(right: 16),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(28)),
              boxShadow: AppShadows.cardSubtle,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  height: 126,
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: ClipRRect(
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(28),
                            topRight: Radius.circular(28),
                          ),
                          child: AppImage(
                            source: data.imageUrl,
                            fit: BoxFit.fitWidth,
                            fallback: Container(
                              color: ColorApp.softGrey,
                              child: const Icon(Icons.image_not_supported,
                                  color: ColorApp.textGrey),
                            ),
                          ),
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
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 6),
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
        ),
      ),
    );
  }
}

class _ServiceTile {
  final String name;
  final String? image;
  final IconData icon;
  final AppCategory? category;

  const _ServiceTile({
    required this.name,
    required this.icon,
    this.image,
    this.category,
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
            builder: (context) => ServiceDetailsPage(
              serviceName: service.name,
              category: service.category,
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
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: AppImage(
                source: service.image,
                width: 48,
                height: 48,
                fallback: Icon(
                  service.icon,
                  color: ColorApp.primary,
                  size: 32,
                ),
              ),
            ),
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
  final int ordersCount;

  const _BottomNavBar({required this.ordersCount});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final selectedIndex = context.watch<HomeTabCubit>().state;
    return Container(
      margin: const EdgeInsets.only(left: 22, right: 22, bottom: 18),
      height: 70,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.72),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white.withValues(alpha: 0.55)),
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
                  badgeCount: ordersCount,
                ),
                _NavItem(
                  index: 3,
                  label: l10n.profileLabel,
                  icon: Icons.person_rounded,
                  isActive: selectedIndex == 3,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final int index;
  final String label;
  final IconData icon;
  final bool isActive;
  final int badgeCount;

  const _NavItem({
    required this.index,
    required this.label,
    required this.icon,
    required this.isActive,
    this.badgeCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.read<HomeTabCubit>().select(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
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
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  icon,
                  color: isActive ? ColorApp.primary : ColorApp.textGrey,
                  size: 24,
                ),
                if (badgeCount > 0)
                  Positioned(
                    right: -8,
                    top: -8,
                    child: Container(
                      constraints: const BoxConstraints(
                        minWidth: 18,
                        minHeight: 18,
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      child: Center(
                        child: Text(
                          badgeCount > 99 ? '99+' : '$badgeCount',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            height: 1,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isActive ? ColorApp.primary : ColorApp.textGrey,
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w900 : FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
