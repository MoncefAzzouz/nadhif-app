import 'package:cleanapp/src/core/services/base_api_service.dart';
import 'package:dio/dio.dart';

String _pickLocalized(
    Map<String, dynamic> json, String base, String locale) {
  final ar = json['${base}Ar'] as String? ?? '';
  final fr = json['${base}Fr'] as String? ?? '';
  final def = json[base] as String? ?? '';
  if (locale == 'ar' && ar.trim().isNotEmpty) return ar;
  if (locale == 'fr' && fr.trim().isNotEmpty) return fr;
  return def;
}

class AppPropertyType {
  const AppPropertyType({required this.id, required this.raw});

  final String id;
  final Map<String, dynamic> raw;

  String nameFor(String locale) => _pickLocalized(raw, 'name', locale);

  factory AppPropertyType.fromJson(Map<String, dynamic> json) =>
      AppPropertyType(id: json['id'] as String, raw: json);
}

class AppServiceTier {
  const AppServiceTier({
    required this.id,
    required this.durationHours,
    required this.workers,
    required this.raw,
  });

  final String id;
  final int durationHours;
  final int workers;
  final Map<String, dynamic> raw;

  String nameFor(String locale) => _pickLocalized(raw, 'name', locale);
  String get description => raw['description'] as String? ?? '';

  factory AppServiceTier.fromJson(Map<String, dynamic> json) => AppServiceTier(
        id: json['id'] as String,
        durationHours: json['durationHours'] as int? ?? 3,
        workers: json['workers'] as int? ?? 1,
        raw: json,
      );
}

class AppSubscription {
  const AppSubscription({required this.raw});

  final Map<String, dynamic> raw;

  String get id => raw['id'] as String? ?? '';
  String get status => raw['status'] as String? ?? 'PENDING';
  double get monthlyPrice => ((raw['monthlyPrice'] as num?) ?? 0).toDouble();
  int get daysPerWeek => raw['daysPerWeek'] as int? ?? 0;
  String get tierName =>
      (raw['serviceTier'] as Map<String, dynamic>?)?['name'] as String? ?? '';
  String get propertyTypeName =>
      (raw['propertyType'] as Map<String, dynamic>?)?['name'] as String? ?? '';
  int get sessionsCount => ((raw['sessions'] as List<dynamic>?) ?? []).length;

  factory AppSubscription.fromJson(Map<String, dynamic> json) =>
      AppSubscription(raw: json);
}

class SubscriptionsApiService extends BaseApiService {
  Future<List<AppPropertyType>> getPropertyTypes() async {
    try {
      final response = await dio.get('/api/subscriptions/property-types');
      return (response.data as List<dynamic>)
          .map((i) => AppPropertyType.fromJson(i as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load property types');
    }
  }

  Future<List<AppServiceTier>> getServiceTiers() async {
    try {
      final response = await dio.get('/api/subscriptions/service-tiers');
      return (response.data as List<dynamic>)
          .map((i) => AppServiceTier.fromJson(i as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load service tiers');
    }
  }

  Future<List<AppSubscription>> getMySubscriptions() async {
    try {
      final response = await dio.get('/api/subscriptions');
      return (response.data as List<dynamic>)
          .map((i) => AppSubscription.fromJson(i as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load subscriptions');
    }
  }

  Future<void> createSubscription({
    required String propertyTypeId,
    required double surfaceM2,
    required int roomsToClean,
    required String serviceTierId,
    required int daysPerWeek,
    required String address,
    List<String>? pictures,
  }) async {
    try {
      await dio.post(
        '/api/subscriptions',
        data: {
          'propertyTypeId': propertyTypeId,
          'surfaceM2': surfaceM2,
          'roomsToClean': roomsToClean,
          'serviceTierId': serviceTierId,
          'daysPerWeek': daysPerWeek,
          'address': address,
          if (pictures != null && pictures.isNotEmpty) 'pictures': pictures,
        },
      );
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to request subscription');
    }
  }
}
