import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Custom Header
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Profile",
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: ColorApp.textBlack,
                        letterSpacing: -1,
                      ),
                    ),
                    IconButton(
                      onPressed: () {},
                      icon: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.settings_rounded, size: 20, color: ColorApp.textGrey),
                      ),
                    ),
                  ],
                ),
              ),

              // User Profile Card
              Padding(
                padding: const EdgeInsets.all(24),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [ColorApp.primary, Color(0xFF00BFA5)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [
                      BoxShadow(
                        color: ColorApp.primary.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Stack(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(3),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: CircleAvatar(
                              radius: 38,
                              backgroundColor: Colors.grey[200],
                              child: const Icon(Icons.person_rounded, size: 45, color: ColorApp.primary),
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.camera_alt_rounded, size: 14, color: ColorApp.primary),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "John Doe",
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              "john.doe@nadhif.com",
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.qr_code_rounded, color: Colors.white, size: 20),
                      ),
                    ],
                  ),
                ),
              ),


              const SizedBox(height: 10),

              // Menu Sections
              _buildSectionTitle("Account Settings"),
              _buildMenuItem(Icons.person_outline_rounded, "Personal Information"),
              _buildMenuItem(Icons.location_on_outlined, "Manage Addresses"),
              _buildMenuItem(Icons.payment_rounded, "Payment Methods"),

              const SizedBox(height: 10),

              _buildSectionTitle("Preferences"),
              _buildMenuItem(Icons.notifications_none_rounded, "Notifications"),
              _buildMenuItem(Icons.language_rounded, "Language Settings", trailing: "English"),
              _buildMenuItem(Icons.dark_mode_outlined, "Appearance"),

              const SizedBox(height: 10),

              _buildSectionTitle("Support"),
              _buildMenuItem(Icons.help_outline_rounded, "Help Center"),
              _buildMenuItem(Icons.privacy_tip_outlined, "Privacy Policy"),
              _buildMenuItem(Icons.info_outline_rounded, "About Nadhif"),

              const SizedBox(height: 10),

              // Logout Button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: GestureDetector(
                  onTap: () {},
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.red.withOpacity(0.1)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.logout_rounded, color: Colors.red, size: 20),
                        const SizedBox(width: 8),
                        const Text(
                          "Log Out",
                          style: TextStyle(
                            color: Colors.red,
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 120),
            ],
          ),
        ),
      ),
    );
  }


  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: ColorApp.textGrey.withOpacity(0.6),
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, {String? trailing}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.01),
              blurRadius: 10,
            ),
          ],
        ),
        child: ListTile(
          onTap: () {},
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: ColorApp.softGrey,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: ColorApp.textBlack, size: 20),
          ),
          title: Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 15,
              color: ColorApp.textBlack,
            ),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (trailing != null)
                Text(
                  trailing,
                  style: const TextStyle(
                    color: ColorApp.textGrey,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              const SizedBox(width: 8),
              const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: ColorApp.textGrey),
            ],
          ),
        ),
      ),
    );
  }
}
