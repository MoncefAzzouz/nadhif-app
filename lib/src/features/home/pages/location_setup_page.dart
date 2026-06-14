import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:cleanapp/src/core/res/color_app.dart';

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
  bool _isLocating = false;
  String _locationSubtitle = 'Tap to detect your GPS location';

  Future<void> _useCurrentLocation() async {
    if (_isLocating) return;

    setState(() {
      _isLocating = true;
      _locationSubtitle = 'Detecting your location...';
    });

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        await Geolocator.openLocationSettings();
        _showLocationMessage('Please enable location services and try again.');
        setState(() => _locationSubtitle = 'Location services are disabled');
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied) {
        _showLocationMessage('Location permission was denied.');
        setState(() => _locationSubtitle = 'Permission denied');
        return;
      }

      if (permission == LocationPermission.deniedForever) {
        await Geolocator.openAppSettings();
        _showLocationMessage('Enable location permission from settings.');
        setState(() => _locationSubtitle = 'Permission denied permanently');
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      );
      final location = LatLng(position.latitude, position.longitude);

      if (!mounted) return;
      setState(() {
        _currentCenter = location;
        _locationSubtitle = 'Using your current GPS location';
        if (_searchController.text.trim().isEmpty ||
            _searchController.text.trim() == 'Setif center ville') {
          _searchController.text = 'Current location';
        }
      });
      _mapController.move(location, 16);
    } catch (_) {
      if (!mounted) return;
      _showLocationMessage('Could not get your current location.');
      setState(() => _locationSubtitle = 'Unable to detect location');
    } finally {
      if (mounted) {
        setState(() => _isLocating = false);
      }
    }
  }

  void _showLocationMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

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
                        onTap: _useCurrentLocation,
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: ColorApp.primary.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                                color: ColorApp.primary.withValues(alpha: 0.1)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: ColorApp.primary,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: _isLocating
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Icon(Icons.my_location,
                                        color: Colors.white, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    "Use Current Location",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 16,
                                      color: ColorApp.textBlack,
                                    ),
                                  ),
                                  Text(
                                    _locationSubtitle,
                                    style: const TextStyle(
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
                                    if (hasGesture) {
                                      setState(
                                          () => _currentCenter = pos.center);
                                    }
                                  },
                                ),
                                children: [
                                  TileLayer(
                                    urlTemplate:
                                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                    userAgentPackageName: 'com.nadhif.app',
                                  ),
                                  MarkerLayer(
                                    markers: [
                                      Marker(
                                        point: _currentCenter,
                                        width: 80,
                                        height: 80,
                                        child: const Icon(
                                            Icons.location_on_rounded,
                                            color: ColorApp.primary,
                                            size: 40),
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
                                  onTap: () =>
                                      setState(() => _isMapFullscreen = true),
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black
                                              .withValues(alpha: 0.1),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: const Icon(Icons.fullscreen_rounded,
                                        color: ColorApp.primary, size: 24),
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
                          child: const Icon(Icons.history,
                              color: ColorApp.textGrey, size: 20),
                        ),
                        title: const Text(
                          "Park Mall Setif",
                          style: TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        subtitle: const Text("Setif, Algeria",
                            style: TextStyle(fontSize: 11)),
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
                    onPressed: () {
                      final addr = _searchController.text.trim();
                      Navigator.pop(
                        context,
                        SelectedLocation(
                          address:
                              addr.isNotEmpty ? addr : "Setif center ville",
                          latitude: _currentCenter.latitude,
                          longitude: _currentCenter.longitude,
                        ),
                      );
                    },
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
                          if (hasGesture) {
                            setState(() => _currentCenter = pos.center);
                          }
                        },
                      ),
                      children: [
                        TileLayer(
                          urlTemplate:
                              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.nadhif.app',
                        ),
                        MarkerLayer(
                          markers: [
                            Marker(
                              point: _currentCenter,
                              width: 80,
                              height: 80,
                              child: const Icon(Icons.location_on_rounded,
                                  color: ColorApp.primary, size: 50),
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
                          child: const Icon(Icons.close,
                              color: ColorApp.textBlack),
                        ),
                      ),
                    ),

                    // My Location Button (Fullscreen)
                    Positioned(
                      bottom: 120,
                      right: 24,
                      child: GestureDetector(
                        onTap: _useCurrentLocation,
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
                          child: _isLocating
                              ? const SizedBox(
                                  width: 28,
                                  height: 28,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    color: ColorApp.primary,
                                  ),
                                )
                              : const Icon(Icons.my_location,
                                  color: ColorApp.primary, size: 28),
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
                          onPressed: () {
                            final addr = _searchController.text.trim();
                            Navigator.pop(
                              context,
                              SelectedLocation(
                                address: addr.isNotEmpty
                                    ? addr
                                    : "Setif center ville",
                                latitude: _currentCenter.latitude,
                                longitude: _currentCenter.longitude,
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ColorApp.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            elevation: 8,
                            shadowColor:
                                ColorApp.primary.withValues(alpha: 0.4),
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

class SelectedLocation {
  final String address;
  final double latitude;
  final double longitude;
  const SelectedLocation({
    required this.address,
    required this.latitude,
    required this.longitude,
  });
}
