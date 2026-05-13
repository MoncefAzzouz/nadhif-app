import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';

class ServicesPage extends StatelessWidget {
  const ServicesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final services = [
      {"name": "Home Cleaning", "icon": Icons.home_work_rounded, "desc": "Professional home cleaning"},
      {"name": "Laundry", "icon": Icons.local_laundry_service_rounded, "desc": "Wash, fold & iron"},
      {"name": "Car Wash", "icon": Icons.directions_car_filled_rounded, "desc": "Exterior & interior cleaning"},
      {"name": "AC Services", "icon": Icons.ac_unit_rounded, "desc": "Repair & maintenance"},
      {"name": "Pest Control", "icon": Icons.bug_report_rounded, "desc": "Safe pest removal"},
      {"name": "Furniture", "icon": Icons.weekend_rounded, "desc": "Upholstery cleaning"},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text("All Services", style: TextStyle(fontWeight: FontWeight.w900)),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: services.length,
        itemBuilder: (context, index) {
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: ColorApp.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Icon(services[index]["icon"] as IconData, color: ColorApp.primary, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        services[index]["name"] as String,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        services[index]["desc"] as String,
                        style: TextStyle(color: Colors.grey[600], fontSize: 12),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Colors.grey),
              ],
            ),
          );
        },
      ),
    );
  }
}
