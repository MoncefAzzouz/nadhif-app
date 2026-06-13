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

class AppSubscriptionSession {
  const AppSubscriptionSession({required this.raw});

  final Map<String, dynamic> raw;

  DateTime? get scheduledDate =>
      DateTime.tryParse(raw['scheduledDate'] as String? ?? '')?.toLocal();
  String get status => raw['status'] as String? ?? 'SCHEDULED';
  int get durationHours => raw['durationHours'] as int? ?? 3;
}

class AppSubscription {
  const AppSubscription({required this.raw});

  final Map<String, dynamic> raw;

  String get id => raw['id'] as String? ?? '';
  String get status => raw['status'] as String? ?? 'PENDING';
  double get monthlyPrice => ((raw['monthlyPrice'] as num?) ?? 0).toDouble();
  double get amountPaid => ((raw['amountPaid'] as num?) ?? 0).toDouble();
  int get daysPerWeek => raw['daysPerWeek'] as int? ?? 0;
  double get surfaceM2 => ((raw['surfaceM2'] as num?) ?? 0).toDouble();
  int get roomsToClean => raw['roomsToClean'] as int? ?? 0;
  String get tierName =>
      (raw['serviceTier'] as Map<String, dynamic>?)?['name'] as String? ?? '';
  String tierNameFor(String locale) {
    final tier = raw['serviceTier'] as Map<String, dynamic>?;
    return tier == null ? '' : _pickLocalized(tier, 'name', locale);
  }

  int get tierDurationHours =>
      (raw['serviceTier'] as Map<String, dynamic>?)?['durationHours'] as int? ?? 3;
  String get propertyTypeName =>
      (raw['propertyType'] as Map<String, dynamic>?)?['name'] as String? ?? '';
  String propertyTypeNameFor(String locale) {
    final prop = raw['propertyType'] as Map<String, dynamic>?;
    return prop == null ? '' : _pickLocalized(prop, 'name', locale);
  }

  List<AppSubscriptionSession> get sessions =>
      ((raw['sessions'] as List<dynamic>?) ?? [])
          .map((s) => AppSubscriptionSession(raw: s as Map<String, dynamic>))
          .toList();
  int get sessionsCount => ((raw['sessions'] as List<dynamic>?) ?? []).length;

  factory AppSubscription.fromJson(Map<String, dynamic> json) =>
      AppSubscription(raw: json);
}

class AvailableDay {
  const AvailableDay({
    required this.date,
    required this.dayName,
    required this.availableCleanerCount,
    required this.isAvailable,
    required this.isLocked,
  });

  final String date; // yyyy-MM-dd
  final String dayName;
  final int availableCleanerCount;
  final bool isAvailable;
  final bool isLocked;

  factory AvailableDay.fromJson(Map<String, dynamic> json) => AvailableDay(
        date: json['date'] as String? ?? '',
        dayName: json['dayName'] as String? ?? '',
        availableCleanerCount: json['availableCleanerCount'] as int? ?? 0,
        isAvailable: json['isAvailable'] as bool? ?? false,
        isLocked: json['isLocked'] as bool? ?? false,
      );
}

class AvailableWeek {
  const AvailableWeek({required this.week, required this.days});

  final int week;
  final List<AvailableDay> days;

  factory AvailableWeek.fromJson(Map<String, dynamic> json) => AvailableWeek(
        week: json['week'] as int? ?? 0,
        days: ((json['days'] as List<dynamic>?) ?? [])
            .map((d) => AvailableDay.fromJson(d as Map<String, dynamic>))
            .toList(),
      );
}

class AvailableDaysResult {
  const AvailableDaysResult({
    required this.daysPerWeek,
    required this.durationHours,
    required this.weeks,
  });

  final int daysPerWeek;
  final int durationHours;
  final List<AvailableWeek> weeks;

  factory AvailableDaysResult.fromJson(Map<String, dynamic> json) =>
      AvailableDaysResult(
        daysPerWeek: json['daysPerWeek'] as int? ?? 0,
        durationHours: json['durationHours'] as int? ?? 3,
        weeks: ((json['weeks'] as List<dynamic>?) ?? [])
            .map((w) => AvailableWeek.fromJson(w as Map<String, dynamic>))
            .toList(),
      );
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

  Future<AppSubscription> getSubscription(String id) async {
    try {
      final response = await dio.get('/api/subscriptions/$id');
      return AppSubscription.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load subscription');
    }
  }

  Future<AvailableDaysResult> getAvailableDays(String id) async {
    try {
      final response = await dio.get('/api/subscriptions/$id/available-days');
      return AvailableDaysResult.fromJson(
          response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load available days');
    }
  }

  /// Submits the customer's chosen session dates (DAYS_PROPOSED → CONFIRMED).
  Future<void> submitSessions(
    String id,
    List<DateTime> dates,
    int durationHours,
  ) async {
    try {
      await dio.post(
        '/api/subscriptions/$id/sessions',
        data: {
          'sessions': dates
              .map((d) => {
                    'scheduledDate': d.toUtc().toIso8601String(),
                    'durationHours': durationHours,
                  })
              .toList(),
        },
      );
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to submit selected days');
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
    double? latitude,
    double? longitude,
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
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
        },
      );
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to request subscription');
    }
  }
}
