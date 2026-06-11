import 'package:cleanapp/src/core/services/base_api_service.dart';
import 'package:dio/dio.dart';

class AppSlide {
  const AppSlide({
    required this.id,
    required this.imageUrl,
    required this.title,
    required this.description,
    required this.actionRoute,
  });

  final String id;
  final String imageUrl;
  final String title;
  final String description;
  final String actionRoute;

  factory AppSlide.fromJson(Map<String, dynamic> json) {
    return AppSlide(
      id: json['id'] as String,
      imageUrl: json['imageUrl'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      actionRoute: json['actionRoute'] as String? ?? '',
    );
  }
}

class SlidesApiService extends BaseApiService {
  /// Active carousel slides (ordered) for the home hero banner.
  Future<List<AppSlide>> getSlides() async {
    try {
      final response = await dio.get('/api/slides');
      return (response.data as List<dynamic>)
          .map((item) => AppSlide.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load slides');
    }
  }
}
