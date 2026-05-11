import 'package:flutter/material.dart';

class ColorApp {
  ColorApp._();

  // The exact vibrant blue from the user's screenshots
  static const Color primary = Color(0xFF3A55FF); 
  static const Color background = Color(0xFF3A55FF); // Background is now the brand color from the start
  static const Color white = Color(0xFFFFFFFF);
  static const Color textBlack = Color(0xFF000000);
  static const Color textGrey = Color(0xFF808080);
  static const Color error = Color(0xFFE53935);
  static const Color success = Color(0xFF43A047);
  static const Color greyBorder = Color(0xFFF0F0F0);
  static const Color softGrey = Color(0xFFF8F9FA);
  static const Color shadowColor = Color(0x0A000000);

  // Glow/Particle colors
  static Color get ambientGlow => white.withOpacity(0.2);
  static Color get particleColor => white.withOpacity(0.4);
}
