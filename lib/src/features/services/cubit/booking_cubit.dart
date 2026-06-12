import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/services/booking_pricing.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:cleanapp/src/features/services/data/services_api_service.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class BookingState extends Equatable {
  final DateTime selectedDate;
  final String? selectedHouseConfigId;
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

  /// Days the admin locked for booking, as 'YYYY-MM-DD' strings
  /// (from GET /api/pages/locked-days).
  final List<String> lockedDays;

  const BookingState({
    required this.selectedDate,
    required this.selectedHouseConfigId,
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
  });

  factory BookingState.initial({
    AppHouseConfig? houseConfig,
    AppCategoryService? categoryService,
    bool needMaterials = false,
  }) =>
      BookingState(
        selectedDate: DateTime.now().add(const Duration(days: 1)),
        selectedHouseConfigId: houseConfig?.id,
        selectedHouseType: houseConfig?.type,
        selectedHours:
            houseConfig?.durationHours ?? categoryService?.durationHours ?? 4,
        selectedCleaners: houseConfig?.workers ?? categoryService?.workers ?? 1,
        selectedBasePrice:
            houseConfig?.basePrice ?? categoryService?.basePrice ?? 0,
        defaultCleaners: houseConfig?.workers ?? categoryService?.workers ?? 1,
        selectedTimeSlot: '05:30 pm - 06:00 pm',
        needMaterials: needMaterials,
        materialType: BookingMaterial.algerian,
        needEquipment: false,
        showBreakdown: false,
      );

  double get totalPrice => BookingPricing.total(
        basePrice: selectedBasePrice,
        hours: selectedHours,
        cleaners: selectedCleaners,
        needMaterials: needMaterials,
        materialType: materialType,
      );

  /// The selected date with the selected time slot's start time merged in,
  /// so the backend receives the real appointment time (not midnight).
  DateTime get scheduledDateTime {
    final match = RegExp(r'(\d{1,2}):(\d{2})\s*(AM|PM)', caseSensitive: false)
        .firstMatch(selectedTimeSlot);
    if (match == null) {
      // Fallback: 8 AM if the slot string is unparsable.
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

  /// Whether the admin has locked this calendar day for booking.
  bool isDateLocked(DateTime date) => lockedDays.contains(_dayKey(date));

  int get extraWorkers =>
      selectedCleaners > defaultCleaners ? selectedCleaners - defaultCleaners : 0;

  BookingState copyWith({
    DateTime? selectedDate,
    String? selectedHouseConfigId,
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
  }) {
    return BookingState(
      selectedDate: selectedDate ?? this.selectedDate,
      selectedHouseConfigId:
          selectedHouseConfigId ?? this.selectedHouseConfigId,
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
    );
  }

  @override
  List<Object?> get props => [
        selectedDate,
        selectedHouseConfigId,
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
      ];
}

class BookingCubit extends Cubit<BookingState> {
  BookingCubit({
    AppHouseConfig? houseConfig,
    AppCategoryService? categoryService,
    bool needMaterials = false,
    String? initialHouseType,
  })
      : super(
          BookingState.initial(
            houseConfig: houseConfig,
            categoryService: categoryService,
            needMaterials: needMaterials,
          ).copyWith(
            selectedHouseType: initialHouseType ?? houseConfig?.type,
          ),
        ) {
    _loadLockedDays();
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
    if (state.isDateLocked(date)) return; // locked days are not selectable
    emit(state.copyWith(selectedDate: date));
  }
  void selectHouseConfig(AppHouseConfig config) => emit(
        state.copyWith(
          selectedHouseConfigId: config.id,
          selectedHouseType: config.type,
          selectedHours: config.durationHours,
          selectedCleaners: config.workers,
          selectedBasePrice: config.basePrice,
          defaultCleaners: config.workers,
        ),
      );
  void selectHours(int hours) => emit(state.copyWith(selectedHours: hours));
  void selectExtraWorkers(int count) =>
      emit(state.copyWith(selectedCleaners: state.defaultCleaners + count));
  void selectCleaners(int count) =>
      emit(state.copyWith(selectedCleaners: count));
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
}
