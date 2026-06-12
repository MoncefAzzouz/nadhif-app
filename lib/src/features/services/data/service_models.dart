/// Picks the right translation for [locale] ('ar' / 'fr'), falling back to the
/// default (English) value when the translation is empty.
String _localized(String locale, String base, String ar, String fr) {
  if (locale == 'ar' && ar.trim().isNotEmpty) return ar;
  if (locale == 'fr' && fr.trim().isNotEmpty) return fr;
  return base;
}

/// Admin-managed content for the service details page (objective, includes
/// bullets, duration text, additional notes) with AR/FR translations.
class AppServiceDetails {
  const AppServiceDetails(this.raw);

  final Map<String, dynamic> raw;

  String _str(String key) => (raw[key] as String? ?? '').trim();

  List<String> _list(String key) {
    final v = raw[key];
    if (v is! List) return const [];
    return v
        .map((e) => e.toString().trim())
        .where((s) => s.isNotEmpty)
        .toList();
  }

  String _localizedStr(String base, String locale) {
    if (locale == 'ar' && _str('${base}Ar').isNotEmpty) return _str('${base}Ar');
    if (locale == 'fr' && _str('${base}Fr').isNotEmpty) return _str('${base}Fr');
    return _str(base);
  }

  List<String> _localizedList(String base, String locale) {
    if (locale == 'ar' && _list('${base}Ar').isNotEmpty) return _list('${base}Ar');
    if (locale == 'fr' && _list('${base}Fr').isNotEmpty) return _list('${base}Fr');
    return _list(base);
  }

  String objectiveFor(String locale) => _localizedStr('objective', locale);
  List<String> includesFor(String locale) => _localizedList('includes', locale);
  String durationTextFor(String locale) => _localizedStr('durationText', locale);
  String additionalFor(String locale) => _localizedStr('additional', locale);

  /// Whether the admin actually filled anything in.
  bool get hasContent =>
      _str('objective').isNotEmpty ||
      _list('includes').isNotEmpty ||
      _str('durationText').isNotEmpty ||
      _str('additional').isNotEmpty;

  static AppServiceDetails? fromJson(dynamic json) =>
      json is Map<String, dynamic> ? AppServiceDetails(json) : null;
}

class AppService {
  const AppService({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.nameFr,
    required this.description,
    required this.descriptionAr,
    required this.descriptionFr,
    required this.picture,
    required this.extraWorkerPrice,
    this.rapidExtraWorkerPrice = 0,
    required this.materialPrice,
    required this.materialsMandatory,
    required this.localProductPrice,
    required this.importedProductPrice,
    required this.productsMandatory,
    required this.houseConfigs,
    this.details,
  });

  final String id;
  final String name;
  final String nameAr;
  final String nameFr;
  final String description;
  final String descriptionAr;
  final String descriptionFr;
  final String picture;
  final double extraWorkerPrice;
  final double rapidExtraWorkerPrice;
  final double materialPrice;
  final bool materialsMandatory;
  final double localProductPrice;
  final double importedProductPrice;
  final bool productsMandatory;
  final List<AppHouseConfig> houseConfigs;
  final AppServiceDetails? details;

  String nameFor(String locale) => _localized(locale, name, nameAr, nameFr);
  String descriptionFor(String locale) =>
      _localized(locale, description, descriptionAr, descriptionFr);

  AppHouseConfig? get defaultHouseConfig =>
      houseConfigs.isEmpty ? null : houseConfigs.first;

  factory AppService.fromJson(Map<String, dynamic> json) {
    return AppService(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      nameAr: json['nameAr'] as String? ?? '',
      nameFr: json['nameFr'] as String? ?? '',
      description: json['description'] as String? ?? '',
      descriptionAr: json['descriptionAr'] as String? ?? '',
      descriptionFr: json['descriptionFr'] as String? ?? '',
      picture: json['picture'] as String? ?? '',
      extraWorkerPrice: _toDouble(json['extraWorkerPrice']),
      rapidExtraWorkerPrice: _toDouble(json['rapidExtraWorkerPrice']),
      materialPrice: _toDouble(json['materialPrice']),
      materialsMandatory: json['materialsMandatory'] as bool? ?? false,
      localProductPrice: _toDouble(json['localProductPrice']),
      importedProductPrice: _toDouble(json['importedProductPrice']),
      productsMandatory: json['productsMandatory'] as bool? ?? false,
      houseConfigs: ((json['houseConfigs'] as List<dynamic>?) ?? [])
          .map((item) => AppHouseConfig.fromJson(item as Map<String, dynamic>))
          .toList(),
      details: AppServiceDetails.fromJson(json['details']),
    );
  }
}

