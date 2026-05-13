import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:cleanapp/src/core/res/media_res.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/features/home/pages/home_page.dart';
import 'package:cleanapp/src/features/auth/cubit/auth_cubit.dart';
import 'package:cleanapp/src/features/auth/cubit/auth_state.dart';

class UserInfoPage extends StatefulWidget {
  final String phoneNumber;

  const UserInfoPage({Key? key, required this.phoneNumber}) : super(key: key);

  @override
  State<UserInfoPage> createState() => _UserInfoPageState();
}

class _UserInfoPageState extends State<UserInfoPage> {
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();

  Future<void> _handleComplete() async {
    final first = _firstNameController.text.trim();
    final last = _lastNameController.text.trim();

    if (first.isEmpty || last.isEmpty) return;

    final success = await context.read<AuthCubit>().registerUser(
          firstName: first,
          lastName: last,
          phoneNumber: widget.phoneNumber,
        );

    if (success && mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const HomePage()),
        (route) => false,
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
            flex: 20,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SvgPicture.asset(
                    MediaRes.users,
                    width: 50,
                    height: 50,
                    colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    "Profile Setup",
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
            flex: 80,
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
                      "Tell us about yourself",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: ColorApp.textBlack,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "Please provide your name to complete your profile.",
                      style: TextStyle(
                        fontSize: 14,
                        color: ColorApp.textGrey,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 32),
                    _buildInputField(
                      controller: _firstNameController,
                      label: "First Name (Prenom)",
                      hint: "e.g. John",
                      icon: MediaRes.users,
                    ),
                    const SizedBox(height: 24),
                    _buildInputField(
                      controller: _lastNameController,
                      label: "Last Name (Nom)",
                      hint: "e.g. Doe",
                      icon: MediaRes.users,
                    ),
                    const Spacer(),
                    BlocBuilder<AuthCubit, AuthState>(
                      builder: (context, state) {
                        return SizedBox(
                          width: double.infinity,
                          height: 60,
                          child: ElevatedButton(
                            onPressed: state is AuthLoading ? null : _handleComplete,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ColorApp.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                              elevation: 0,
                            ),
                            child: state is AuthLoading
                                ? const CircularProgressIndicator(color: Colors.white)
                                : const Text(
                                    "Complete Profile",
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
            ),),
        ],
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required String icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w900,
            color: ColorApp.textBlack,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: TextField(
            controller: controller,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: ColorApp.textBlack,
            ),
            decoration: InputDecoration(
              hintText: hint,
              border: InputBorder.none,
              prefixIcon: Padding(
                padding: const EdgeInsets.all(12.0),
                child: SvgPicture.asset(
                  icon,
                  width: 20,
                  height: 20,
                  colorFilter: const ColorFilter.mode(ColorApp.textGrey, BlendMode.srcIn),
                ),
              ),
              prefixIconConstraints: const BoxConstraints(minWidth: 40),
            ),
          ),
        ),
      ],
    );
  }
}
