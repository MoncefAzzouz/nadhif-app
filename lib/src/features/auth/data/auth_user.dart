class AuthUser {
  const AuthUser({
    required this.id,
    required this.email,
    required this.phone,
    required this.fullName,
    required this.role,
  });

  final String id;
  final String email;
  final String phone;
  final String fullName;
  final String role;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      role: json['role'] as String? ?? 'CUSTOMER',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'phone': phone,
      'fullName': fullName,
      'role': role,
    };
  }
}
