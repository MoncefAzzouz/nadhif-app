import 'package:cached_network_image/cached_network_image.dart';
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
    if (value == null || value.isEmpty || value.startsWith('data:image')) {
      return fallback;
    }

    if (value.startsWith('/uploads/')) {
      return _cachedNetworkImage('${AppConfig.apiBaseUrl}$value');
    }

    if (value.startsWith('http')) {
      return _cachedNetworkImage(value);
    }

    if (value.startsWith('/')) {
      return fallback;
    }

    return Image.asset(
      value,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (_, __, ___) => fallback,
    );
  }

  Widget _cachedNetworkImage(String url) {
    return CachedNetworkImage(
      imageUrl: url,
      width: width,
      height: height,
      fit: fit,
      fadeInDuration: const Duration(milliseconds: 160),
      placeholder: (_, __) => fallback,
      errorWidget: (_, __, ___) => fallback,
    );
  }
}
