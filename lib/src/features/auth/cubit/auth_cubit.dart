import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/core/services/notification_service.dart';
import 'package:cleanapp/src/features/auth/data/auth_api_service.dart';
import 'package:cleanapp/src/core/services/auth_token_store.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(AuthInitial());

  void clearError() {
    emit(AuthInitial());
  }

  /// Emits the authenticated state and registers this device's push token with
  /// the backend so it can be targeted for the now-logged-in user.
  void _authenticated(String identifier) {
    emit(AuthAuthenticated(identifier));
    // Fire-and-forget: token sync must never block or fail the login flow.
    notificationService.syncToken();
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    emit(AuthLoading());
    try {
      await locator<AuthApiService>().login(email: email, password: password);
      _authenticated(email);
      return true;
    } catch (e) {
      emit(AuthError(e.toString().replaceFirst('Exception: ', '')));
      return false;
    }
  }

  Future<bool> registerWithEmail({
    required String email,
    required String phone,
    required String password,
    required String fullName,
  }) async {
    emit(AuthLoading());
    try {
      await locator<AuthApiService>().register(
        email: email,
        phone: phone,
        password: password,
        fullName: fullName,
      );
      _authenticated(email);
      return true;
    } catch (e) {
      emit(AuthError(e.toString().replaceFirst('Exception: ', '')));
      return false;
    }
  }

  Future<bool> checkAuthStatus() async {
    try {
      final token = await locator<AuthTokenStore>().readToken();
      if (token == null || token.isEmpty) {
        return false;
      }
      final user = await locator<AuthApiService>().me();
      _authenticated(user.phone);
      return true;
    } catch (_) {
      await locator<AuthTokenStore>().clear();
      emit(AuthInitial());
      return false;
    }
  }

  Future<bool> sendVerificationCode(String phone, String prefix) async {
    emit(AuthLoading());
    try {
      await locator<AuthApiService>().sendVerificationCode(phone, prefix);
      emit(AuthInitial());
      return true;
    } catch (e) {
      emit(AuthError(e.toString().replaceFirst('Exception: ', '')));
      return false;
    }
  }

  Future<bool> verifyOtp(String phone, String code) async {
    emit(AuthLoading());
    try {
      final success = await locator<AuthApiService>().verifyOtp(phone, code);
      if (success) {
        _authenticated(phone);
      } else {
        emit(AuthInitial());
      }
      return success;
    } catch (e) {
      emit(AuthError(e.toString().replaceFirst('Exception: ', '')));
      return false;
    }
  }

  Future<bool> registerUser({
    required String firstName,
    required String lastName,
    required String phoneNumber,
  }) async {
    emit(AuthLoading());
    try {
      await locator<AuthApiService>().registerUser(
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
      );
      _authenticated(phoneNumber);
      return true;
    } catch (e) {
      emit(AuthError(e.toString().replaceFirst('Exception: ', '')));
      return false;
    }
  }

}
