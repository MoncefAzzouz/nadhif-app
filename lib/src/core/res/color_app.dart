import 'package:flutter/material.dart';

class ColorApp {
  ColorApp._();

  // Vibrant Electric Blue based on the user screenshot
  static const Color primary = Color(0xFF415CFF);
  static const Color background = Color(0xFF415CFF);
  static const Color primaryDark = Color(0xFF334ECC);
  static const Color white = Color(0xFFFFFFFF);
  static const Color textBlack = Color(0xFF1E293B);
  static const Color textGrey = Color(0xFF64748B);
  static const Color error = Color(0xFFE53935);
  static const Color success = Color(0xFF415CFF);
  static const Color greyBorder = Color(0xFFF0F0F0);
  static const Color softGrey = Color(0xFFF8F9FA);
  static const Color shadowColor = Color(0x0A000000);
  static const Color scaffoldBg = Color(0xFFF9F9F9);

  // Accent surface tints used across home/services/orders cards.
  static const Color tintRose = Color(0xFFFFF1F2);
  static const Color tintMint = Color(0xFFF0FDF4);
  static const Color tintSky = Color(0xFFF0F9FF);
  static const Color tintSlate = Color(0xFFF1F5F9);
  static const Color tintAmberSoft = Color(0xFFFFF7ED);

  // Gradient stops.
  static const Color gradientSecondary = Color(0xFF475569);
  static const Color gradientTeal = Color(0xFF00BFA5);

  // Glow/Particle colors
  static Color get ambientGlow => white.withValues(alpha: 0.2);
  static Color get particleColor => white.withValues(alpha: 0.4);
}
