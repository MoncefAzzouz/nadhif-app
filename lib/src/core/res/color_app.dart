import 'package:flutter/material.dart';

class ColorApp {
  ColorApp._();

  // The vibrant Teal/Cyan from the Moueene screenshot
  static const Color primary = Color(0xFF00C8A8); 
  static const Color background = Color(0xFF00C8A8); 
  static const Color primaryDark = Color(0xFF00A88E);
  static const Color white = Color(0xFFFFFFFF);
  static const Color textBlack = Color(0xFF1E293B);
  static const Color textGrey = Color(0xFF64748B);
  static const Color error = Color(0xFFE53935);
  static const Color success = Color(0xFF00C8A8);
  static const Color greyBorder = Color(0xFFF0F0F0);
  static const Color softGrey = Color(0xFFF8F9FA);
  static const Color shadowColor = Color(0x0A000000);

  // Glow/Particle colors
  static Color get ambientGlow => white.withOpacity(0.2);
  static Color get particleColor => white.withOpacity(0.4);
}
