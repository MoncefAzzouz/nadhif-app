import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/l10n/app_localizations.dart';

class PersonalInfoPage extends StatefulWidget {
  const PersonalInfoPage({super.key});

  @override
  State<PersonalInfoPage> createState() => _PersonalInfoPageState();
}

class _PersonalInfoPageState extends State<PersonalInfoPage> {
  final _firstNameController = TextEditingController(text: "Moncef");
  final _lastNameController = TextEditingController(text: "az");
  final _emailController = TextEditingController(text: "Moncefaz@nadhif.com");
  final _phoneController = TextEditingController(text: "+213 555 123 456");
  final _passwordController = TextEditingController(text: "********");

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: ColorApp.textBlack, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          l10n.personalInfo,
          style: const TextStyle(
            color: ColorApp.textBlack,
            fontSize: 20,
            fontWeight: FontWeight.w900,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Profile Avatar Section
            Center(
              child: Stack(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: ColorApp.primary.withOpacity(0.1),
                      child: const Icon(Icons.person_rounded, size: 60, color: ColorApp.primary),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: ColorApp.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 16),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),

            // Form Fields
            _buildInputField(
              label: "First Name",
              controller: _firstNameController,
              icon: Icons.person_outline_rounded,
            ),
            const SizedBox(height: 20),
            _buildInputField(
              label: "Last Name",
              controller: _lastNameController,
              icon: Icons.person_outline_rounded,
            ),
            const SizedBox(height: 20),
            _buildInputField(
              label: "Email Address",
              controller: _emailController,
              icon: Icons.email_outlined,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 20),
            _buildInputField(
              label: "Phone Number",
              controller: _phoneController,
              icon: Icons.phone_outlined,
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 20),
            _buildInputField(
              label: "Password",
              controller: _passwordController,
              icon: Icons.lock_outline_rounded,
              isPassword: true,
            ),

            const SizedBox(height: 40),

            // Save Button
            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Implement save logic
                  Navigator.pop(context);
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
                  "Save Changes",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    bool isPassword = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: ColorApp.textGrey.withOpacity(0.8),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: TextField(
            controller: controller,
            obscureText: isPassword,
            keyboardType: keyboardType,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: ColorApp.textBlack,
            ),
            decoration: InputDecoration(
              prefixIcon: Icon(icon, color: ColorApp.primary, size: 20),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              suffixIcon: isPassword 
                ? const Icon(Icons.visibility_off_outlined, color: ColorApp.textGrey, size: 20)
                : null,
            ),
          ),
        ),
      ],
    );
  }
}
