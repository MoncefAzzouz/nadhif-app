import 'dart:math';
import 'package:flutter/material.dart';
import '../../../core/res/color_app.dart';

class ParticlesWidget extends StatefulWidget {
  const ParticlesWidget({super.key});

  @override
  State<ParticlesWidget> createState() => _ParticlesWidgetState();
}

class _ParticlesWidgetState extends State<ParticlesWidget> with SingleTickerProviderStateMixin {
  late List<Particle> particles;
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    particles = List.generate(30, (index) => Particle());
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..addListener(() {
        setState(() {
          for (var particle in particles) {
            particle.update();
          }
        });
      })..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: ParticlesPainter(particles),
      size: Size.infinite,
    );
  }
}

class Particle {
  double x = Random().nextDouble();
  double y = Random().nextDouble();
  double size = Random().nextDouble() * 2 + 1;
  double velocityX = (Random().nextDouble() - 0.5) * 0.001;
  double velocityY = (Random().nextDouble() - 0.5) * 0.001;
  double opacity = Random().nextDouble() * 0.5 + 0.2;

  void update() {
    x += velocityX;
    y += velocityY;

    if (x < 0 || x > 1) velocityX *= -1;
    if (y < 0 || y > 1) velocityY *= -1;
  }
}

class ParticlesPainter extends CustomPainter {
  final List<Particle> particles;

  ParticlesPainter(this.particles);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = ColorApp.particleColor;

    for (var particle in particles) {
      final pPaint = paint..color = ColorApp.particleColor.withValues(alpha: particle.opacity);
      canvas.drawCircle(
        Offset(particle.x * size.width, particle.y * size.height),
        particle.size,
        pPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
