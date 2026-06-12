import 'package:cleanapp/src/core/services/base_api_service.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:cleanapp/src/features/slides/data/slides_api_service.dart';
import 'package:dio/dio.dart';

class HomeContent {
  const HomeContent({
    required this.slides,
    required this.categories,
    required this.services,
  });

  final List<AppSlide> slides;
  final List<AppCategory> categories;
  final List<AppService> services;

  factory HomeContent.fromJson(Map<String, dynamic> json) {
    return HomeContent(
      slides: ((json['slides'] as List<dynamic>?) ?? [])
          .map((item) => AppSlide.fromJson(item as Map<String, dynamic>))
          .where((slide) => _isSupportedImageSource(slide.imageUrl))
          .toList(),
      categories: ((json['categories'] as List<dynamic>?) ?? [])
          .map((item) => AppCategory.fromJson(item as Map<String, dynamic>))
          .toList(),
      services: ((json['services'] as List<dynamic>?) ?? [])
          .map((item) => AppService.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class HomeContentRepository extends BaseApiService {
  static const _cacheTtl = Duration(minutes: 5);

  HomeContent? _cache;
  DateTime? _cacheAt;
  Future<HomeContent>? _inFlight;

  bool get _hasFreshCache {
    final cacheAt = _cacheAt;
    if (_cache == null || cacheAt == null) return false;
    return DateTime.now().difference(cacheAt) < _cacheTtl;
  }

  Future<HomeContent> getHomeContent({bool forceRefresh = false}) {
    if (!forceRefresh && _hasFreshCache) {
      return Future.value(_cache);
    }

    final activeRequest = _inFlight;
    if (!forceRefresh && activeRequest != null) return activeRequest;

    final request = _fetchHomeContent();
    _inFlight = request;
    return request.whenComplete(() {
      if (identical(_inFlight, request)) _inFlight = null;
    });
  }

  Future<List<AppSlide>> getSlides({bool forceRefresh = false}) async {
    return (await getHomeContent(forceRefresh: forceRefresh)).slides;
  }

  Future<List<AppCategory>> getCategories({bool forceRefresh = false}) async {
    return (await getHomeContent(forceRefresh: forceRefresh)).categories;
  }

  Future<List<AppService>> getServices({bool forceRefresh = false}) async {
    return (await getHomeContent(forceRefresh: forceRefresh)).services;
  }

  Future<HomeContent> _fetchHomeContent() async {
    try {
      final response = await dio.get('/api/home');
      final content =
          HomeContent.fromJson(response.data as Map<String, dynamic>);
      _save(content);
      return content;
    } on DioException {
      final content = await _fetchLegacyContent();
      _save(content);
      return content;
    }
  }

  Future<HomeContent> _fetchLegacyContent() async {
    try {
      final results = await Future.wait([
        dio.get('/api/slides'),
        dio.get('/api/categories'),
        dio.get('/api/services'),
      ]);

      return HomeContent(
        slides: (results[0].data as List<dynamic>)
            .map((item) => AppSlide.fromJson(item as Map<String, dynamic>))
            .where((slide) => _isSupportedImageSource(slide.imageUrl))
            .toList(),
        categories: (results[1].data as List<dynamic>)
            .map((item) => AppCategory.fromJson(item as Map<String, dynamic>))
            .toList(),
        services: (results[2].data as List<dynamic>)
            .map((item) => AppService.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load home content');
    }
  }

  void _save(HomeContent content) {
    _cache = content;
    _cacheAt = DateTime.now();
  }
}

bool _isSupportedImageSource(String value) {
  final source = value.trim();
  return source.isNotEmpty && !source.startsWith('data:image');
}
