import 'package:flutter/material.dart';
import '../../../core/res/color_app.dart';

class ColorRevealWidget extends StatelessWidget {
  final double progress;
  final Widget? child;

  const ColorRevealWidget({
    super.key,
    required this.progress,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: ColorExpansionPainter(progress: progress),
      child: child,
    );
  }
}

class ColorExpansionPainter extends CustomPainter {
  final double progress;

  ColorExpansionPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0) return;

    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.longestSide * 1.2;
    final currentRadius = maxRadius * progress;

    final paint = Paint()
      ..shader = RadialGradient(
        colors: [
          ColorApp.primary,
          ColorApp.primary.withValues(alpha: 0.8),
          Colors.transparent,
        ],
        stops: const [0.0, 0.8, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: currentRadius));

    canvas.drawCircle(center, currentRadius, paint);
    
    // Add a glow/bloom effect around the edges
    if (progress < 1.0) {
      final glowPaint = Paint()
        ..color = ColorApp.primary.withValues(alpha: 0.3 * (1 - progress))
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 30);
      canvas.drawCircle(center, currentRadius, glowPaint);
    }
  }

  @override
  bool shouldRepaint(covariant ColorExpansionPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
