import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/shadows.dart';
import 'package:cleanapp/src/core/widgets/app_image.dart';
import 'package:cleanapp/src/features/home/cubit/home_content_cubit.dart';
import 'package:cleanapp/src/features/services/pages/service_details_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class RapidSelectionPage extends StatefulWidget {
  const RapidSelectionPage({super.key});

  @override
  State<RapidSelectionPage> createState() => _RapidSelectionPageState();
}

class _RapidSelectionPageState extends State<RapidSelectionPage> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeCode = Localizations.localeOf(context).languageCode;
    final content = context.watch<HomeContentCubit>().state;

    // Filter categories and services based on search query
    final query = _searchQuery.toLowerCase().trim();
    final categories = content.categories.where((c) {
      return c.nameFor(localeCode).toLowerCase().contains(query) ||
          c.descriptionFor(localeCode).toLowerCase().contains(query);
    }).toList();

    final services = content.services.where((s) {
      return s.nameFor(localeCode).toLowerCase().contains(query) ||
          s.descriptionFor(localeCode).toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: ColorApp.textBlack, size: 18),
            onPressed: () => Navigator.pop(context),
            style: IconButton.styleFrom(
              backgroundColor: ColorApp.softGrey,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
        title: Text(
          l10n.urgentCleaning,
          style: const TextStyle(
            color: ColorApp.textBlack,
            fontSize: 20,
            fontWeight: FontWeight.w900,
          ),
        ),
        centerTitle: true,
      ),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // Elegant Header section with Bolt Icon
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      ColorApp.primary,
                      Color(0xFF0F172A),
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
                        color: Colors.white.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.bolt_rounded,
                        color: Colors.amber,
                        size: 30,
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "⚡ Priority Booking",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            "Get cleaner availability starting tomorrow. Rapid bookings have priority scheduling.",
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Search bar
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val),
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: ColorApp.textBlack,
                ),
                decoration: InputDecoration(
                  hintText: "Search categories or services...",
                  hintStyle: TextStyle(
                    color: Colors.grey.shade400,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                  prefixIcon: const Icon(Icons.search_rounded,
                      color: ColorApp.textGrey, size: 20),
                  filled: true,
                  fillColor: ColorApp.softGrey,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ),

          // Categories Grid
          if (categories.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
                child: Text(
                  l10n.ourServices,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: ColorApp.textBlack,
                  ),
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.15,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final cat = categories[index];
                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ServiceDetailsPage(
                              serviceName: cat.nameFor(localeCode),
                              category: cat,
                              serviceImage: cat.picture,
                              isRapid: true,
                            ),
                          ),
                        );
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: Colors.black.withValues(alpha: 0.05)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: AppImage(
                                source: cat.picture,
                                width: 44,
                                height: 44,
                                fallback: const Icon(
                                  Icons.category_rounded,
                                  color: ColorApp.primary,
                                  size: 32,
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              cat.nameFor(localeCode),
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: ColorApp.textBlack,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  childCount: categories.length,
                ),
              ),
            ),
          ],

          // Individual Services List
          if (services.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
                child: Text(
                  l10n.recommendedServices,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: ColorApp.textBlack,
                  ),
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final svc = services[index];
                    final defaultPrice = svc.defaultHouseConfig?.rapidBasePrice ??
                        svc.defaultHouseConfig?.basePrice ??
                        0;

                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ServiceDetailsPage(
                              serviceName: svc.nameFor(localeCode),
                              service: svc,
                              serviceImage: svc.picture,
                              isRapid: true,
                            ),
                          ),
                        );
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: Colors.black.withValues(alpha: 0.05)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(14),
                              child: AppImage(
                                source: svc.picture,
                                width: 64,
                                height: 64,
                                fit: BoxFit.cover,
                                fallback: const Icon(
                                  Icons.cleaning_services_rounded,
                                  color: ColorApp.primary,
                                  size: 32,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    svc.nameFor(localeCode),
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w800,
                                      color: ColorApp.textBlack,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    svc.descriptionFor(localeCode),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: ColorApp.textGrey,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    "DA ${defaultPrice.toStringAsFixed(0)}",
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w900,
                                      color: ColorApp.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(
                              Icons.arrow_forward_ios_rounded,
                              color: ColorApp.textGrey,
                              size: 14,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  childCount: services.length,
                ),
              ),
            ),
          ],
          const SliverToBoxAdapter(
            child: SizedBox(height: 40),
          ),
        ],
      ),
    );
  }
}
