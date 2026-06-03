import 'package:cleanapp/src/features/services/pages/service_booking_page.dart';
import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/widgets/app_image.dart';
import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/media_res.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:cleanapp/src/features/services/data/services_api_service.dart';

class ServicesPage extends StatefulWidget {
  const ServicesPage({super.key});

  @override
  State<ServicesPage> createState() => _ServicesPageState();
}

class _ServicesPageState extends State<ServicesPage> with WidgetsBindingObserver {
  String _selectedCategory = 'All';
  final TextEditingController _searchController = TextEditingController();
  List<AppService> _backendServices = const [];
  List<AppCategory> _backendCategories = const [];
  bool _isLoading = true;
  String? _error;

  List<String> _getCategories(AppLocalizations l10n) => 
      [l10n.all, l10n.cleaning, l10n.repair, l10n.laundry, l10n.maintenance];

  List<Map<String, dynamic>> _getServices(AppLocalizations l10n) => [
        {
          "name": l10n.homeClean,
          "icon": Icons.home_work_rounded,
          "image": MediaRes.fastCleanIcon,
          "desc": l10n.homeCleaningDesc,
          "category": l10n.cleaning,
          "price": l10n.fromPrice("DA 69"),
        },
        {
          "name": l10n.laundry,
          "icon": Icons.local_laundry_service_rounded,
          "image": MediaRes.laundryIcon,
          "desc": l10n.laundryDesc,
          "category": l10n.laundry,
          "price": l10n.fromPrice("DA 45"),
        },
        {
          "name": l10n.carWash,
          "icon": Icons.directions_car_filled_rounded,
          "image": MediaRes.carWashIcon,
          "desc": l10n.carWashDesc,
          "category": l10n.cleaning,
          "price": l10n.fromPrice("DA 80"),
        },
        {
          "name": l10n.carpet,
          "icon": Icons.texture_rounded,
          "image": MediaRes.carpetIcon,
          "desc": l10n.carpetDesc,
          "category": l10n.cleaning,
          "price": l10n.fromPrice("DA 90"),
        },
        {
          "name": l10n.acServices,
          "icon": Icons.ac_unit_rounded,
          "image": MediaRes.acRepairIcon,
          "desc": l10n.acServicesDesc,
          "category": l10n.repair,
          "price": l10n.fromPrice("DA 150"),
        },
        {
          "name": l10n.pestControl,
          "icon": Icons.bug_report_rounded,
          "desc": l10n.pestControlDesc,
          "category": l10n.maintenance,
          "price": l10n.fromPrice("DA 200"),
        },
        {
          "name": l10n.furniture,
          "icon": Icons.weekend_rounded,
          "image": MediaRes.furnitureIcon,
          "desc": l10n.furnitureDesc,
          "category": l10n.cleaning,
          "price": l10n.fromPrice("DA 120"),
        },
      ];

