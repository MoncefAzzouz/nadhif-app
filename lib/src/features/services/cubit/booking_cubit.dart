import 'package:cleanapp/src/features/services/booking_pricing.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
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
      ];
}

class BookingCubit extends Cubit<BookingState> {
  BookingCubit({
    AppHouseConfig? houseConfig,
    AppCategoryService? categoryService,
    bool needMaterials = false,
  })
      : super(
          BookingState.initial(
            houseConfig: houseConfig,
            categoryService: categoryService,
            needMaterials: needMaterials,
          ),
        );

  void selectDate(DateTime date) => emit(state.copyWith(selectedDate: date));
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
