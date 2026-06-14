import 'dart:async';
import 'dart:convert';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppNotification {
  final String id;
  final String title;
  final String body;
  final DateTime receivedAt;
  final bool read;
  final Map<String, dynamic> data;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.receivedAt,
    required this.read,
    required this.data,
  });

  AppNotification copyWith({bool? read}) {
    return AppNotification(
      id: id,
      title: title,
      body: body,
      receivedAt: receivedAt,
      read: read ?? this.read,
      data: data,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'receivedAt': receivedAt.toIso8601String(),
        'read': read,
        'data': data,
      };

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Notification',
      body: json['body']?.toString() ?? '',
      receivedAt: DateTime.tryParse(json['receivedAt']?.toString() ?? '') ??
          DateTime.now(),
      read: json['read'] == true,
      data: (json['data'] as Map?)?.cast<String, dynamic>() ?? const {},
    );
  }
}

class NotificationInboxRepository {
  static const _storageKey = 'nadif_notifications';
  static const _maxItems = 50;

  final _controller = StreamController<List<AppNotification>>.broadcast();
  List<AppNotification> _items = const [];

  Stream<List<AppNotification>> get stream => _controller.stream;
  List<AppNotification> get items => List.unmodifiable(_items);
  int get unreadCount => _items.where((item) => !item.read).length;

  Future<void> hydrate() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw == null || raw.isEmpty) {
      _emit(const []);
      return;
    }

    try {
      final decoded = jsonDecode(raw) as List<dynamic>;
      _emit(decoded
          .whereType<Map>()
          .map((item) => AppNotification.fromJson(item.cast()))
          .where((item) => item.id.isNotEmpty)
          .toList());
    } catch (_) {
      _emit(const []);
    }
  }

  Future<void> addRemoteMessage(RemoteMessage message) async {
    final notification = message.notification;
    final title = notification?.title ?? message.data['title']?.toString();
    final body = notification?.body ?? message.data['body']?.toString();
    if ((title == null || title.isEmpty) && (body == null || body.isEmpty)) {
      return;
    }

    final item = AppNotification(
      id: message.messageId ??
          '${DateTime.now().microsecondsSinceEpoch}-${title ?? ''}',
      title: title?.isNotEmpty == true ? title! : 'Notification',
      body: body ?? '',
      receivedAt: DateTime.now(),
      read: false,
      data: Map<String, dynamic>.from(message.data),
    );

    final next = [
      item,
      ..._items.where((existing) => existing.id != item.id),
    ].take(_maxItems).toList();
    await _save(next);
  }

  Future<void> markAllRead() async {
    await _save(_items.map((item) => item.copyWith(read: true)).toList());
  }

  Future<void> clear() async {
    await _save(const []);
  }

  Future<void> _save(List<AppNotification> items) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _storageKey,
      jsonEncode(items.map((item) => item.toJson()).toList()),
    );
    _emit(items);
  }

  void _emit(List<AppNotification> items) {
    _items = List.unmodifiable(items);
    _controller.add(_items);
  }
}
