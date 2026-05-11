import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(80),
        child: _buildLocationHeader(),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 2. Main Hero Banner
            _buildHeroBanner(),

            const SizedBox(height: 24),

            // 3. Horizontal Service Cards
            _buildSectionHeader("Recommended Services", showViewAll: true),
            _buildHorizontalServices(),

            const SizedBox(height: 32),

            // 4. Grid of Services
            _buildSectionHeader("Our Services"),
            _buildServiceGrid(),

            const SizedBox(height: 32),

            // 5. Luxury/Brands Section
            _buildBrandsSection(),

            const SizedBox(height: 32),

            // 6. Offers & Discounts
            _buildSectionHeader("Offers & discounts"),
            _buildOfferBanner(),

            const SizedBox(height: 32),

            // 7. Customize Section
            _buildCustomizeSection(),

            const SizedBox(height: 120), // Space for bottom nav
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavBar(),
      extendBody: true,
    );
  }

  Widget _buildLocationHeader() {
    return Container(
      padding: const EdgeInsets.only(top: 40, left: 20, right: 20, bottom: 10),
      decoration: const BoxDecoration(
        color: Colors.white,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(
            "Location to",
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 12,
              fontWeight: FontWeight.w500,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Text(
                "Jasim Bin Mohammed Street",
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 17,
                  color: ColorApp.textBlack,
                ),
              ),
              const SizedBox(width: 6),
              Icon(Icons.keyboard_arrow_down_rounded, color: ColorApp.primary, size: 22),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      width: double.infinity,
      height: 190,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          colors: [
            const Color(0xFFE3F2FD),
            const Color(0xFFE3F2FD).withOpacity(0.5),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  "Get your AC\nready for summer",
                  style: TextStyle(
                    color: ColorApp.primary,
                    fontSize: 24,
                    height: 1.2,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: const Text(
                    "QAR 15 off first order*",
                    style: TextStyle(
                      color: ColorApp.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            right: -20,
            bottom: 0,
            child: Image.network(
              "https://images.unsplash.com/photo-1581094288338-2314dddb7e8c?w=400",
              height: 180,
              fit: BoxFit.contain,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHorizontalServices() {
    return Container(
      height: 240,
      child: ListView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        children: [
          _buildHorizontalCard(
            "Home Cleaning",
            "Starting\n3 Hours",
            "QAR 69*",
            const Color(0xFFEFF3FF),
            "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=200",
          ),
          _buildHorizontalCard(
            "Washing Machine",
            "Washing\nMachine Service",
            "30 DAY WARRANTY",
            const Color(0xFFF5F3FF),
            "https://images.unsplash.com/photo-1582733775062-eb92170f5de0?w=200",
            isNew: true,
          ),
          _buildHorizontalCard(
            "AC Services",
            "Foam\nDeep Cleaning",
            "PREMIUM CARE",
            const Color(0xFFF0FDFA),
            "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200",
          ),
        ],
      ),
    );
  }

  Widget _buildHorizontalCard(String title, String subtitle, String price, Color bgColor, String imageUrl, {bool isNew = false}) {
    return Container(
      width: 190,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(28),
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
                  child: Text(
                    title,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.black54),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (isNew)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text("NEW", style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900)),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              subtitle,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1E293B), height: 1.1),
            ),
          ),
          const Spacer(),
          Center(child: Image.network(imageUrl, height: 90, fit: BoxFit.contain)),
          const Spacer(),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: ColorApp.primary,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(28),
                bottomRight: Radius.circular(28),
              ),
            ),
            child: Text(
              price,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
            ),
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
        mainAxisSpacing: 20,
        crossAxisSpacing: 12,
        childAspectRatio: 0.65,
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
                    color: Color(0x0F000000),
                    blurRadius: 15,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(services[index]["icon"] as IconData, color: ColorApp.primary, size: 28),
            ),
            const SizedBox(height: 10),
            Text(
              services[index]["name"] as String,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
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
        color: ColorApp.softGrey,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: ColorApp.greyBorder),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isBaby)
                  Text("NEW LAUNCH", style: TextStyle(color: Colors.cyan[700], fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                const SizedBox(height: 4),
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: Color(0xFF1E293B))),
              ],
            ),
          ),
          if (!isBaby)
            const Text("Dior", style: TextStyle(fontFamily: 'Serif', fontSize: 22, fontWeight: FontWeight.w900, color: Colors.black87)),
          if (isBaby)
            const Icon(Icons.child_friendly_rounded, size: 38, color: Color(0xFF0EA5E9)),
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
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 19, color: Color(0xFF0F172A)),
          ),
          if (showViewAll)
            Text(
              "View All",
              style: TextStyle(color: ColorApp.primary, fontWeight: FontWeight.w700, fontSize: 13),
            ),
        ],
      ),
    );
  }

  Widget _buildOfferBanner() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 160),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: ColorApp.greyBorder),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 20,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
            Expanded(
              flex: 3,
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: ColorApp.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text("NEW OFFER", style: TextStyle(color: ColorApp.primary, fontSize: 9, fontWeight: FontWeight.w900)),
                    ),
                    const SizedBox(height: 12),
                    const Text("Washing machine\nmaintenance", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, height: 1.2)),
                    const SizedBox(height: 8),
                    Text("Quality service at your door", style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                  ],
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Image.network(
                "https://images.unsplash.com/photo-1582733775062-eb92170f5de0?w=300",
                fit: BoxFit.cover,
                height: double.infinity,
              ),
            ),
          ],
        ),
      ),
    ),
    );
  }

  Widget _buildCustomizeSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [ColorApp.primary, Color(0xFF6366F1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: ColorApp.primary.withOpacity(0.3),
            blurRadius: 25,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Customize your\nexperience",
                  style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900, height: 1.1),
                ),
                const SizedBox(height: 10),
                const Text(
                  "Tailor Aldobi to your preferences!",
                  style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: ColorApp.primary,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text("Explore Now", style: TextStyle(fontWeight: FontWeight.w800)),
                ),
              ],
            ),
          ),
          const Icon(Icons.auto_fix_high_rounded, size: 70, color: Colors.white24),
        ],
      ),
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      margin: const EdgeInsets.only(left: 24, right: 24, bottom: 24),
      height: 70,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(35),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 30,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(Icons.home_rounded, "Home", true),
          _buildNavItem(Icons.assignment_rounded, "Orders", false),
          _buildNavItem(Icons.more_horiz_rounded, "More", false),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, bool isActive) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          icon,
          color: isActive ? ColorApp.primary : Colors.grey[400],
          size: 26,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: isActive ? ColorApp.primary : Colors.grey[400],
            fontSize: 10,
            fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
