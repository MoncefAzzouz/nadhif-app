class AppService {
  const AppService({
    required this.id,
    required this.name,
    required this.description,
    required this.picture,
    required this.extraWorkerPrice,
    required this.materialPrice,
    required this.materialsMandatory,
    required this.localProductPrice,
    required this.importedProductPrice,
    required this.productsMandatory,
    required this.houseConfigs,
  });

  final String id;
  final String name;
  final String description;
  final String picture;
  final double extraWorkerPrice;
  final double materialPrice;
  final bool materialsMandatory;
  final double localProductPrice;
  final double importedProductPrice;
  final bool productsMandatory;
  final List<AppHouseConfig> houseConfigs;

  AppHouseConfig? get defaultHouseConfig =>
      houseConfigs.isEmpty ? null : houseConfigs.first;

  factory AppService.fromJson(Map<String, dynamic> json) {
    return AppService(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      picture: json['picture'] as String? ?? '',
      extraWorkerPrice: _toDouble(json['extraWorkerPrice']),
      materialPrice: _toDouble(json['materialPrice']),
      materialsMandatory: json['materialsMandatory'] as bool? ?? false,
      localProductPrice: _toDouble(json['localProductPrice']),
      importedProductPrice: _toDouble(json['importedProductPrice']),
      productsMandatory: json['productsMandatory'] as bool? ?? false,
      houseConfigs: ((json['houseConfigs'] as List<dynamic>?) ?? [])
          .map((item) => AppHouseConfig.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class AppHouseConfig {
  const AppHouseConfig({
    required this.id,
    required this.type,
    required this.workers,
    required this.basePrice,
    required this.durationHours,
  });

  final String id;
  final String type;
  final int workers;
  final double basePrice;
  final int durationHours;

  factory AppHouseConfig.fromJson(Map<String, dynamic> json) {
    return AppHouseConfig(
      id: json['id'] as String,
      type: json['type'] as String? ?? '',
      workers: json['workers'] as int? ?? 1,
      basePrice: _toDouble(json['basePrice']),
      durationHours: json['durationHours'] as int? ?? 1,
    );
  }
}

class AppCategory {
  const AppCategory({
    required this.id,
    required this.name,
    required this.description,
    required this.picture,
    required this.materialPrice,
    required this.materialsMandatory,
    required this.localProductPrice,
    required this.importedProductPrice,
    required this.productsMandatory,
    required this.categoryServices,
  });

  final String id;
  final String name;
  final String description;
  final String picture;
  final double materialPrice;
  final bool materialsMandatory;
  final double localProductPrice;
  final double importedProductPrice;
  final bool productsMandatory;
  final List<AppCategoryService> categoryServices;

  AppCategoryService? get defaultCategoryService =>
      categoryServices.isEmpty ? null : categoryServices.first;

  factory AppCategory.fromJson(Map<String, dynamic> json) {
    return AppCategory(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
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
    );
  }
}

class AppCategoryService {
  const AppCategoryService({
    required this.id,
    required this.name,
    required this.workers,
    required this.basePrice,
    required this.durationHours,
  });

  final String id;
  final String name;
  final int workers;
  final double basePrice;
  final int durationHours;

  factory AppCategoryService.fromJson(Map<String, dynamic> json) {
    return AppCategoryService(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      workers: json['workers'] as int? ?? 1,
      basePrice: _toDouble(json['basePrice']),
      durationHours: json['durationHours'] as int? ?? 1,
    );
  }
}

double _toDouble(dynamic value) {
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0;
  return 0;
}
