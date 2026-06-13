import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/services/booking_pricing.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:cleanapp/src/features/services/data/services_api_service.dart';
import 'package:cleanapp/src/features/orders/data/orders_api_service.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class BookingState extends Equatable {
  final DateTime selectedDate;
  final String? selectedHouseConfigId;
  final String? selectedCategoryServiceId;
  final String? selectedHouseType;
  final int selectedHours;
  final int selectedCleaners;
  final double selectedBasePrice;
  final int defaultCleaners;
  final String selectedTimeSlot;
  final bool needMaterials;
  final BookingMaterial materialType;
  final bool needEquipment;
  final bool showBreakdown;
  final List<String> lockedDays;
  final bool isRapid;
  final double selectedRapidBasePrice;

  // Real pricing fields from the backend service/category
  final double extraWorkerPrice;
  final double rapidExtraWorkerPrice;
  final double materialPrice;
  final double localProductPrice;
  final double importedProductPrice;

  // Dynamic slot availability & surface fields
  final double? sizeM2;
  final List<String> availableSlots;
  final bool isCheckingAvailability;

  final AppService? service;
  final AppCategory? category;

  const BookingState({
    required this.selectedDate,
    required this.selectedHouseConfigId,
    this.selectedCategoryServiceId,
    required this.selectedHouseType,
    required this.selectedHours,
    required this.selectedCleaners,
    required this.selectedBasePrice,
    required this.defaultCleaners,
    required this.selectedTimeSlot,
    required this.needMaterials,
    required this.materialType,
    required this.needEquipment,
    required this.showBreakdown,
    this.lockedDays = const [],
    this.isRapid = false,
    this.selectedRapidBasePrice = 0,
    this.extraWorkerPrice = 0,
    this.rapidExtraWorkerPrice = 0,
    this.materialPrice = 0,
    this.localProductPrice = 0,
    this.importedProductPrice = 0,
    this.sizeM2,
    this.availableSlots = const [],
    this.isCheckingAvailability = false,
    this.service,
    this.category,
  });

  factory BookingState.initial({
    AppHouseConfig? houseConfig,
    AppCategoryService? categoryService,
    bool needMaterials = false,
    AppService? service,
    AppCategory? category,
    bool isRapid = false,
  }) =>
      BookingState(
        selectedDate: DateTime.now().add(Duration(days: isRapid ? 1 : 3)), // Default rule based on speed
        selectedHouseConfigId: houseConfig?.id,
        selectedCategoryServiceId: categoryService?.id,
        selectedHouseType: houseConfig?.type ?? categoryService?.name,
        selectedHours:
            houseConfig?.durationHours ?? categoryService?.durationHours ?? 4,
        selectedCleaners: houseConfig?.workers ?? categoryService?.workers ?? 1,
        selectedBasePrice:
            houseConfig?.basePrice ?? categoryService?.basePrice ?? 0,
        defaultCleaners: houseConfig?.workers ?? categoryService?.workers ?? 1,
        selectedTimeSlot: '08:00 AM',
        needMaterials: needMaterials,
        materialType: BookingMaterial.algerian,
        needEquipment: false,
        showBreakdown: false,
        isRapid: isRapid,
        selectedRapidBasePrice:
            houseConfig?.rapidBasePrice ?? categoryService?.rapidBasePrice ?? 0,
        extraWorkerPrice: service?.extraWorkerPrice ?? 0,
        rapidExtraWorkerPrice: service?.rapidExtraWorkerPrice ?? 0,
        materialPrice: service?.materialPrice ?? category?.materialPrice ?? 0,
        localProductPrice:
            service?.localProductPrice ?? category?.localProductPrice ?? 0,
        importedProductPrice: service?.importedProductPrice ??
            category?.importedProductPrice ??
            0,
        sizeM2: null,
        availableSlots: const ['08:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '06:00 PM'],
        isCheckingAvailability: false,
        service: service,
        category: category,
      );

  bool get supportsRapid => selectedRapidBasePrice > 0;

  double get effectiveBasePrice =>
      isRapid && selectedRapidBasePrice > 0
          ? selectedRapidBasePrice
          : selectedBasePrice;

  double get effectiveExtraWorkerPrice =>
      isRapid && rapidExtraWorkerPrice > 0
          ? rapidExtraWorkerPrice
          : extraWorkerPrice;

  double get totalPrice {
    if (selectedBasePrice <= 0) {
      return BookingPricing.total(
        basePrice: selectedBasePrice,
        hours: selectedHours,
        cleaners: selectedCleaners,
        needMaterials: needMaterials,
        materialType: materialType,
      );
    }
    double price =
        effectiveBasePrice + extraWorkers * effectiveExtraWorkerPrice;
    if (needMaterials) {
      price += materialPrice;
      price += materialType == BookingMaterial.imported
          ? importedProductPrice
          : localProductPrice;
    }
    return price;
  }

  DateTime get scheduledDateTime {
    final match = RegExp(r'(\d{1,2}):(\d{2})\s*(AM|PM)', caseSensitive: false)
        .firstMatch(selectedTimeSlot);
    if (match == null) {
      return DateTime(
          selectedDate.year, selectedDate.month, selectedDate.day, 8);
    }
    var hour = int.parse(match.group(1)!);
    final minute = int.parse(match.group(2)!);
    final isPm = match.group(3)!.toUpperCase() == 'PM';
    if (isPm && hour != 12) hour += 12;
    if (!isPm && hour == 12) hour = 0;
    return DateTime(
        selectedDate.year, selectedDate.month, selectedDate.day, hour, minute);
  }

  static String _dayKey(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  bool isDateLocked(DateTime date) => lockedDays.contains(_dayKey(date));

  int get extraWorkers =>
      selectedCleaners > defaultCleaners ? selectedCleaners - defaultCleaners : 0;

  BookingState copyWith({
    DateTime? selectedDate,
    String? selectedHouseConfigId,
    String? selectedCategoryServiceId,
    String? selectedHouseType,
    int? selectedHours,
    int? selectedCleaners,
    double? selectedBasePrice,
    int? defaultCleaners,
    String? selectedTimeSlot,
    bool? needMaterials,
    BookingMaterial? materialType,
    bool? needEquipment,
    bool? showBreakdown,
    List<String>? lockedDays,
    bool? isRapid,
    double? selectedRapidBasePrice,
    double? sizeM2,
    List<String>? availableSlots,
    bool? isCheckingAvailability,
  }) {
    return BookingState(
      selectedDate: selectedDate ?? this.selectedDate,
      selectedHouseConfigId:
          selectedHouseConfigId ?? this.selectedHouseConfigId,
      selectedCategoryServiceId:
          selectedCategoryServiceId ?? this.selectedCategoryServiceId,
      selectedHouseType: selectedHouseType ?? this.selectedHouseType,
      selectedHours: selectedHours ?? this.selectedHours,
      selectedCleaners: selectedCleaners ?? this.selectedCleaners,
      selectedBasePrice: selectedBasePrice ?? this.selectedBasePrice,
      defaultCleaners: defaultCleaners ?? this.defaultCleaners,
      selectedTimeSlot: selectedTimeSlot ?? this.selectedTimeSlot,
      needMaterials: needMaterials ?? this.needMaterials,
      materialType: materialType ?? this.materialType,
      needEquipment: needEquipment ?? this.needEquipment,
      showBreakdown: showBreakdown ?? this.showBreakdown,
      lockedDays: lockedDays ?? this.lockedDays,
      isRapid: isRapid ?? this.isRapid,
      selectedRapidBasePrice:
          selectedRapidBasePrice ?? this.selectedRapidBasePrice,
      extraWorkerPrice: extraWorkerPrice,
      rapidExtraWorkerPrice: rapidExtraWorkerPrice,
      materialPrice: materialPrice,
      localProductPrice: localProductPrice,
      importedProductPrice: importedProductPrice,
      sizeM2: sizeM2 ?? this.sizeM2,
      availableSlots: availableSlots ?? this.availableSlots,
      isCheckingAvailability: isCheckingAvailability ?? this.isCheckingAvailability,
      service: service,
      category: category,
    );
  }

  @override
  List<Object?> get props => [
        selectedDate,
        selectedHouseConfigId,
        selectedCategoryServiceId,
        selectedHouseType,
        selectedHours,
        selectedCleaners,
        selectedBasePrice,
        defaultCleaners,
        selectedTimeSlot,
        needMaterials,
        materialType,
        needEquipment,
        showBreakdown,
        lockedDays,
        isRapid,
        selectedRapidBasePrice,
        extraWorkerPrice,
        rapidExtraWorkerPrice,
        materialPrice,
        localProductPrice,
        importedProductPrice,
        sizeM2,
        availableSlots,
        isCheckingAvailability,
        service,
        category,
      ];
}

class BookingCubit extends Cubit<BookingState> {
  BookingCubit({
    AppHouseConfig? houseConfig,
    AppCategoryService? categoryService,
    bool needMaterials = false,
    String? initialHouseType,
    AppService? service,
    AppCategory? category,
    bool isRapid = false,
  }) : super(
          BookingState.initial(
            houseConfig: houseConfig,
            categoryService: categoryService,
            needMaterials: needMaterials,
            service: service,
            category: category,
            isRapid: isRapid,
          ).copyWith(
            selectedHouseType: initialHouseType ?? houseConfig?.type ?? categoryService?.name,
            selectedCategoryServiceId: categoryService?.id,
            // Enforce minimum restriction: tomorrow (1 day) for rapid, 3 days for normal
            selectedDate: DateTime.now().add(Duration(days: isRapid ? 1 : 3)),
          ),
        ) {
    _loadLockedDays();
    checkAvailability();
  }

  Future<void> _loadLockedDays() async {
    try {
      final days = await locator<ServicesApiService>().getLockedDays();
      if (isClosed) return;
      emit(state.copyWith(lockedDays: days));
    } catch (_) {
      // Booking remains usable; the backend still rejects locked days.
    }
  }

  void selectDate(DateTime date) {
    if (state.isDateLocked(date)) return;
    emit(state.copyWith(selectedDate: date));
    checkAvailability();
  }

  void selectHouseConfig(AppHouseConfig config) {
    emit(state.copyWith(
      selectedHouseConfigId: config.id,
      selectedHouseType: config.type,
      selectedHours: config.durationHours,
      selectedCleaners: config.workers,
      selectedBasePrice: config.basePrice,
      selectedRapidBasePrice: config.rapidBasePrice,
      defaultCleaners: config.workers,
    ));
    checkAvailability();
  }

  void selectCategoryService(AppCategoryService config) {
    emit(state.copyWith(
      selectedCategoryServiceId: config.id,
      selectedHouseType: config.name,
      selectedHours: config.durationHours,
      selectedCleaners: config.workers,
      selectedBasePrice: config.basePrice,
      selectedRapidBasePrice: config.rapidBasePrice,
      defaultCleaners: config.workers,
    ));
    checkAvailability();
  }

  void setSizeM2(double? val) {
    emit(state.copyWith(sizeM2: val));
  }

  void toggleRapid(bool value) {
    final now = DateTime.now();
    final minDate = value
        ? DateTime(now.year, now.month, now.day + 1)
        : DateTime(now.year, now.month, now.day + 3);

    var newDate = state.selectedDate;
    if (newDate.isBefore(minDate)) {
      newDate = minDate;
    }
    emit(state.copyWith(isRapid: value, selectedDate: newDate));
    checkAvailability();
  }

  void selectHours(int hours) {
    emit(state.copyWith(selectedHours: hours));
    checkAvailability();
  }

  void selectExtraWorkers(int count) {
    emit(state.copyWith(selectedCleaners: state.defaultCleaners + count));
    checkAvailability();
  }

  void selectCleaners(int count) {
    emit(state.copyWith(selectedCleaners: count));
    checkAvailability();
  }

  void selectTimeSlot(String slot) =>
      emit(state.copyWith(selectedTimeSlot: slot));

  void toggleMaterials(bool need) =>
      emit(state.copyWith(needMaterials: need));

  void selectMaterial(BookingMaterial type) =>
      emit(state.copyWith(materialType: type));

  void toggleEquipment(bool need) =>
      emit(state.copyWith(needEquipment: need));

  void toggleBreakdown() =>
      emit(state.copyWith(showBreakdown: !state.showBreakdown));

  String formatTimeSlot(String timeStr) {
    final parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    var hour = int.tryParse(parts[0]) ?? 8;
    final minute = parts[1];
    final ampm = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour == 0) hour = 12;
    return '${hour.toString().padLeft(2, '0')}:$minute $ampm';
  }

  Future<void> checkAvailability() async {
    final dateStr = '${state.selectedDate.year.toString().padLeft(4, '0')}-${state.selectedDate.month.toString().padLeft(2, '0')}-${state.selectedDate.day.toString().padLeft(2, '0')}';

    emit(state.copyWith(isCheckingAvailability: true));
    try {
      final slots = await locator<OrdersApiService>().getAvailableSlots(
        date: dateStr,
        serviceId: state.service?.id,
        houseConfigId: state.selectedHouseConfigId,
        categoryId: state.category?.id,
        categoryServiceId: state.selectedCategoryServiceId,
        extraWorkers: state.extraWorkers,
        isRapid: state.isRapid,
      );

      if (isClosed) return;

      final formattedSlots = slots.map(formatTimeSlot).toList();
      final finalSlots = formattedSlots.isNotEmpty
          ? formattedSlots
          : const ['08:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '06:00 PM'];

      String? newSlot;
      if (finalSlots.contains(state.selectedTimeSlot)) {
        newSlot = state.selectedTimeSlot;
      } else {
        newSlot = finalSlots.first;
      }

      emit(state.copyWith(
        availableSlots: finalSlots,
        selectedTimeSlot: newSlot,
        isCheckingAvailability: false,
      ));
    } catch (_) {
      if (!isClosed) {
        const fallbackSlots = ['08:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '06:00 PM'];
        String? newSlot;
        if (fallbackSlots.contains(state.selectedTimeSlot)) {
          newSlot = state.selectedTimeSlot;
        } else {
          newSlot = fallbackSlots.first;
        }
        emit(state.copyWith(
          availableSlots: fallbackSlots,
          selectedTimeSlot: newSlot,
          isCheckingAvailability: false,
        ));
      }
    }
  }
}
