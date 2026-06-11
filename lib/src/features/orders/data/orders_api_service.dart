import 'package:cleanapp/src/core/services/base_api_service.dart';
import 'package:cleanapp/src/features/services/booking_pricing.dart';
import 'package:dio/dio.dart';

class OrdersApiService extends BaseApiService {
  Future<List<Map<String, dynamic>>> getOrders() async {
    try {
      final response = await dio.get('/api/orders');
      return (response.data as List<dynamic>)
          .map((item) => item as Map<String, dynamic>)
          .toList();
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load orders');
    }
  }

  Future<void> createServiceOrder({
    required String serviceId,
    required String houseConfigId,
    required int extraWorkers,
    required bool useMaterials,
    required BookingMaterial materialType,
    required DateTime scheduledDate,
    required String address,
    String? promoCode,
    String? clientNote,
    List<String>? housePictures,
  }) async {
    try {
      await dio.post(
        '/api/orders',
        data: {
          'serviceId': serviceId,
          'houseConfigId': houseConfigId,
          'extraWorkers': extraWorkers,
          'useMaterials': useMaterials,
          'productOrigin': useMaterials
              ? (materialType == BookingMaterial.imported ? 'IMPORTED' : 'LOCAL')
              : 'NONE',
          'scheduledDate': scheduledDate.toIso8601String(),
          'address': address,
          if (promoCode != null && promoCode.isNotEmpty) 'promoCode': promoCode,
          if (clientNote != null && clientNote.isNotEmpty) 'clientNote': clientNote,
          if (housePictures != null && housePictures.isNotEmpty)
            'housePictures': housePictures,
        },
      );
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to create order');
    }
  }

  Future<void> createCategoryOrder({
    required String categoryId,
    required String categoryServiceId,
    required bool useMaterials,
    required BookingMaterial materialType,
    required DateTime scheduledDate,
    required String address,
    String? promoCode,
    String? clientNote,
    List<String>? housePictures,
  }) async {
    try {
      await dio.post(
        '/api/orders',
        data: {
          'categoryId': categoryId,
          'categoryServiceId': categoryServiceId,
          'extraWorkers': 0,
          'useMaterials': useMaterials,
          'productOrigin': useMaterials
              ? (materialType == BookingMaterial.imported
                  ? 'IMPORTED'
                  : 'LOCAL')
              : 'NONE',
          'scheduledDate': scheduledDate.toIso8601String(),
          'address': address,
          if (promoCode != null && promoCode.isNotEmpty) 'promoCode': promoCode,
          if (clientNote != null && clientNote.isNotEmpty) 'clientNote': clientNote,
          if (housePictures != null && housePictures.isNotEmpty)
            'housePictures': housePictures,
        },
      );
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to create order');
    }
  }

  /// Uploads one image file (multipart) and returns its server path
  /// (e.g. /uploads/<name>.jpg) for use in housePictures.
  Future<String> uploadImage(String filePath) async {
    try {
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath),
      });
      final response = await dio.post('/api/upload', data: form);
      return (response.data as Map<String, dynamic>)['url'] as String;
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to upload image');
    }
  }

  /// Validates a promo code against the backend. Returns the discount percent
  /// when valid; throws with the backend's message when invalid/expired.
  Future<double> validatePromo(String code) async {
    try {
      final response = await dio.get('/api/promos/$code');
      final data = response.data as Map<String, dynamic>;
      return (data['discountPercent'] as num).toDouble();
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Invalid promo code');
    }
  }
}
