class UserProfile {
  final String firstName;
  final String email;
  final String location;

  const UserProfile({
    required this.firstName,
    required this.email,
    required this.location,
  });
}

abstract class ProfileRepository {
  UserProfile getCurrentUser();
}

class InMemoryProfileRepository implements ProfileRepository {
  const InMemoryProfileRepository();

  @override
  UserProfile getCurrentUser() => const UserProfile(
        firstName: 'Moncef az',
        email: 'Moncefaz@nadhif.com',
        location: 'Setif center ville',
      );
}
