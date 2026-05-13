import 'package:flutter/material.dart';
import 'package:cleanapp/src/core/res/color_app.dart';

class AppShadows {
  AppShadows._();

  static const List<BoxShadow> card = <BoxShadow>[
    BoxShadow(
      color: Color(0x0A000000),
      blurRadius: 10,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> cardSubtle = <BoxShadow>[
    BoxShadow(
      color: Color(0x05000000),
      blurRadius: 10,
      offset: Offset(0, 5),
    ),
  ];

  static const List<BoxShadow> elevated = <BoxShadow>[
    BoxShadow(
      color: Color(0x0A000000),
      blurRadius: 20,
      offset: Offset(0, 10),
    ),
  ];

  static const List<BoxShadow> bottomBar = <BoxShadow>[
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 30,
      offset: Offset(0, 10),
    ),
  ];

  static const List<BoxShadow> topBar = <BoxShadow>[
    BoxShadow(
      color: Color(0x0F000000),
      blurRadius: 30,
      offset: Offset(0, -10),
    ),
  ];

  static const List<BoxShadow> chipSelected = <BoxShadow>[
    BoxShadow(
      color: Color(0x26000000),
      blurRadius: 15,
      offset: Offset(0, 8),
    ),
  ];

  static List<BoxShadow> primaryGlow({double opacity = 0.23}) => <BoxShadow>[
        BoxShadow(
          color: ColorApp.primary.withValues(alpha: opacity),
          blurRadius: 15,
          offset: const Offset(0, 8),
        ),
      ];

  static List<BoxShadow> primaryGlowLarge({double opacity = 0.23}) =>
      <BoxShadow>[
        BoxShadow(
          color: ColorApp.primary.withValues(alpha: opacity),
          blurRadius: 25,
          offset: const Offset(0, 10),
        ),
      ];
}
