import 'package:flutter/widgets.dart';

class AppSpacings {
  AppSpacings._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;

  static const EdgeInsets pagePadding =
      EdgeInsets.symmetric(horizontal: xxl, vertical: sm);

  static const EdgeInsets pageHorizontal =
      EdgeInsets.symmetric(horizontal: xxl);
}

class AppRadii {
  AppRadii._();

  static const BorderRadius card = BorderRadius.all(Radius.circular(20));
  static const BorderRadius cardLg = BorderRadius.all(Radius.circular(28));
  static const BorderRadius cardXl = BorderRadius.all(Radius.circular(32));
  static const BorderRadius chip = BorderRadius.all(Radius.circular(24));
  static const BorderRadius button = BorderRadius.all(Radius.circular(14));
}
