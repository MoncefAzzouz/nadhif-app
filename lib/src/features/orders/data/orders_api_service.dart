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
    required int cleaners,
    required bool useMaterials,
    required BookingMaterial materialType,
    required DateTime scheduledDate,
    required String address,
    String? promoCode,
  }) async {
    try {
      await dio.post(
        '/api/orders',
        data: {
          'serviceId': serviceId,
          'houseConfigId': houseConfigId,
          'extraWorkers': cleaners > 1 ? cleaners - 1 : 0,
          'useMaterials': useMaterials,
          'productOrigin': useMaterials
              ? (materialType == BookingMaterial.imported ? 'IMPORTED' : 'LOCAL')
              : 'NONE',
          'scheduledDate': scheduledDate.toIso8601String(),
          'address': address,
          if (promoCode != null && promoCode.isNotEmpty) 'promoCode': promoCode,
        },
      );
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to create order');
    }
  }
}
