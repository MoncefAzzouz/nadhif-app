import 'package:flutter_bloc/flutter_bloc.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(AuthInitial());

  void clearError() {
    emit(AuthInitial());
  }

  Future<bool> sendVerificationCode(String phoneNumber, String countryCode) async {
    emit(AuthLoading());
    await Future.delayed(const Duration(seconds: 1));
    emit(AuthCodeSent(phoneNumber));
    return true;
  }

  Future<bool> verifyOtp(String phoneNumber, String otp) async {
    emit(AuthLoading());
    await Future.delayed(const Duration(seconds: 1));
    emit(AuthAuthenticated(phoneNumber));
    return true;
  }

  Future<bool> registerUser({
    required String firstName,
    required String lastName,
    required String phoneNumber,
  }) async {
    emit(AuthLoading());
    await Future.delayed(const Duration(seconds: 1));
    emit(AuthAuthenticated(phoneNumber));
    return true;
  }
}
