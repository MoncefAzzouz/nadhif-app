import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/media_res.dart';

class LocationSetupPage extends StatefulWidget {
  const LocationSetupPage({super.key});

  @override
  State<LocationSetupPage> createState() => _LocationSetupPageState();
}

class _LocationSetupPageState extends State<LocationSetupPage> {
  final TextEditingController _searchController = TextEditingController();
  final MapController _mapController = MapController();
  LatLng _currentCenter = const LatLng(36.1911, 5.4137); // Setif Center
  bool _isMapFullscreen = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _isMapFullscreen 
        ? null 
        : AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.close, color: ColorApp.textBlack),
              onPressed: () => Navigator.pop(context),
            ),
            title: const Text(
              "Choose Location",
              style: TextStyle(
                color: ColorApp.textBlack,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
            centerTitle: true,
          ),
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Search Bar
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: TextField(
                          controller: _searchController,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: ColorApp.textBlack,
                          ),
                          decoration: const InputDecoration(
                            hintText: "Search for a place in Setif...",
                            border: InputBorder.none,
                            icon: Icon(Icons.search, color: ColorApp.textGrey),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      // Current Location Button
                      GestureDetector(
                        onTap: () {
                          _mapController.move(const LatLng(36.1911, 5.4137), 15);
                        },
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: ColorApp.primary.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: ColorApp.primary.withValues(alpha: 0.1)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: ColorApp.primary,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: const Icon(Icons.my_location, color: Colors.white, size: 20),
                              ),
                              const SizedBox(width: 12),
                              const Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Use Current Location",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 16,
                                      color: ColorApp.textBlack,
                                    ),
                                  ),
                                  Text(
                                    "Setif, Algeria",
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: ColorApp.textGrey,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      const Text(
                        "Select from Map",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: ColorApp.textBlack,
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      // Live Flutter Map (Inline)
                      Container(
                        height: 250,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(32),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(32),
                          child: Stack(
                            children: [
                              FlutterMap(
                                mapController: _mapController,
                                options: MapOptions(
                                  initialCenter: _currentCenter,
                                  initialZoom: 14.0,
                                  onPositionChanged: (pos, hasGesture) {
                                    if (hasGesture && pos.center != null) {
                                      setState(() {
                                        _currentCenter = pos.center!;
                                      });
                                    }
                                  },
                                ),
                                children: [
                                  TileLayer(
                                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                    userAgentPackageName: 'com.nadhif.app',
                                  ),
                                  MarkerLayer(
                                    markers: [
                                      Marker(
                                        point: _currentCenter,
                                        width: 80,
                                        height: 80,
                                        child: const Icon(Icons.location_on_rounded, color: ColorApp.primary, size: 40),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              // Fullscreen Button inside Map Card
                              Positioned(
                                top: 16,
                                right: 16,
                                child: GestureDetector(
                                  onTap: () => setState(() => _isMapFullscreen = true),
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.1),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: const Icon(Icons.fullscreen_rounded, color: ColorApp.primary, size: 24),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  const SizedBox(height: 12),
                  
                  // Recent Locations
                  const Text(
                    "Recent Locations",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: ColorApp.textBlack,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.history, color: ColorApp.textGrey, size: 20),
                    ),
                    title: const Text(
                      "Park Mall Setif",
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    subtitle: const Text("Setif, Algeria", style: TextStyle(fontSize: 11)),
                    onTap: () {
                      _mapController.move(const LatLng(36.19, 5.41), 15);
                    },
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
          
          // Floating Confirm Button
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 20,
                  offset: const Offset(0, -10),
                ),
              ],
            ),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context, "Setif center ville"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: ColorApp.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  "Confirm Selection",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
          // Fullscreen Map Overlay
          if (_isMapFullscreen)
            Positioned.fill(
              child: Container(
                color: Colors.white,
                child: Stack(
                  children: [
                    FlutterMap(
                      mapController: _mapController,
                      options: MapOptions(
                        initialCenter: _currentCenter,
                        initialZoom: 15.0,
                        onPositionChanged: (pos, hasGesture) {
                          if (hasGesture && pos.center != null) {
                            setState(() {
                              _currentCenter = pos.center!;
                            });
                          }
                        },
                      ),
                      children: [
                        TileLayer(
                          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.nadhif.app',
                        ),
                        MarkerLayer(
                          markers: [
                            Marker(
                              point: _currentCenter,
                              width: 80,
                              height: 80,
                              child: const Icon(Icons.location_on_rounded, color: ColorApp.primary, size: 50),
                            ),
                          ],
                        ),
                      ],
                    ),
                    
                    // Close Fullscreen Button
                    Positioned(
                      top: MediaQuery.of(context).padding.top + 20,
                      left: 20,
                      child: GestureDetector(
                        onTap: () => setState(() => _isMapFullscreen = false),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.close, color: ColorApp.textBlack),
                        ),
                      ),
                    ),
                    
                    // My Location Button (Fullscreen)
                    Positioned(
                      bottom: 120,
                      right: 24,
                      child: GestureDetector(
                        onTap: () {
                          _mapController.move(const LatLng(36.1911, 5.4137), 15);
                          setState(() {
                            _currentCenter = const LatLng(36.1911, 5.4137);
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.my_location, color: ColorApp.primary, size: 28),
                        ),
                      ),
                    ),
                    
                    // Confirm Selection Button (Fullscreen)
                    Positioned(
                      bottom: 40,
                      left: 24,
                      right: 24,
                      child: SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(context, "Setif center ville"),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ColorApp.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            elevation: 8,
                            shadowColor: ColorApp.primary.withValues(alpha: 0.4),
                          ),
                          child: const Text(
                            "Set Location",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
