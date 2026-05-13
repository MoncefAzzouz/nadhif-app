import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../core/res/media_res.dart';
import '../../../core/res/color_app.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';
import 'verification_page.dart';

class VerificationMethodPage extends StatefulWidget {
  final String phoneNumber;

  const VerificationMethodPage({Key? key, required this.phoneNumber})
      : super(key: key);

  @override
  State<VerificationMethodPage> createState() => _VerificationMethodPageState();
}

class _VerificationMethodPageState extends State<VerificationMethodPage> {
  String _selectedMethod = 'whatsapp';

  Future<void> _handleContinue() async {
    final success = await context
        .read<AuthCubit>()
        .sendVerificationCode(widget.phoneNumber, '+213');
    if (success && mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) =>
              VerificationPage(phoneNumber: widget.phoneNumber),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorApp.primary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: SvgPicture.asset(
            MediaRes.backButton,
            colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            flex: 25,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    MediaRes.logo,
                    width: 150,
                    height: 60,
                    fit: BoxFit.contain,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    "Verification",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            flex: 75,
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(40),
                  topRight: Radius.circular(40),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Choose verification method",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: ColorApp.textBlack,
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      "Select how you want to receive your verification code.",
                      style: TextStyle(
                        fontSize: 14,
                        color: ColorApp.textGrey,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 32),
                    _buildMethodCard(
                      id: 'whatsapp',
                      title: "WhatsApp",
                      subtitle: "Fast and secure",
                      icon: MediaRes.whatsapp,
                      color: const Color(0xFF25D366),
                    ),
                    const SizedBox(height: 16),
                    _buildMethodCard(
                      id: 'sms',
                      title: "SMS",
                      subtitle: "Standard carrier rates apply",
                      icon: MediaRes.sms,
                      color: ColorApp.primary,
                    ),
                    const Spacer(),
                    BlocBuilder<AuthCubit, AuthState>(
                      builder: (context, state) {
                        return SizedBox(
                          width: double.infinity,
                          height: 60,
                          child: ElevatedButton(
                            onPressed:
                                state is AuthLoading ? null : _handleContinue,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ColorApp.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                              elevation: 0,
                            ),
                            child: state is AuthLoading
                                ? const CircularProgressIndicator(
                                    color: Colors.white)
                                : const Text(
                                    "Continue",
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMethodCard({
    required String id,
    required String title,
    required String subtitle,
    required String icon,
    required Color color,
  }) {
    final isSelected = _selectedMethod == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = id),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? ColorApp.primary : const Color(0xFFE2E8F0),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: SvgPicture.asset(
                icon,
                width: 28,
                height: 28,
                colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                      color: ColorApp.textBlack,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: ColorApp.textGrey,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle_rounded,
                  color: ColorApp.primary, size: 28),
          ],
        ),
      ),
    );
  }
}
