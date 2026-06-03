import 'dart:io';
import 'package:dio/dio.dart';
import '../utils/dependency_injection.dart';

/// Base API service class that provides common functionality for all API services
abstract class BaseApiService {
  late final Dio dio;

  BaseApiService() {
    dio = locator<Dio>();
  }

  /// Handle Dio errors and return standardized error response
  Map<String, dynamic> handleError(DioException e) {
    String message;
    int status = e.response?.statusCode ?? -2;

    if (e.error is SocketException ||
        e.type == DioExceptionType.connectionError ||
        e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      message = 'Connection error. Please check your internet connection.';
      status = -3;
    } else if (status == 401) {
      message = 'Session expired. Please log in again.';
    } else {
      message = e.response?.data?['message'] ?? 'An error occurred';
    }

    return {
      'status': status,
      'success': false,
      'message': message,
    };
  }

  /// Process the response from the server
  Map<String, dynamic> processResponse(Response response) {
    if (response.statusCode != null &&
        response.statusCode! >= 200 &&
        response.statusCode! < 300) {
      final data = response.data;
      if (data is Map<String, dynamic>) {
        return data;
      }
      return {
        'success': true,
        'data': data,
      };
    }
    return {
      'success': false,
      'status': response.statusCode,
      'message': 'Request failed with status ${response.statusCode}',
    };
  }

  /// Make a GET request
  Future<Map<String, dynamic>> getRequest(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.get(
        endpoint,
        queryParameters: queryParameters,
        options: options,
      );
      return processResponse(response);
    } on DioException catch (e) {
      return handleError(e);
    }
  }

  /// Make a POST request
  Future<Map<String, dynamic>> postRequest(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return processResponse(response);
    } on DioException catch (e) {
      return handleError(e);
    }
  }
}
