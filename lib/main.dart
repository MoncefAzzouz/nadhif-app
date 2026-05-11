import 'package:flutter/material.dart';
// import 'package:flutter_localizations/flutter_localizations.dart';
// import 'package:google_fonts/google_fonts.dart';
import 'src/core/utils/dependency_injection.dart';
import 'src/core/res/color_app.dart';

import 'src/features/splash/pages/splash_page.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  setupLocator();
  runApp(const CleanApp());
}

class CleanApp extends StatelessWidget {
  const CleanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Clean App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: ColorApp.primary,
          primary: ColorApp.primary,
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: Colors.white,
      ),
      /*
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('fr', ''),
        Locale('en', ''),
        Locale('ar', ''),
      ],
      */
      home: const SplashPage(),
    );
  }
}
