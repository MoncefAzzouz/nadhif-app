import 'dart:convert';

import 'package:cleanapp/src/features/auth/data/auth_user.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthTokenStore {
  AuthTokenStore(this._storage);

  static const _tokenKey = 'nadif_token';
  static const _userIdKey = 'nadif_user_id';
  static const _userKey = 'nadif_user';

  final FlutterSecureStorage _storage;
  String? _tokenCache;
  AuthUser? _userCache;

  Future<String?> readToken() async {
    if (_tokenCache != null) return _tokenCache;
    _tokenCache = await _storage.read(key: _tokenKey);
    return _tokenCache;
  }

  Future<String?> readUserId() => _storage.read(key: _userIdKey);

  Future<AuthUser?> readUser() async {
    if (_userCache != null) return _userCache;
    final raw = await _storage.read(key: _userKey);
    if (raw == null) return null;
    _userCache = AuthUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    return _userCache;
  }

  Future<void> saveAuth({
    required String token,
    required AuthUser user,
  }) async {
    _tokenCache = token;
    _userCache = user;
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userIdKey, value: user.id);
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
  }

  Future<void> saveUser(AuthUser user) async {
    _userCache = user;
    await _storage.write(key: _userIdKey, value: user.id);
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
  }

  Future<void> clear() async {
    _tokenCache = null;
    _userCache = null;
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userIdKey);
    await _storage.delete(key: _userKey);
  }
}
