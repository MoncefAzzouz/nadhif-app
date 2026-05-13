import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/common/cubit/locale_cubit.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/features/profile/data/user_profile.dart';
import 'package:cleanapp/src/features/profile/pages/personal_info_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProfilePage extends StatelessWidget {
  final ProfileRepository repository;

  const ProfilePage({
    super.key,
    this.repository = const InMemoryProfileRepository(),
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final user = repository.getCurrentUser();
    
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
                      l10n.profile,
                      style: const TextStyle(
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
                              color: Colors.black.withValues(alpha: 0.05),
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
                        color: ColorApp.primary.withValues(alpha: 0.3),
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
                            Text(
                              user.firstName,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              user.email,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.8),
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
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.qr_code_rounded, color: Colors.white, size: 20),
                      ),
                    ],
                  ),
                ),
              ),


              const SizedBox(height: 6),

              // Menu Sections
              _buildSectionTitle(context, l10n.profile),
              _buildMenuItem(
                context, 
                Icons.person_outline_rounded, 
                l10n.personalInfo,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const PersonalInfoPage()),
                  );
                },
              ),
              _buildMenuItem(context, Icons.location_on_outlined, l10n.manageAddresses),

              const SizedBox(height: 10),

              _buildSectionTitle(context, l10n.settings),
              BlocBuilder<LocaleCubit, Locale>(
                builder: (context, locale) {
                  String languageName = l10n.english;
                  if (locale.languageCode == 'fr') languageName = l10n.frenchNative;
                  if (locale.languageCode == 'ar') languageName = l10n.arabicNative;
                  
                  return _buildMenuItem(
                    context, 
                    Icons.language_rounded, 
                    l10n.language, 
                    trailing: languageName,
                    onTap: () => _showLanguagePicker(context),
                  );
                },
              ),
              _buildMenuItem(context, Icons.dark_mode_outlined, l10n.appearance),

              const SizedBox(height: 10),

              _buildSectionTitle(context, l10n.support),
              _buildMenuItem(context, Icons.help_outline_rounded, l10n.helpCenter),
              _buildMenuItem(context, Icons.privacy_tip_outlined, l10n.privacyPolicy),
              _buildMenuItem(context, Icons.info_outline_rounded, l10n.aboutNadhif),

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
                      border: Border.all(color: Colors.red.withValues(alpha: 0.1)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.logout_rounded, color: Colors.red, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          l10n.logOut,
                          style: const TextStyle(
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

  void _showLanguagePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final l10n = AppLocalizations.of(context)!;
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.chooseLanguage,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: ColorApp.textBlack),
              ),
              const SizedBox(height: 24),
              _buildLanguageOption(context, l10n.english, "en"),
              _buildLanguageOption(context, l10n.frenchNative, "fr"),
              _buildLanguageOption(context, l10n.arabicNative, "ar"),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLanguageOption(BuildContext context, String label, String code) {
    final currentLocale = context.watch<LocaleCubit>().state;
    final isSelected = currentLocale.languageCode == code;

    return GestureDetector(
      onTap: () {
        context.read<LocaleCubit>().changeLocale(code);
        Navigator.pop(context);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? ColorApp.primary.withValues(alpha: 0.08) : ColorApp.softGrey,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? ColorApp.primary : Colors.transparent, width: 1.5),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                color: isSelected ? ColorApp.primary : ColorApp.textBlack,
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: ColorApp.primary, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: ColorApp.textGrey.withValues(alpha: 0.6),
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, IconData icon, String title, {String? trailing, VoidCallback? onTap}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.01),
              blurRadius: 10,
            ),
          ],
        ),
        child: ListTile(
          onTap: onTap ?? () {},
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
