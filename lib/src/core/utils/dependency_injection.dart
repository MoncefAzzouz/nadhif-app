import 'package:get_it/get_it.dart';
import 'package:cleanapp/src/core/config/app_config.dart';
import 'package:cleanapp/src/core/services/auth_token_store.dart';
import 'package:cleanapp/src/core/services/notification_service.dart';
import 'package:cleanapp/src/features/auth/data/auth_api_service.dart';
import 'package:cleanapp/src/features/notifications/data/notifications_api_service.dart';
import 'package:cleanapp/src/features/orders/data/orders_api_service.dart';
import 'package:cleanapp/src/features/services/data/services_api_service.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

final locator = GetIt.instance;

void setupLocator() {
  if (locator.isRegistered<Dio>()) return;

  locator.registerLazySingleton<Dio>(() => Dio(
        BaseOptions(
          baseUrl: AppConfig.apiBaseUrl,
          connectTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 30),
          sendTimeout: const Duration(seconds: 30),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ),
      )
        ..interceptors.add(InterceptorsWrapper(
          onRequest: (options, handler) async {
            final token = await locator<AuthTokenStore>().readToken();
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            }
            handler.next(options);
          },
        ))
        ..interceptors.add(PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
          responseBody: false,
          responseHeader: false,
          error: true,
          compact: true,
        )));

  locator.registerLazySingleton<FlutterSecureStorage>(
    () => const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true),
    ),
  );

  locator.registerLazySingleton<AuthTokenStore>(
    () => AuthTokenStore(locator<FlutterSecureStorage>()),
  );
  locator.registerLazySingleton<AuthApiService>(() => AuthApiService());
  locator.registerLazySingleton<ServicesApiService>(() => ServicesApiService());
  locator.registerLazySingleton<OrdersApiService>(() => OrdersApiService());
  locator.registerLazySingleton<NotificationsApiService>(
    () => NotificationsApiService(),
  );
  locator.registerLazySingleton<NotificationService>(
    () => NotificationService(locator<NotificationsApiService>()),
  );
}
