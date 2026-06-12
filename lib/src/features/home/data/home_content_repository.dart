import 'dart:convert';

import 'package:cleanapp/src/core/services/base_api_service.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:cleanapp/src/features/slides/data/slides_api_service.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
  static const _diskCacheKey = 'home_content_cache_v1';

  HomeContent? _cache;
  DateTime? _cacheAt;
  Future<HomeContent>? _inFlight;

  /// Last known content (memory, or disk after [hydrate]); may be stale.
  HomeContent? get cached => _cache;

  /// Loads the last persisted home content so the UI can render real data on
  /// the first frame. Marked stale so the next [getHomeContent] still hits
  /// the network.
  Future<void> hydrate() async {
    if (_cache != null) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_diskCacheKey);
      if (raw == null) return;
      _cache = HomeContent.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      _cacheAt = DateTime.fromMillisecondsSinceEpoch(0);
    } catch (_) {
      // Corrupt cache: drop it and fall back to the network.
      _cache = null;
      _cacheAt = null;
    }
  }

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
    Map<String, dynamic> raw;
    try {
      final response = await dio.get('/api/home');
      raw = response.data as Map<String, dynamic>;
    } on DioException {
      raw = await _fetchLegacyContent();
    }
    final content = HomeContent.fromJson(raw);
    _save(content, raw);
    return content;
  }

  Future<Map<String, dynamic>> _fetchLegacyContent() async {
    try {
      final results = await Future.wait([
        dio.get('/api/slides'),
        dio.get('/api/categories'),
        dio.get('/api/services'),
      ]);

      return {
        'slides': results[0].data,
        'categories': results[1].data,
        'services': results[2].data,
      };
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load home content');
    }
  }

  void _save(HomeContent content, Map<String, dynamic> raw) {
    _cache = content;
    _cacheAt = DateTime.now();
    // Persist for instant rendering on the next cold start.
    SharedPreferences.getInstance()
        .then((prefs) => prefs.setString(_diskCacheKey, jsonEncode(raw)))
        .catchError((_) => true);
  }
}

bool _isSupportedImageSource(String value) {
  final source = value.trim();
  return source.isNotEmpty && !source.startsWith('data:image');
}
