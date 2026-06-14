import 'package:cleanapp/firebase_options.dart';
import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/common/cubit/locale_cubit.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/services/notification_service.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/auth/cubit/auth_cubit.dart';
import 'package:cleanapp/src/features/home/cubit/home_content_cubit.dart';
import 'package:cleanapp/src/features/home/data/home_content_repository.dart';
import 'package:cleanapp/src/features/notifications/data/notification_inbox_repository.dart';
import 'package:cleanapp/src/features/splash/pages/splash_page.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (!kIsWeb) {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  }
  setupLocator();
  if (!kIsWeb) {
    await locator<NotificationService>().init();
  }
  // Load the last cached home content so the home screen renders real data
  // on its first frame instead of the static placeholders.
  await locator<HomeContentRepository>().hydrate();
  await locator<NotificationInboxRepository>().hydrate();
  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => AuthCubit()),
        BlocProvider(create: (context) => LocaleCubit()),
        BlocProvider(
          create: (context) =>
              HomeContentCubit(locator<HomeContentRepository>()),
        ),
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
