import 'package:cleanapp/src/features/services/booking_pricing.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('BookingPricing.total', () {
    test('base price is hours * cleaners * rate when no materials', () {
      final total = BookingPricing.total(
        hours: 4,
        cleaners: 2,
        needMaterials: false,
        materialType: BookingMaterial.algerian,
      );
      expect(total, 4 * 2 * BookingPricing.basePricePerHour);
    });

    test('adds Algerian material cost per hour when needMaterials is true', () {
      const base = 4 * 1 * BookingPricing.basePricePerHour;
      final total = BookingPricing.total(
        hours: 4,
        cleaners: 1,
        needMaterials: true,
        materialType: BookingMaterial.algerian,
      );
      expect(total, base + 4 * BookingPricing.materialPriceAlgerian);
    });

    test('adds Imported material cost per hour when needMaterials is true', () {
      const base = 5 * 3 * BookingPricing.basePricePerHour;
      final total = BookingPricing.total(
        hours: 5,
        cleaners: 3,
        needMaterials: true,
        materialType: BookingMaterial.imported,
      );
      expect(total, base + 5 * BookingPricing.materialPriceImported);
    });
  });
}
