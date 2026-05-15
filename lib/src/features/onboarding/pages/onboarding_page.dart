import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/media_res.dart';
import 'package:cleanapp/src/features/auth/pages/phone_number_page.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<String> _images = [
    MediaRes.onboarding1,
    MediaRes.onboarding2,
    MediaRes.onboarding3,
  ];

  void _onNext() {
    if (_currentPage < _images.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOutQuart,
      );
    } else {
      _navigateToLogin();
    }
  }

  void _navigateToLogin() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const PhoneNumberPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Full Screen Background PageView
          PageView.builder(
            controller: _pageController,
            physics: const ClampingScrollPhysics(),
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemCount: _images.length,
            itemBuilder: (context, index) {
              return Container(
                width: double.infinity,
                height: double.infinity,
                decoration: BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage(_images[index]),
                    fit: BoxFit.cover,
                  ),
                ),
              );
            },
          ),

          // Top Header (Skip Button)
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            right: 20,
            child: TextButton(
              onPressed: _navigateToLogin,
              style: TextButton.styleFrom(
                backgroundColor: Colors.black.withOpacity(0.3),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              child: const Text(
                "Skip",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),

          // Bottom Controls (Dots & Next Button)
          Positioned(
            bottom: 5,
            left: 20,
            right: 20,
            child: SizedBox(
              height: 100,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Page Indicators (Dots) in the middle
                  Directionality(
                    textDirection: TextDirection.ltr,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: List.generate(
                        _images.length,
                        (index) => AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          height: 8,
                          width: _currentPage == index ? 24 : 8,
                          decoration: BoxDecoration(
                            color: _currentPage == index 
                                ? ColorApp.primary 
                                : ColorApp.primary.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Next Button (Right Aligned)
                  Positioned(
                    right: 0,
                    child: GestureDetector(
                      onTap: _onNext,
                      child: Directionality(
                        textDirection: TextDirection.ltr,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          decoration: BoxDecoration(
                            color: ColorApp.primary,
                            borderRadius: BorderRadius.circular(30),
                            boxShadow: [
                              BoxShadow(
                                color: ColorApp.primary.withOpacity(0.4),
                                blurRadius: 15,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _currentPage == _images.length - 1 ? "Start" : "Next",
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 18),
                            ],
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
