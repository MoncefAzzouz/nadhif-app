import 'dart:async';
import 'dart:io' show Platform;

import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/notifications/data/notifications_api_service.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Top-level entry point required by FCM to process messages while the app is
/// in the background or terminated. Must be a top-level (or static) function.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // The system tray already displays the notification payload when the app is
  // backgrounded; nothing extra is needed here for now. Kept as a hook for
  // future data-only background processing.
}

/// Centralizes Firebase Cloud Messaging setup: permissions, the local
/// notification channel used to display messages while the app is in the
/// foreground, token retrieval, and forwarding the token to the backend.
class NotificationService {
  NotificationService(this._api);

  final NotificationsApiService _api;
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'high_importance_channel',
    'Notifications',
    description: 'Order updates and important alerts.',
    importance: Importance.high,
  );

  bool _initialized = false;
  String? _cachedToken;

  // Broadcasts whenever an order-related push arrives, so screens like the
  // Orders page can refresh live instead of waiting for a manual pull-to-refresh.
  final StreamController<void> _orderUpdateController =
      StreamController<void>.broadcast();
  Stream<void> get onOrderUpdate => _orderUpdateController.stream;

  /// Called once at app start (after Firebase.initializeApp). Sets up the
  /// local-notification channel, requests permission, and starts listening for
  /// foreground messages + token refreshes.
  Future<void> init() async {
    if (_initialized) return;
    _initialized = true;

    await _messaging.requestPermission();

    const androidInit =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings();
    await _localNotifications.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);

    FirebaseMessaging.onMessage.listen((message) {
      _showLocalNotification(message);
      _maybeNotifyOrderUpdate(message);
    });
    // App opened by tapping a notification (from background).
    FirebaseMessaging.onMessageOpenedApp.listen(_maybeNotifyOrderUpdate);
    _messaging.onTokenRefresh.listen((token) {
      _cachedToken = token;
      _sendToken(token);
    });
  }

  /// Emits on [onOrderUpdate] when the push concerns an order, so listening
  /// screens reload their data.
  void _maybeNotifyOrderUpdate(RemoteMessage message) {
    if (message.data['type'] == 'order_status' ||
        message.data['orderId'] != null) {
      _orderUpdateController.add(null);
    }
  }

  /// Associates the current device token with the logged-in user. Call after a
  /// successful login and on app start when a session already exists.
  Future<void> syncToken() async {
    try {
      final token = _cachedToken ?? await _messaging.getToken();
      if (token == null || token.isEmpty) return;
      _cachedToken = token;
      // Printed so it can be copied for Firebase Console / curl push tests.
      debugPrint('FCM_TOKEN: $token');
      await _sendToken(token);
    } catch (e) {
      debugPrint('NotificationService.syncToken failed: $e');
    }
  }

  /// Removes the current device token from the backend (e.g. on logout).
  Future<void> clearToken() async {
    final token = _cachedToken;
    if (token == null || token.isEmpty) return;
    try {
      await _api.unregisterToken(token);
    } catch (e) {
      debugPrint('NotificationService.clearToken failed: $e');
    }
  }

  Future<void> _sendToken(String token) async {
    try {
      await _api.registerToken(token: token, platform: _platform);
    } catch (e) {
      debugPrint('NotificationService._sendToken failed: $e');
    }
  }

  String get _platform => Platform.isIOS ? 'ios' : 'android';

  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;
    await _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: const DarwinNotificationDetails(),
      ),
    );
  }
}

/// Convenience accessor mirroring the other singletons registered in DI.
NotificationService get notificationService => locator<NotificationService>();
