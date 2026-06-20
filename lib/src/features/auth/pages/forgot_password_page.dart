import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/auth/data/auth_api_service.dart';
import 'package:flutter/material.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final _emailController = TextEditingController();
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _codeSent = false;
  bool _loading = false;
  bool _obscurePassword = true;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _sendCode() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) return;
    setState(() { _loading = true; _error = null; });
    try {
      await locator<AuthApiService>().forgotPassword(email: email);
      setState(() { _codeSent = true; });
    } catch (e) {
      setState(() { _error = e.toString().replaceFirst('Exception: ', ''); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  Future<void> _resetPassword() async {
    final email = _emailController.text.trim();
    final code = _codeController.text.trim();
    final password = _passwordController.text;
    if (code.isEmpty || password.isEmpty) return;
    setState(() { _loading = true; _error = null; });
    try {
      await locator<AuthApiService>().resetPassword(
        email: email,
        code: code,
        newPassword: password,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Password reset successfully. Please sign in.'),
            backgroundColor: Color(0xFF16A34A),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() { _error = e.toString().replaceFirst('Exception: ', ''); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: ColorApp.textBlack, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Reset Password',
          style: TextStyle(
            color: ColorApp.textBlack,
            fontSize: 20,
            fontWeight: FontWeight.w900,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _codeSent
                  ? 'Enter the code sent to your email and your new password.'
                  : 'Enter your email address and we\'ll send you a reset code.',
              style: const TextStyle(
                fontSize: 14,
                color: ColorApp.textGrey,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            _buildField(
              controller: _emailController,
              label: 'Email',
              icon: Icons.mail_rounded,
              keyboardType: TextInputType.emailAddress,
              enabled: !_codeSent,
            ),
            if (_codeSent) ...[
              const SizedBox(height: 16),
              _buildField(
                controller: _codeController,
                label: 'Reset Code',
                icon: Icons.lock_clock_rounded,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              _buildField(
                controller: _passwordController,
                label: 'New Password',
                icon: Icons.lock_rounded,
                obscureText: _obscurePassword,
                suffixIcon: IconButton(
                  onPressed: () =>
                      setState(() => _obscurePassword = !_obscurePassword),
                  icon: Icon(
                    _obscurePassword
                        ? Icons.visibility_rounded
                        : Icons.visibility_off_rounded,
                    color: ColorApp.textGrey,
                  ),
                ),
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(
                _error!,
                style: const TextStyle(
                  color: Color(0xFFDC2626),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                onPressed: _loading
                    ? null
                    : (_codeSent ? _resetPassword : _sendCode),
                style: ElevatedButton.styleFrom(
                  backgroundColor: ColorApp.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  elevation: 0,
                ),
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        _codeSent ? 'Reset Password' : 'Send Code',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
              ),
            ),
            if (_codeSent) ...[
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: _loading ? null : _sendCode,
                  child: const Text(
                    'Resend code',
                    style: TextStyle(
                      color: ColorApp.primary,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffixIcon,
    bool enabled = true,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: enabled ? const Color(0xFFF1F5F9) : const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscureText,
        enabled: enabled,
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
