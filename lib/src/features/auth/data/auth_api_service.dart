import 'package:cleanapp/src/core/services/auth_token_store.dart';
import 'package:cleanapp/src/core/services/base_api_service.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/auth/data/auth_user.dart';
import 'package:dio/dio.dart';

class AuthApiService extends BaseApiService {
  Future<void> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await dio.post(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );
      await _saveAuth(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Login failed');
    }
  }

  Future<void> register({
    required String email,
    required String phone,
    required String password,
    required String fullName,
  }) async {
    try {
      await dio.post(
        '/api/auth/register',
        data: {
          'email': email,
          'phone': phone,
          'password': password,
          'fullName': fullName,
        },
      );
      await login(email: email, password: password);
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Registration failed');
    }
  }

  Future<AuthUser> me() async {
    try {
      final response = await dio.get('/api/auth/me');
      final user = AuthUser.fromJson(response.data as Map<String, dynamic>);
      await locator<AuthTokenStore>().saveUser(user);
      return user;
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to load profile');
    }
  }

  /// Updates the logged-in user's profile and refreshes the cached user.
  Future<AuthUser> updateMe({
    String? fullName,
    String? email,
    String? phone,
  }) async {
    try {
      final response = await dio.put(
        '/api/auth/me',
        data: {
          if (fullName != null) 'fullName': fullName,
          if (email != null) 'email': email,
          if (phone != null) 'phone': phone,
        },
      );
      final user = AuthUser.fromJson(response.data as Map<String, dynamic>);
      await locator<AuthTokenStore>().saveUser(user);
      return user;
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to update profile');
    }
  }

  Future<bool> sendVerificationCode(String phone, String prefix) async {
    try {
      await dio.post('/api/auth/send-otp', data: {'phone': phone, 'prefix': prefix});
      return true;
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to send verification code');
    }
  }

  Future<bool> verifyOtp(String phone, String code) async {
    try {
      final response = await dio.post('/api/auth/verify-otp', data: {'phone': phone, 'code': code});
      if (response.data['token'] != null) {
        await _saveAuth(response.data as Map<String, dynamic>);
      }
      return true;
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Invalid verification code');
    }
  }

  Future<bool> registerUser({
    required String firstName,
    required String lastName,
    required String phoneNumber,
  }) async {
    try {
      final response = await dio.post('/api/auth/register-phone', data: {
        'fullName': '$firstName $lastName',
        'phone': phoneNumber,
      });
      await _saveAuth(response.data as Map<String, dynamic>);
      return true;
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to register profile');
    }
  }


  /// Permanently deletes the logged-in user's account.
  Future<void> deleteAccount() async {
    try {
      await dio.delete('/api/auth/delete-account');
    } on DioException catch (e) {
      final error = handleError(e);
      throw Exception(error['message'] ?? 'Failed to delete account');
    }
  }

  Future<void> _saveAuth(Map<String, dynamic> data) async {
    final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
    await locator<AuthTokenStore>().saveAuth(
      token: data['token'] as String,
      user: user,
    );
  }
}
