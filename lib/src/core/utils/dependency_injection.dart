import 'package:get_it/get_it.dart';
// import 'package:dio/dio.dart';
// import 'package:pretty_dio_logger/pretty_dio_logger.dart';
// import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final locator = GetIt.instance;

void setupLocator() {
  // Core services
  /*
  locator.registerLazySingleton<Dio>(() => Dio(
        BaseOptions(
          connectTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 30),
          sendTimeout: const Duration(seconds: 30),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ),
      )..interceptors.add(PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
          responseBody: true,
          responseHeader: false,
          error: true,
          compact: true,
        )));

  locator.registerLazySingleton<FlutterSecureStorage>(
    () => const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true),
    ),
  );
  */

  // Add more services and repositories here as they are created
  // Example:
  // locator.registerLazySingleton<AuthService>(() => AuthService());
}