class AppHouseConfig {
  const AppHouseConfig({
    required this.id,
    required this.type,
    required this.typeAr,
    required this.typeFr,
    required this.workers,
    required this.basePrice,
    this.rapidBasePrice = 0,
    required this.durationHours,
  });

  final String id;
  final String type;
  final String typeAr;
  final String typeFr;
  final int workers;
  final double basePrice;
  final double rapidBasePrice;
  final int durationHours;

  String typeFor(String locale) => _localized(locale, type, typeAr, typeFr);

  factory AppHouseConfig.fromJson(Map<String, dynamic> json) {
    return AppHouseConfig(
      id: json['id'] as String,
      type: json['type'] as String? ?? '',
      typeAr: json['typeAr'] as String? ?? '',
      typeFr: json['typeFr'] as String? ?? '',
      workers: json['workers'] as int? ?? 1,
      basePrice: _toDouble(json['basePrice']),
      rapidBasePrice: _toDouble(json['rapidBasePrice']),
      durationHours: json['durationHours'] as int? ?? 1,
    );
  }
}

class AppCategory {
  const AppCategory({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.nameFr,
    required this.description,
    required this.descriptionAr,
    required this.descriptionFr,
    required this.picture,
    required this.materialPrice,
    required this.materialsMandatory,
    required this.localProductPrice,
    required this.importedProductPrice,
    required this.productsMandatory,
    required this.categoryServices,
    this.details,
  });

  final String id;
  final String name;
  final String nameAr;
  final String nameFr;
  final String description;
  final String descriptionAr;
  final String descriptionFr;
  final String picture;
  final double materialPrice;
  final bool materialsMandatory;
  final double localProductPrice;
  final double importedProductPrice;
  final bool productsMandatory;
  final List<AppCategoryService> categoryServices;
  final AppServiceDetails? details;

  String nameFor(String locale) => _localized(locale, name, nameAr, nameFr);
  String descriptionFor(String locale) =>
      _localized(locale, description, descriptionAr, descriptionFr);

  AppCategoryService? get defaultCategoryService =>
      categoryServices.isEmpty ? null : categoryServices.first;

  factory AppCategory.fromJson(Map<String, dynamic> json) {
    return AppCategory(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      nameAr: json['nameAr'] as String? ?? '',
      nameFr: json['nameFr'] as String? ?? '',
      description: json['description'] as String? ?? '',
      descriptionAr: json['descriptionAr'] as String? ?? '',
      descriptionFr: json['descriptionFr'] as String? ?? '',
      picture: json['picture'] as String? ?? '',
      materialPrice: _toDouble(json['materialPrice']),
      materialsMandatory: json['materialsMandatory'] as bool? ?? false,
      localProductPrice: _toDouble(json['localProductPrice']),
      importedProductPrice: _toDouble(json['importedProductPrice']),
      productsMandatory: json['productsMandatory'] as bool? ?? false,
      categoryServices: ((json['categoryServices'] as List<dynamic>?) ?? [])
          .map((item) =>
              AppCategoryService.fromJson(item as Map<String, dynamic>))
          .toList(),
      details: AppServiceDetails.fromJson(json['details']),
    );
  }
}

class AppCategoryService {
  const AppCategoryService({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.nameFr,
    required this.workers,
    required this.basePrice,
    this.rapidBasePrice = 0,
    required this.durationHours,
  });

  final String id;
  final String name;
  final String nameAr;
  final String nameFr;
  final int workers;
  final double basePrice;
  final double rapidBasePrice;
  final int durationHours;

  String nameFor(String locale) => _localized(locale, name, nameAr, nameFr);

  factory AppCategoryService.fromJson(Map<String, dynamic> json) {
    return AppCategoryService(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      nameAr: json['nameAr'] as String? ?? '',
      nameFr: json['nameFr'] as String? ?? '',
      workers: json['workers'] as int? ?? 1,
      basePrice: _toDouble(json['basePrice']),
      rapidBasePrice: _toDouble(json['rapidBasePrice']),
      durationHours: json['durationHours'] as int? ?? 1,
    );
  }
}

double _toDouble(dynamic value) {
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0;
  return 0;
}
