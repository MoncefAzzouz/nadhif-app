import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/media_res.dart';
import 'package:cleanapp/src/features/auth/cubit/auth_cubit.dart';
import 'package:cleanapp/src/features/auth/cubit/auth_state.dart';
import 'package:cleanapp/src/features/home/pages/home_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class PhoneNumberPage extends StatefulWidget {
  const PhoneNumberPage({super.key});

  @override
  State<PhoneNumberPage> createState() => _PhoneNumberPageState();
}

class _PhoneNumberPageState extends State<PhoneNumberPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  bool _isRegisterMode = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _fullNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) return;
    if (_isRegisterMode &&
        (_fullNameController.text.trim().isEmpty ||
            _phoneController.text.trim().isEmpty)) {
      return;
    }

    final auth = context.read<AuthCubit>();
    final success = _isRegisterMode
        ? await auth.registerWithEmail(
            email: email,
            phone: _phoneController.text.trim(),
            password: password,
            fullName: _fullNameController.text.trim(),
          )
        : await auth.login(email: email, password: password);

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
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              flex: 32,
              child: SizedBox(
                width: double.infinity,
                child: Image.asset(
                  MediaRes.login,
                  width: double.infinity,
                  height: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Expanded(
              flex: 68,
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(40),
                    topRight: Radius.circular(40),
                  ),
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(32),
                  child: BlocConsumer<AuthCubit, AuthState>(
                    listener: (context, state) {
                      if (state is AuthError) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(state.message),
                            backgroundColor: const Color(0xFFDC2626),
                          ),
                        );
                      }
                    },
                    builder: (context, state) {
                      final isLoading = state is AuthLoading;
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isRegisterMode ? "Create your account" : "Connect to your account",
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                              color: ColorApp.textBlack,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _isRegisterMode
                                ? "Use your email and password to create a customer account."
                                : "Use your email and password to continue.",
                            style: const TextStyle(
                              fontSize: 14,
                              color: ColorApp.textGrey,
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 32),
                          if (_isRegisterMode) ...[
                            _AuthField(
                              controller: _fullNameController,
                              label: "Full Name",
                              icon: Icons.person_rounded,
                              textInputAction: TextInputAction.next,
                            ),
                            const SizedBox(height: 16),
                          ],
                          _AuthField(
                            controller: _emailController,
                            label: "Email",
                            icon: Icons.mail_rounded,
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                          ),
                          const SizedBox(height: 16),
                          if (_isRegisterMode) ...[
                            _AuthField(
                              controller: _phoneController,
                              label: "Phone Number",
                              icon: Icons.phone_rounded,
                              keyboardType: TextInputType.phone,
                              textInputAction: TextInputAction.next,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                                LengthLimitingTextInputFormatter(10),
                              ],
                            ),
                            const SizedBox(height: 16),
                          ],
                          _AuthField(
                            controller: _passwordController,
                            label: "Password",
                            icon: Icons.lock_rounded,
                            obscureText: _obscurePassword,
                            textInputAction: TextInputAction.done,
                            onSubmitted: (_) => isLoading ? null : _submit(),
                            suffixIcon: IconButton(
                              onPressed: () => setState(
                                () => _obscurePassword = !_obscurePassword,
                              ),
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_rounded
                                    : Icons.visibility_off_rounded,
                                color: ColorApp.textGrey,
                              ),
                            ),
                          ),
                          const SizedBox(height: 28),
                          SizedBox(
                            width: double.infinity,
                            height: 60,
                            child: ElevatedButton(
                              onPressed: isLoading ? null : _submit,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: ColorApp.primary,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                elevation: 0,
                              ),
                              child: isLoading
                                  ? const CircularProgressIndicator(color: Colors.white)
                                  : Text(
                                      _isRegisterMode ? "Create Account" : "Continue",
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          Center(
                            child: TextButton(
                              onPressed: isLoading
                                  ? null
                                  : () => setState(
                                        () => _isRegisterMode = !_isRegisterMode,
                                      ),
                              child: Text(
                                _isRegisterMode
                                    ? "Already have an account? Sign in"
                                    : "New customer? Create an account",
                                style: const TextStyle(
                                  color: ColorApp.primary,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthField extends StatelessWidget {
  const _AuthField({
    required this.controller,
    required this.label,
    required this.icon,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.suffixIcon,
    this.inputFormatters,
    this.onSubmitted,
  });

  final TextEditingController controller;
  final String label;
  final IconData icon;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool obscureText;
  final Widget? suffixIcon;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onSubmitted;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        textInputAction: textInputAction,
        obscureText: obscureText,
        inputFormatters: inputFormatters,
        onSubmitted: onSubmitted,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.bold,
          color: ColorApp.textBlack,
        ),
        decoration: InputDecoration(
          labelText: label,
          border: InputBorder.none,
          prefixIcon: Icon(icon, color: ColorApp.primary),
          suffixIcon: suffixIcon,
        ),
      ),
    );
  }
}