  List<Map<String, dynamic>> _mapBackendServices(AppLocalizations l10n) {
    final serviceItems = _backendServices.map((service) {
      final config = service.defaultHouseConfig;
      return {
        "name": service.name,
        "icon": Icons.cleaning_services_rounded,
        "image": service.picture,
        "desc": service.description,
        "category": l10n.cleaning,
        "price": l10n.fromPrice("DA ${(config?.basePrice ?? 0).toStringAsFixed(0)}"),
        "backendService": service,
      };
    });

    final categoryItems = _backendCategories.map((category) {
      final config = category.defaultCategoryService;
      return {
        "name": category.name,
        "icon": Icons.category_rounded,
        "image": category.picture,
        "desc": category.description,
        "category": "Categories",
        "price":
            l10n.fromPrice("DA ${(config?.basePrice ?? 0).toStringAsFixed(0)}"),
        "backendCategory": category,
      };
    });

    return [...serviceItems, ...categoryItems];
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadServices();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _searchController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _loadServices();
    }
  }

  Future<void> _loadServices() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final servicesFuture = locator<ServicesApiService>().getServices();
      final categoriesFuture = locator<ServicesApiService>().getCategories();
      final services = await servicesFuture;
      final categories = await categoriesFuture;
      if (!mounted) return;
      setState(() {
        _backendServices = services;
        _backendCategories = categories;
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

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final hasBackendData =
        _backendServices.isNotEmpty || _backendCategories.isNotEmpty;
    final services = hasBackendData ? _mapBackendServices(l10n) : _getServices(l10n);
    final categories = hasBackendData
        ? [
            l10n.all,
            l10n.cleaning,
            if (_backendCategories.isNotEmpty) "Categories",
          ]
        : _getCategories(l10n);

    // Initial value for _selectedCategory if it's still 'All'
    if (_selectedCategory == 'All') {
      _selectedCategory = l10n.all;
    }

    final filteredServices = services.where((service) {
      final matchesCategory = _selectedCategory == l10n.all || service['category'] == _selectedCategory;
      final matchesSearch = service['name'].toString().toLowerCase().contains(_searchController.text.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      body: SafeArea(
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // Header Section
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.servicesLabel,
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: ColorApp.textBlack,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      l10n.helpQuestion,
                      style: const TextStyle(
                        fontSize: 15,
                        color: ColorApp.textGrey,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Search Bar Section
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: l10n.searchServices,
                      hintStyle: TextStyle(color: ColorApp.textGrey.withValues(alpha: 0.5), fontSize: 14),
                      prefixIcon: const Icon(Icons.search_rounded, color: ColorApp.primary),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ),
            ),

            // Categories Section
            SliverToBoxAdapter(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                physics: const BouncingScrollPhysics(),
                child: Row(
                  children: categories.map((cat) {
                    final isSelected = _selectedCategory == cat;
                    return Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedCategory = cat),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? ColorApp.primary : Colors.white,
                            borderRadius: BorderRadius.circular(30),
                            boxShadow: [
                              BoxShadow(
                                color: isSelected 
                                    ? ColorApp.primary.withValues(alpha: 0.3)
                                    : Colors.black.withValues(alpha: 0.03),
                                blurRadius: 15,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Text(
                            cat,
                            style: TextStyle(
                              color: isSelected ? Colors.white : ColorApp.textGrey,
                              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

            // Services List
            if (_isLoading)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(child: CircularProgressIndicator()),
                ),
              )
            else if (_error != null && !hasBackendData)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.cloud_off_rounded, color: Color(0xFFDC2626)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _error!,
                            style: const TextStyle(
                              fontSize: 12,
                              color: ColorApp.textGrey,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        TextButton(onPressed: _loadServices, child: const Text('Retry')),
                      ],
                    ),
                  ),
                ),
              ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final service = filteredServices[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 20),
                      child: GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ServiceBookingPage(
                                serviceName: service["name"] as String,
                                service: service["backendService"] as AppService?,
                                category:
                                    service["backendCategory"] as AppCategory?,
                                serviceImage: service["image"] as String?,
                                serviceIcon: service["icon"] as IconData?,
                              ),
                            ),
                          );
                        },
                        child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(28),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            // Icon Container
                            Container(
                              width: 62,
                              height: 62,
                              decoration: BoxDecoration(
                                color: ColorApp.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(20),
                                child: AppImage(
                                  source: service['image'] as String?,
                                  width: double.infinity,
                                  height: double.infinity,
                                  fallback: Icon(
                                    service['icon'] as IconData,
                                    color: ColorApp.primary,
                                    size: 30,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 20),
                            // Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    service['name'] as String,
                                    style: const TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w900,
                                      color: ColorApp.textBlack,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    service['desc'] as String,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: ColorApp.textGrey,
                                      fontWeight: FontWeight.w500,
                                      height: 1.4,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        service['price'] as String,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w800,
                                          color: ColorApp.primary,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF1F5F9),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          l10n.book,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w900,
                                            color: Color(0xFF475569),
                                          ),
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
                  );
                },
                  childCount: filteredServices.length,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
