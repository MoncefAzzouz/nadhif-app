import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:cleanapp/src/core/res/media_res.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'verification_method_page.dart';

class PhoneNumberPage extends StatefulWidget {
  const PhoneNumberPage({Key? key}) : super(key: key);

  @override
  State<PhoneNumberPage> createState() => _PhoneNumberPageState();
}

class _PhoneNumberPageState extends State<PhoneNumberPage> {
  final TextEditingController _phoneController = TextEditingController();

  void _handleConnect() {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => VerificationMethodPage(phoneNumber: phone),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorApp.primary,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              flex: 35,
              child: Container(
                width: double.infinity,
                color: ColorApp.primary,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      MediaRes.logo,
                      width: 200,
                      height: 80,
                      fit: BoxFit.contain,
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              flex: 65,
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Connect to your account",
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: ColorApp.textBlack,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        "Enter your phone number to continue. We will send you a verification code.",
                        style: TextStyle(
                          fontSize: 14,
                          color: ColorApp.textGrey,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 40),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              backgroundImage:
                                  const AssetImage(MediaRes.algeriaFlag),
                              radius: 14,
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              "ALG +213",
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: ColorApp.textBlack,
                              ),
                            ),
                            const SizedBox(width: 8),
                            SvgPicture.asset(
                              MediaRes.doubleArrow,
                              width: 8,
                              height: 12,
                              colorFilter: const ColorFilter.mode(
                                  ColorApp.textBlack, BlendMode.srcIn),
                            ),
                            const SizedBox(width: 12),
                            Container(
                                width: 1, height: 24, color: Colors.grey[300]),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextField(
                                controller: _phoneController,
                                keyboardType: TextInputType.phone,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: ColorApp.textBlack,
                                ),
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly,
                                  LengthLimitingTextInputFormatter(10),
                                ],
                                decoration: const InputDecoration(
                                  hintText: "Phone Number",
                                  border: InputBorder.none,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: _handleConnect,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ColorApp.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            elevation: 0,
                          ),
                          child: const Text(
                            "Continue",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 40),
                      const Center(
                        child: Text(
                          "By continuing, you agree to our Terms and Privacy Policy",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            color: ColorApp.textGrey,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ],
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
