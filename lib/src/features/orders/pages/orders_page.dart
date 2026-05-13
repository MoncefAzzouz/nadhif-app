import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  String _activeFilter = 'Active';
  bool _notificationsEnabled = true;

  final List<Map<String, dynamic>> _filters = [
    {'label': 'Active', 'icon': Icons.local_fire_department_rounded},
    {'label': 'Scheduled', 'icon': Icons.calendar_month_rounded},
    {'label': 'History', 'icon': Icons.history_rounded},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
              child: Text(
                "Orders",
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: ColorApp.textBlack,
                  letterSpacing: -1,
                ),
              ),
            ),

            // Filter Bar
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: _filters.map((filter) {
                  final bool isSelected = _activeFilter == filter['label'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 12),
                    child: GestureDetector(
                      onTap: () => setState(() => _activeFilter = filter['label']!),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
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
                        child: Row(
                          children: [
                            Icon(
                              filter['icon'] as IconData,
                              size: 18,
                              color: isSelected ? Colors.white : ColorApp.textGrey,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              filter['label'] as String,
                              style: TextStyle(
                                color: isSelected ? Colors.white : ColorApp.textGrey,
                                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            // Notification Toggle Card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
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
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: ColorApp.primary.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.notifications_active_rounded,
                        color: ColorApp.primary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        "Allow notification for your orders",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: ColorApp.textBlack.withOpacity(0.8),
                        ),
                      ),
                    ),
                    Switch(
                      value: _notificationsEnabled,
                      onChanged: (val) => setState(() => _notificationsEnabled = val),
                      activeTrackColor: ColorApp.primary,
                      activeColor: Colors.white,
                    ),
                  ],
                ),
              ),
            ),

            const Spacer(),

            // Empty State
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 30,
                          offset: const Offset(0, 15),
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.assignment_outlined,
                      size: 48,
                      color: ColorApp.textGrey.withOpacity(0.3),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    "No $_activeFilter orders yet",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: ColorApp.textBlack,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 48),
                    child: Text(
                      "You haven't placed any $_activeFilter orders yet. Explore our services to get started!",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: ColorApp.textGrey,
                        fontSize: 14,
                        height: 1.6,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(flex: 2),
          ],
        ),
      ),
    );
  }
}
