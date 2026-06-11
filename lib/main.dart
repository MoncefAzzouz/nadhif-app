import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/common/cubit/locale_cubit.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/auth/cubit/auth_cubit.dart';
import 'package:cleanapp/src/features/splash/pages/splash_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  setupLocator();
  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => AuthCubit()),
        BlocProvider(create: (context) => LocaleCubit()),
      ],
      child: const CleanApp(),
    ),
  );
}

class CleanApp extends StatelessWidget {
  const CleanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocaleCubit, Locale>(
      builder: (context, locale) {
        return MaterialApp(
          title: 'Nadhif App',
          debugShowCheckedModeBanner: false,
          locale: locale,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en', ''),
            Locale('fr', ''),
            Locale('ar', ''),
          ],
          theme: ThemeData(
            useMaterial3: true,
            fontFamily: 'Gilmer',
            colorScheme: ColorScheme.fromSeed(
              seedColor: ColorApp.primary,
              primary: ColorApp.primary,
              surface: Colors.white,
            ),
            scaffoldBackgroundColor: Colors.white,
            appBarTheme: const AppBarTheme(
              backgroundColor: ColorApp.primary,
              elevation: 0,
              centerTitle: true,
              iconTheme: IconThemeData(color: Colors.white),
              titleTextStyle: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontFamily: 'Gilmer',
                fontWeight: FontWeight.w700,
              ),
              systemOverlayStyle: SystemUiOverlayStyle.light,
            ),
          ),
          home: const SplashPage(),
        );
      },
    );
  }
}
