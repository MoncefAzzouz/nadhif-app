import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:video_player/video_player.dart';
import 'package:cleanapp/src/features/auth/cubit/auth_cubit.dart';
import 'package:cleanapp/src/features/home/pages/home_page.dart';
import '../../../core/res/color_app.dart';
import '../../onboarding/pages/onboarding_page.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _mainController;
  late final VideoPlayerController _logoVideoController;

  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _logoVideoController = VideoPlayerController.asset(
      'assets/animation/splash_video.mp4',
    )
      ..setLooping(false)
      ..setVolume(0);
    _logoVideoController.initialize().then((_) {
      if (!mounted) return;
      setState(() {});
      _logoVideoController.play();
    });

    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 6500),
    );

    // Scene 4: 4.5s -> 5.5s (0.69 -> 0.85) - Pulse
    _pulseAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.05), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 1.05, end: 1.0), weight: 50),
    ]).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.69, 0.85, curve: Curves.easeInOut),
      ),
    );

    _mainController.forward().then((_) async {
      final loggedIn = await context.read<AuthCubit>().checkAuthStatus();
      if (loggedIn && mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const HomePage()),
        );
      } else if (mounted) {
        _navigateToOnboarding();
      }
    });
  }

  void _navigateToOnboarding() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const OnboardingPage(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          final slideAnimation = Tween<Offset>(
            begin: const Offset(-1.0, 0.0),
            end: Offset.zero,
          ).animate(CurvedAnimation(
            parent: animation,
            curve: Curves.easeInOutQuart,
          ));

          final fadeAnimation = Tween<double>(
            begin: 0.0,
            end: 1.0,
          ).animate(CurvedAnimation(
            parent: animation,
            curve: const Interval(0.0, 0.5),
          ));

          return SlideTransition(
            position: slideAnimation,
            child: FadeTransition(
              opacity: fadeAnimation,
              child: child,
            ),
          );
        },
        transitionDuration: const Duration(milliseconds: 1000),
      ),
    );
  }

  @override
  void dispose() {
    _mainController.dispose();
    _logoVideoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorApp.background,
      body: Stack(
        children: [
          // Scene 3 & 4: Logo video reveal & Pulse
          // Screen-blended so the video's black background disappears and
          // only the bright logo composites over the animated background.
          if (_logoVideoController.value.isInitialized)
            AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return Transform.scale(
                  scale: _pulseAnimation.value,
                  child: child,
                );
              },
              child: BackdropFilter(
                filter: ImageFilter.blur(),
                blendMode: BlendMode.screen,
                child: SizedBox.expand(
                  child: FittedBox(
                    fit: BoxFit.cover,
                    child: SizedBox(
                      width: _logoVideoController.value.size.width,
                      height: _logoVideoController.value.size.height,
                      child: VideoPlayer(_logoVideoController),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
