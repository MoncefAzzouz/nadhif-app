class AppConfig {
  AppConfig._();

  /// Base URL of the backend API.
  ///
  /// Defaults to the production VPS over HTTPS (via nginx), so it works on both
  /// Android and iOS with no flags and no cleartext exceptions. The client
  /// appends `/api/...` itself.
  ///
  /// To target a local backend during development, override:
  ///   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5001   (Android emulator)
  ///   flutter run --dart-define=API_BASE_URL=http://localhost:5001   (iOS simulator)
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://vps79m16u.oct-xpd1.xyz',
  );
}
