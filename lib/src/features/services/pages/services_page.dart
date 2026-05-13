import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/l10n/app_localizations.dart';

class ServicesPage extends StatefulWidget {
  const ServicesPage({super.key});

  @override
  State<ServicesPage> createState() => _ServicesPageState();
}

class _ServicesPageState extends State<ServicesPage> {
  String _selectedCategory = 'All';
  final TextEditingController _searchController = TextEditingController();

  List<String> _getCategories(AppLocalizations l10n) => 
      [l10n.all, l10n.cleaning, l10n.repair, l10n.laundry, l10n.maintenance];

  List<Map<String, dynamic>> _getServices(AppLocalizations l10n) => [
    {
      "name": l10n.homeClean,
      "icon": Icons.home_work_rounded,
      "desc": l10n.homeCleaningDesc,
      "category": l10n.cleaning,
      "price": l10n.fromPrice("DA 69"),
    },
    {
      "name": l10n.laundry,
      "icon": Icons.local_laundry_service_rounded,
      "desc": l10n.laundryDesc,
      "category": l10n.laundry,
      "price": l10n.fromPrice("DA 45"),
    },
    {
      "name": l10n.carWash,
      "icon": Icons.directions_car_filled_rounded,
      "desc": l10n.carWashDesc,
      "category": l10n.cleaning,
      "price": l10n.fromPrice("DA 80"),
    },
    {
      "name": l10n.acServices,
      "icon": Icons.ac_unit_rounded,
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
      "desc": l10n.furnitureDesc,
      "category": l10n.cleaning,
      "price": l10n.fromPrice("DA 120"),
    },
  ];

  @override
  void initState() {
    super.initState();
    // We'll set the default category after l10n is available in build
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final services = _getServices(l10n);
    final categories = _getCategories(l10n);

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
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: ColorApp.textBlack,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      l10n.helpQuestion,
                      style: TextStyle(
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
                        color: Colors.black.withOpacity(0.03),
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
                      hintStyle: TextStyle(color: ColorApp.textGrey.withOpacity(0.5), fontSize: 14),
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
                                    ? ColorApp.primary.withOpacity(0.3)
                                    : Colors.black.withOpacity(0.03),
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
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final service = filteredServices[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 20),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(28),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.02),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            // Icon Container
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: ColorApp.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Icon(
                                service['icon'] as IconData,
                                color: ColorApp.primary,
                                size: 30,
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
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w900,
                                      color: ColorApp.textBlack,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    service['desc'] as String,
                                    style: TextStyle(
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
