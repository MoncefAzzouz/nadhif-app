import 'dart:ui';
import 'package:flutter/material.dart';
import '../../../core/res/color_app.dart';

class TextRevealWidget extends StatelessWidget {
  final String text;
  final Animation<double> controller;
  final double startInterval;
  final double endInterval;

  const TextRevealWidget({
    super.key,
    required this.text,
    required this.controller,
    required this.startInterval,
    required this.endInterval,
  });

  @override
  Widget build(BuildContext context) {
    final letters = text.split('');
    final intervalStep = (endInterval - startInterval) / letters.length;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(letters.length, (index) {
        // Overlap letters slightly for a more organic feel
        final letterStart = startInterval + (index * intervalStep * 0.7);
        final letterEnd = letterStart + (intervalStep * 1.5);

        return _AnimatedLetter(
          letter: letters[index],
          animation: CurvedAnimation(
            parent: controller,
            curve: Interval(
              letterStart.clamp(0.0, 1.0),
              letterEnd.clamp(0.0, 1.0),
              curve: Curves.easeOutBack, // Back curve gives it a "pop"
            ),
          ),
        );
      }),
    );
  }
}

class _AnimatedLetter extends StatelessWidget {
  final String letter;
  final Animation<double> animation;

  const _AnimatedLetter({
    required this.letter,
    required this.animation,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) {
        final progress = animation.value;
        
        // Complex "Building" transforms
        final opacity = (progress * 2).clamp(0.0, 1.0);
        final scale = 0.3 + (progress * 0.7);
        final blur = (1 - progress) * 15.0;
        final rotateX = (1 - progress) * 1.5; // 3D Tilt
        final offsetY = 40.0 * (1 - progress);

        return Opacity(
          opacity: opacity,
          child: Transform(
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.002) // perspective
              ..rotateX(rotateX)
              ..translate(0.0, offsetY),
            alignment: Alignment.center,
            child: Transform.scale(
              scale: scale,
              child: ImageFiltered(
                imageFilter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Subtle light flash behind the building letter
                    if (progress > 0.1 && progress < 0.6)
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: ColorApp.white.withOpacity(0.3 * (1 - progress)),
                          boxShadow: [
                            BoxShadow(
                              color: ColorApp.white.withOpacity(0.2),
                              blurRadius: 30 * progress,
                              spreadRadius: 10 * progress,
                            ),
                          ],
                        ),
                      ),
                    Text(
                      letter,
                      style: TextStyle(
                        color: ColorApp.white,
                        fontSize: 54,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 4,
                        shadows: [
                          Shadow(
                            color: Colors.white.withOpacity(0.3 * progress),
                            blurRadius: 15 * progress,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
