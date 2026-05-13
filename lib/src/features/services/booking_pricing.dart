enum BookingMaterial { algerian, imported }

class BookingPricing {
  BookingPricing._();

  static const double basePricePerHour = 22.0;
  static const double materialPriceAlgerian = 7.0;
  static const double materialPriceImported = 15.0;

  static double materialRate(BookingMaterial type) =>
      type == BookingMaterial.algerian
          ? materialPriceAlgerian
          : materialPriceImported;

  static double total({
    required int hours,
    required int cleaners,
    required bool needMaterials,
    required BookingMaterial materialType,
  }) {
    double price = hours * cleaners * basePricePerHour;
    if (needMaterials) {
      price += hours * materialRate(materialType);
    }
    return price;
  }
}
