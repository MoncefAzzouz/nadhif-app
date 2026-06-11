import 'package:cleanapp/src/core/services/base_api_service.dart';
import 'package:dio/dio.dart';

/// Talks to the backend endpoints that store a user's FCM device token so the
/// server can target push notifications at the right devices.
class NotificationsApiService extends BaseApiService {
  Future<void> registerToken({
    required String token,
    required String platform,
  }) async {
    try {
      await dio.post(
        '/api/notifications/token',
        data: {'token': token, 'platform': platform},
      );
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to register device token');
    }
  }

  Future<void> unregisterToken(String token) async {
    try {
      await dio.delete(
        '/api/notifications/token',
        data: {'token': token},
      );
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to remove device token');
    }
  }
}
