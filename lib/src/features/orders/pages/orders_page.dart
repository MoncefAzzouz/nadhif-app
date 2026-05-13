import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'dart:ui';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  String _activeFilter = 'Active';

  final List<Map<String, dynamic>> _filters = [
    {'label': 'Active', 'icon': Icons.local_fire_department_rounded},
    {'label': 'Scheduled', 'icon': Icons.calendar_month_rounded},
    {'label': 'History', 'icon': Icons.history_rounded},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                color: ColorApp.primary.withAlpha(20),
                shape: BoxShape.circle,
              ),
              child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80), child: Container()),
            ),
          ),
          
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                _buildFilterBar(),
                Expanded(
                  child: _buildOrderList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "My Orders",
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: ColorApp.textBlack,
                  letterSpacing: -1,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: const Icon(Icons.search_rounded, color: ColorApp.textBlack, size: 22),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            "Track and manage your bookings",
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: ColorApp.textGrey.withAlpha(180),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBar() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: _filters.map((filter) {
          final bool isSelected = _activeFilter == filter['label'];
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () => setState(() => _activeFilter = filter['label']!),
              child: AnimatedScale(
                scale: isSelected ? 1.05 : 1.0,
                duration: const Duration(milliseconds: 200),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  decoration: BoxDecoration(
                    color: isSelected ? ColorApp.textBlack : Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : ColorApp.greyBorder,
                      width: 1.5,
                    ),
                    boxShadow: isSelected ? [
                      BoxShadow(color: Colors.black.withAlpha(40), blurRadius: 15, offset: const Offset(0, 8)),
                    ] : [],
                  ),
                  child: Row(
                    children: [
                      Icon(
                        filter['icon'] as IconData,
                        size: 18,
                        color: isSelected ? Colors.white : ColorApp.textGrey,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        filter['label'] as String,
                        style: TextStyle(
                          color: isSelected ? Colors.white : ColorApp.textGrey,
                          fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildOrderList() {
    if (_activeFilter == 'History') {
      return _buildEmptyState();
    }

    return ListView(
      padding: const EdgeInsets.all(24),
      physics: const BouncingScrollPhysics(),
      children: [
        if (_activeFilter == 'Active') ...[
          _buildActiveOrderCard(
            "Home Cleaning",
            "Urgent Service",
            "In Progress",
            0.65,
            "assets/images/urgent.png",
          ),
          const SizedBox(height: 20),
          _buildActiveOrderCard(
            "AC Maintenance",
            "Scheduled for 2:30 PM",
            "Technician Assigned",
            0.3,
            "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200",
          ),
        ] else if (_activeFilter == 'Scheduled') ...[
          _buildScheduledOrderCard(
            "Laundry Pack",
            "Subscription Pack",
            "May 15, 2026",
            "10:00 AM",
            "assets/images/pack.png",
          ),
        ],
      ],
    );
  }

  Widget _buildActiveOrderCard(String title, String subtitle, String status, double progress, String imageUrl) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: ColorApp.greyBorder.withAlpha(100)),
        boxShadow: [
          BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  width: 60,
                  height: 60,
                  color: ColorApp.softGrey,
                  child: imageUrl.startsWith('http') 
                      ? Image.network(imageUrl, fit: BoxFit.cover)
                      : Image.asset(imageUrl, fit: BoxFit.cover),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: ColorApp.textBlack),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: ColorApp.textGrey.withAlpha(200)),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: ColorApp.primary.withAlpha(30),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  "DA 88",
                  style: TextStyle(color: ColorApp.primary, fontWeight: FontWeight.w900, fontSize: 13),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                status,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: ColorApp.textBlack),
              ),
              Text(
                "${(progress * 100).toInt()}%",
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: ColorApp.primary),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Stack(
            children: [
              Container(
                height: 8,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: ColorApp.softGrey,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              AnimatedContainer(
                duration: const Duration(seconds: 1),
                height: 8,
                width: MediaQuery.of(context).size.width * 0.6 * progress,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [ColorApp.primary, Color(0xFF00BFA5)]),
                  borderRadius: BorderRadius.circular(4),
                  boxShadow: [
                    BoxShadow(color: ColorApp.primary.withAlpha(80), blurRadius: 10, offset: const Offset(0, 2)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildScheduledOrderCard(String title, String subtitle, String date, String time, String imageUrl) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: ColorApp.greyBorder.withAlpha(100)),
        boxShadow: [
          BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  width: 50,
                  height: 50,
                  color: ColorApp.softGrey,
                  child: imageUrl.startsWith('http') 
                      ? Image.network(imageUrl, fit: BoxFit.cover)
                      : Image.asset(imageUrl, fit: BoxFit.cover),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: ColorApp.textBlack),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: ColorApp.textGrey.withAlpha(200)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ColorApp.softGrey.withAlpha(150),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Icon(Icons.calendar_today_rounded, size: 16, color: ColorApp.textBlack.withAlpha(150)),
                const SizedBox(width: 8),
                Text(
                  date,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: ColorApp.textBlack),
                ),
                const Spacer(),
                Icon(Icons.access_time_rounded, size: 16, color: ColorApp.textBlack.withAlpha(150)),
                const SizedBox(width: 8),
                Text(
                  time,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: ColorApp.textBlack),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: ColorApp.softGrey,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.assignment_rounded, size: 40, color: ColorApp.textGrey.withAlpha(100)),
          ),
          const SizedBox(height: 24),
          const Text(
            "No Orders Found",
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: ColorApp.textBlack),
          ),
          const SizedBox(height: 8),
          Text(
            "Your order history will appear here",
            style: TextStyle(fontSize: 14, color: ColorApp.textGrey, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
