import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cleanapp/src/features/auth/cubit/auth_cubit.dart';
import 'package:cleanapp/src/features/home/pages/home_page.dart';
import '../../../core/res/color_app.dart';
import '../widgets/text_reveal_widget.dart';
import '../../onboarding/pages/onboarding_page.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _mainController;

  // Animation sequences
  late Animation<double> _ambientGlowAnimation;
  late Animation<double> _colorExpansionAnimation;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 6500),
    );

    // Scene 1: 0s -> 1s (0.0 -> 0.15) - Ambient light appears
    _ambientGlowAnimation = CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.0, 0.15, curve: Curves.easeIn),
    );

    // Scene 2: 1s -> 2.5s (0.15 -> 0.38) - Bloom/Glow Expansion
    _colorExpansionAnimation = CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.15, 0.38, curve: Curves.easeInOutCubic),
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorApp.background, // Starts with brand blue
      body: Stack(
        children: [
          // Scene 1: Ambient Glow (White bloom on blue)
          Center(
            child: AnimatedBuilder(
              animation: _ambientGlowAnimation,
              builder: (context, child) {
                return Container(
                  width: 400,
                  height: 400,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        Colors.white
                            .withValues(alpha: 0.15 * _ambientGlowAnimation.value),
                        Colors.transparent,
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Scene 2: Bloom Reveal (Instead of color expansion, we use a glow expansion)
          AnimatedBuilder(
            animation: _colorExpansionAnimation,
            builder: (context, child) {
              return Center(
                child: CustomPaint(
                  painter: BloomExpansionPainter(
                      progress: _colorExpansionAnimation.value),
                ),
              );
            },
          ),

          // Scene 3 & 4: Text Reveal & Pulse
          Center(
            child: AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return Transform.scale(
                  scale: _pulseAnimation.value,
                  child: TextRevealWidget(
                    text: "NADHIF",
                    controller: _mainController,
                    startInterval: 0.38, // 2.5s
                    endInterval: 0.69, // 4.5s
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class BloomExpansionPainter extends CustomPainter {
  final double progress;

  BloomExpansionPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0) return;

    const center = Offset.zero; // relative to parent center
    const maxRadius = 1000.0;
    final currentRadius = maxRadius * progress;

    final paint = Paint()
      ..shader = RadialGradient(
        colors: [
          Colors.white.withValues(alpha: 0.2 * (1 - progress)),
          Colors.white.withValues(alpha: 0.05 * (1 - progress)),
          Colors.transparent,
        ],
        stops: const [0.0, 0.5, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: currentRadius));

    canvas.drawCircle(center, currentRadius, paint);
  }

  @override
  bool shouldRepaint(covariant BloomExpansionPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
