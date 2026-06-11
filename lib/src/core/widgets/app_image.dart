import 'dart:convert';
import 'dart:typed_data';

import 'package:cleanapp/src/core/config/app_config.dart';
import 'package:flutter/material.dart';

class AppImage extends StatelessWidget {
  const AppImage({
    super.key,
    required this.source,
    required this.fallback,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
  });

  final String? source;
  final Widget fallback;
  final double? width;
  final double? height;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    final value = source?.trim();
    if (value == null || value.isEmpty) {
      return fallback;
    }

    // Backend-hosted uploads are stored as relative paths (/uploads/<file>);
    // resolve them against the API host.
    if (value.startsWith('/uploads/')) {
      return Image.network(
        '${AppConfig.apiBaseUrl}$value',
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, __, ___) => fallback,
      );
    }

    // Any other server-relative path (e.g. legacy /assets/...) can't be
    // resolved by the app; show the fallback.
    if (value.startsWith('/')) {
      return fallback;
    }

    if (value.startsWith('data:image')) {
      final bytes = _decodeDataUri(value);
      if (bytes == null) return fallback;
      return Image.memory(
        bytes,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, __, ___) => fallback,
      );
    }

    if (value.startsWith('http')) {
      return Image.network(
        value,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, __, ___) => fallback,
      );
    }

    return Image.asset(
      value,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (_, __, ___) => fallback,
    );
  }

  Uint8List? _decodeDataUri(String value) {
    final commaIndex = value.indexOf(',');
    if (commaIndex == -1 || commaIndex == value.length - 1) return null;

    try {
      return base64Decode(value.substring(commaIndex + 1));
    } catch (_) {
      return null;
    }
  }
}
