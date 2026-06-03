import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/auth/data/auth_api_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(AuthInitial());

  void clearError() {
    emit(AuthInitial());
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    emit(AuthLoading());
    try {
      await locator<AuthApiService>().login(email: email, password: password);
      emit(AuthAuthenticated(email));
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
      emit(AuthAuthenticated(email));
      return true;
    } catch (e) {
      emit(AuthError(e.toString().replaceFirst('Exception: ', '')));
      return false;
    }
  }

}
