import 'package:cleanapp/src/features/services/booking_pricing.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class BookingState extends Equatable {
  final DateTime selectedDate;
  final int selectedHours;
  final int selectedCleaners;
  final String selectedTimeSlot;
  final bool needMaterials;
  final BookingMaterial materialType;
  final bool needEquipment;
  final bool showBreakdown;

  const BookingState({
    required this.selectedDate,
    required this.selectedHours,
    required this.selectedCleaners,
    required this.selectedTimeSlot,
    required this.needMaterials,
    required this.materialType,
    required this.needEquipment,
    required this.showBreakdown,
  });

  factory BookingState.initial() => BookingState(
        selectedDate: DateTime.now().add(const Duration(days: 1)),
        selectedHours: 4,
        selectedCleaners: 1,
        selectedTimeSlot: '05:30 pm - 06:00 pm',
        needMaterials: false,
        materialType: BookingMaterial.algerian,
        needEquipment: false,
        showBreakdown: false,
      );

  double get totalPrice => BookingPricing.total(
        hours: selectedHours,
        cleaners: selectedCleaners,
        needMaterials: needMaterials,
        materialType: materialType,
      );

  BookingState copyWith({
    DateTime? selectedDate,
    int? selectedHours,
    int? selectedCleaners,
    String? selectedTimeSlot,
    bool? needMaterials,
    BookingMaterial? materialType,
    bool? needEquipment,
    bool? showBreakdown,
  }) {
    return BookingState(
      selectedDate: selectedDate ?? this.selectedDate,
      selectedHours: selectedHours ?? this.selectedHours,
      selectedCleaners: selectedCleaners ?? this.selectedCleaners,
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
        selectedHours,
        selectedCleaners,
        selectedTimeSlot,
        needMaterials,
        materialType,
        needEquipment,
        showBreakdown,
      ];
}

class BookingCubit extends Cubit<BookingState> {
  BookingCubit() : super(BookingState.initial());

  void selectDate(DateTime date) => emit(state.copyWith(selectedDate: date));
  void selectHours(int hours) => emit(state.copyWith(selectedHours: hours));
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
