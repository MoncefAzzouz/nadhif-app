import 'package:cleanapp/src/core/services/base_api_service.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:dio/dio.dart';

class AppFaq {
  const AppFaq({required this.question, required this.answer});

  final String question;
  final String answer;

  factory AppFaq.fromJson(Map<String, dynamic> json) => AppFaq(
        question: json['question'] as String? ?? '',
        answer: json['answer'] as String? ?? '',
      );
}

class AppAboutUs {
  const AppAboutUs({
    required this.vision,
    required this.hotline,
    required this.email,
    required this.website,
    required this.facebook,
    required this.instagram,
    required this.wilayaCenter,
  });

  final String vision;
  final String hotline;
  final String email;
  final String website;
  final String facebook;
  final String instagram;
  final String wilayaCenter;

  factory AppAboutUs.fromJson(Map<String, dynamic> json) => AppAboutUs(
        vision: json['vision'] as String? ?? '',
        hotline: json['hotline'] as String? ?? '',
        email: json['email'] as String? ?? '',
        website: json['website'] as String? ?? '',
        facebook: json['facebook'] as String? ?? '',
        instagram: json['instagram'] as String? ?? '',
        wilayaCenter: json['wilayaCenter'] as String? ?? '',
      );
}

/// CMS content managed from the admin "Pages" section.
class PagesApiService extends BaseApiService {
  Future<List<AppFaq>> getFaqs() async {
    try {
      final response = await dio.get('/api/pages/faqs');
      return (response.data as List<dynamic>)
          .map((item) => AppFaq.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load FAQs');
    }
  }

  Future<String> getPrivacyPolicy() async {
    try {
      final response = await dio.get('/api/pages/privacy');
      return (response.data as Map<String, dynamic>)['privacyPolicy']
              as String? ??
          '';
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load privacy policy');
    }
  }

  /// Admin-managed content for the Subscription Pack details page; null until
  /// the admin saves it (the app then uses its built-in fallback text).
  Future<AppServiceDetails?> getSubscriptionDetails() async {
    try {
      final response = await dio.get('/api/pages/subscription-details');
      return AppServiceDetails.fromJson(response.data);
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(
          error['message'] ?? 'Failed to load subscription details');
    }
  }

  Future<AppAboutUs?> getAbout() async {
    try {
      final response = await dio.get('/api/pages/about');
      final data = response.data;
      if (data is! Map<String, dynamic>) return null;
      return AppAboutUs.fromJson(data);
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load about info');
    }
  }
}
