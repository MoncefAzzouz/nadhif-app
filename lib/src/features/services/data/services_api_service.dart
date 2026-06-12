import 'package:cleanapp/src/core/services/base_api_service.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:dio/dio.dart';

class ServicesApiService extends BaseApiService {
  Future<List<AppService>> getServices() async {
    try {
      final response = await dio.get('/api/services');
      final items = response.data as List<dynamic>;
      return items
          .map((item) => AppService.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load services');
    }
  }

  Future<List<AppCategory>> getCategories() async {
    try {
      final response = await dio.get('/api/categories');
      final items = response.data as List<dynamic>;
      return items
          .map((item) => AppCategory.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load categories');
    }
  }

  /// Days the admin locked for booking, as 'YYYY-MM-DD' strings.
  Future<List<String>> getLockedDays() async {
    try {
      final response = await dio.get('/api/pages/locked-days');
      return (response.data as List<dynamic>).map((d) => d.toString()).toList();
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load locked days');
    }
  }
}
