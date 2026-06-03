import 'package:cleanapp/src/core/services/auth_token_store.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/auth/data/auth_api_service.dart';
import 'package:cleanapp/src/features/auth/data/auth_user.dart';

class UserProfile {
  final String fullName;
  final String email;
  final String phone;
  final String location;

  const UserProfile({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.location,
  });

  factory UserProfile.fromAuthUser(AuthUser user) {
    return UserProfile(
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      location: 'Setif center ville',
    );
  }
}

abstract class ProfileRepository {
  Future<UserProfile> getCurrentUser();
}

class ApiProfileRepository implements ProfileRepository {
  const ApiProfileRepository();

  @override
  Future<UserProfile> getCurrentUser() async {
    final cached = await locator<AuthTokenStore>().readUser();
    if (cached != null) return UserProfile.fromAuthUser(cached);

    final user = await locator<AuthApiService>().me();
    return UserProfile.fromAuthUser(user);
  }
}
