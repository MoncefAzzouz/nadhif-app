import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/shadows.dart';
import 'package:cleanapp/src/core/widgets/app_image.dart';
import 'package:cleanapp/src/core/widgets/app_text_field.dart';
import 'package:cleanapp/src/features/services/booking_pricing.dart';
import 'package:cleanapp/src/features/services/cubit/booking_cubit.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:cleanapp/src/features/services/pages/order_summary_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ServiceBookingPage extends StatelessWidget {
  final String serviceName;
  final AppService? service;
  final AppCategory? category;
  final String? serviceImage;
  final IconData? serviceIcon;
  final String? selectedPropertyType;
  final bool isRapid;

  const ServiceBookingPage({
    super.key,
    required this.serviceName,
    this.service,
    this.category,
    this.serviceImage,
    this.serviceIcon,
    this.selectedPropertyType,
    this.isRapid = false,
  });

  @override
  Widget build(BuildContext context) {
    AppHouseConfig? initialConfig = service?.defaultHouseConfig;
    if (selectedPropertyType != null && service != null && service!.houseConfigs.isNotEmpty) {
      for (final config in service!.houseConfigs) {
        if (config.type.toLowerCase() == selectedPropertyType!.toLowerCase()) {
          initialConfig = config;
          break;
        }
      }
    }

    AppCategoryService? initialCategoryService = category?.defaultCategoryService;
    if (selectedPropertyType != null && category != null && category!.categoryServices.isNotEmpty) {
      for (final config in category!.categoryServices) {
        if (config.name.toLowerCase() == selectedPropertyType!.toLowerCase()) {
          initialCategoryService = config;
          break;
        }
      }
    }

    return BlocProvider(
      create: (_) => BookingCubit(
        houseConfig: initialConfig,
        categoryService: initialCategoryService,
        needMaterials: service?.materialsMandatory == true ||
            service?.productsMandatory == true ||
            category?.materialsMandatory == true ||
            category?.productsMandatory == true,
        initialHouseType: selectedPropertyType,
        service: service,
        category: category,
        isRapid: isRapid,
      ),
      child: _ServiceBookingView(
        serviceName: serviceName,
        service: service,
        category: category,
        serviceImage: serviceImage,
        serviceIcon: serviceIcon,
        isRapid: isRapid,
      ),
    );
  }
}

class _ServiceBookingView extends StatelessWidget {
  final String serviceName;
  final AppService? service;
  final AppCategory? category;
  final String? serviceImage;
  final IconData? serviceIcon;
  final bool isRapid;

  const _ServiceBookingView({
    required this.serviceName,
    this.service,
    this.category,
    this.serviceImage,
    this.serviceIcon,
    this.isRapid = false,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final houseConfigs = service?.houseConfigs ?? const <AppHouseConfig>[];
    final usesBackendHouseConfigs = houseConfigs.isNotEmpty;
    final materialsRequired = service?.materialsMandatory == true ||
        service?.productsMandatory == true ||
        category?.materialsMandatory == true ||
        category?.productsMandatory == true;
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          const _BackgroundGlow(),
          SafeArea(
            child: Column(
              children: [
                _buildAppBar(context),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeaderInfo(context, l10n),
                        const SizedBox(height: 16),
                        if (usesBackendHouseConfigs) ...[
                          BlocBuilder<BookingCubit, BookingState>(
                            buildWhen: (a, b) =>
                                a.selectedHouseConfigId !=
                                    b.selectedHouseConfigId ||
                                a.selectedHours != b.selectedHours ||
                                a.selectedCleaners != b.selectedCleaners ||
                                a.selectedBasePrice != b.selectedBasePrice,
                            builder: (context, state) => _HouseTypeSection(
                              configs: houseConfigs,
                              state: state,
                            ),
                          ),
                          const SizedBox(height: 16),
                          BlocBuilder<BookingCubit, BookingState>(
                            buildWhen: (a, b) => a.sizeM2 != b.sizeM2,
                            builder: (context, state) => _SurfaceInputSection(
                              initialValue: state.sizeM2,
                            ),
                          ),
                          const SizedBox(height: 16),
                          BlocBuilder<BookingCubit, BookingState>(
                            buildWhen: (a, b) =>
                                a.selectedCleaners != b.selectedCleaners ||
                                a.defaultCleaners != b.defaultCleaners,
                            builder: (context, state) =>
                                _ExtraWorkersSection(state: state),
                          ),
                          const SizedBox(height: 16),
                        ],
                        if (!usesBackendHouseConfigs && category != null && category!.categoryServices.isNotEmpty) ...[
                          BlocBuilder<BookingCubit, BookingState>(
                            buildWhen: (a, b) =>
                                a.selectedCategoryServiceId !=
                                    b.selectedCategoryServiceId ||
                                a.selectedHours != b.selectedHours ||
                                a.selectedCleaners != b.selectedCleaners ||
                                a.selectedBasePrice != b.selectedBasePrice,
                            builder: (context, state) => _CategoryServiceSection(
                              configs: category!.categoryServices,
                              state: state,
                            ),
                          ),
                          const SizedBox(height: 16),
                          BlocBuilder<BookingCubit, BookingState>(
                            buildWhen: (a, b) => a.sizeM2 != b.sizeM2,
                            builder: (context, state) => _SurfaceInputSection(
                              initialValue: state.sizeM2,
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],
                        BlocBuilder<BookingCubit, BookingState>(
                          buildWhen: (a, b) =>
                              a.selectedDate != b.selectedDate ||
                              a.lockedDays != b.lockedDays ||
                              a.isRapid != b.isRapid,
                          builder: (context, state) => _CalendarDateSection(
                            state: state,
                            isLocked: state.isDateLocked,
                          ),
                        ),
                        const SizedBox(height: 16),
                        if (!usesBackendHouseConfigs && (category == null || category!.categoryServices.isEmpty)) ...[
                          BlocBuilder<BookingCubit, BookingState>(
                            buildWhen: (a, b) =>
                                a.selectedHours != b.selectedHours,
                            builder: (context, state) => _HoursSection(
                                selectedHours: state.selectedHours),
                          ),
                          const SizedBox(height: 16),
                          BlocBuilder<BookingCubit, BookingState>(
                            buildWhen: (a, b) =>
                                a.selectedCleaners != b.selectedCleaners,
                            builder: (context, state) => _CleanersSection(
                                selectedCleaners: state.selectedCleaners),
                          ),
                        ],
                        const SizedBox(height: 16),
                        BlocBuilder<BookingCubit, BookingState>(
                          buildWhen: (a, b) =>
                              a.selectedTimeSlot != b.selectedTimeSlot ||
                              a.availableSlots != b.availableSlots ||
                              a.isCheckingAvailability != b.isCheckingAvailability,
                          builder: (context, state) {
                            if (state.isCheckingAvailability) {
                              return const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(16.0),
                                  child: CircularProgressIndicator.adaptive(),
                                ),
                              );
                            }
                            return _TimeSlotSection(
                              selectedTimeSlot: state.selectedTimeSlot,
                              slots: state.availableSlots,
                            );
                          },
                        ),
                        const SizedBox(height: 16),
                        BlocBuilder<BookingCubit, BookingState>(
                          buildWhen: (a, b) =>
                              a.needMaterials != b.needMaterials ||
                              a.materialType != b.materialType,
                          builder: (context, state) => _MaterialsCard(
                            needMaterials: state.needMaterials,
                            materialType: state.materialType,
                            isMandatory: materialsRequired,
                            localPrice: state.localProductPrice,
                            importedPrice: state.importedProductPrice,
                          ),
                        ),
                        const SizedBox(height: 16),
                        BlocBuilder<BookingCubit, BookingState>(
                          buildWhen: (a, b) =>
                              a.needEquipment != b.needEquipment,
                          builder: (context, state) => _EquipmentCard(
                            needEquipment: state.needEquipment,
                          ),
                        ),
                        BlocBuilder<BookingCubit, BookingState>(
                          buildWhen: (a, b) =>
                              a.isRapid != b.isRapid ||
                              a.selectedRapidBasePrice !=
                                  b.selectedRapidBasePrice,
                          builder: (context, state) => state.supportsRapid && !isRapid
                              ? Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: _RapidCard(
                                    isRapid: state.isRapid,
                                    rapidPrice: state.selectedRapidBasePrice,
                                  ),
                                )
                              : const SizedBox.shrink(),
                        ),
                        const SizedBox(height: 120),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          _BottomAction(
            serviceName: serviceName,
            service: service,
            category: category,
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 24, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const _CircleIcon(icon: Icons.arrow_back_rounded),
          ),
          Text(
            l10n.bookingDetails,
            style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w900,
                color: ColorApp.textBlack),
          ),
          const _CircleIcon(icon: Icons.favorite_border_rounded),
        ],
      ),
    );
  }

  Widget _buildHeaderInfo(BuildContext context, AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ColorApp.primary, ColorApp.primary.withValues(alpha: 0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: AppShadows.primaryGlowLarge(),
      ),
      child: Row(
        children: [
          Hero(
            tag: 'service_$serviceName',
            child: Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(24),
                border:
                    Border.all(color: Colors.white.withValues(alpha: 0.31)),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: AppImage(
                  source: serviceImage,
                  width: double.infinity,
                  height: double.infinity,
                  fallback: Icon(
                    serviceIcon ?? Icons.cleaning_services_rounded,
                    color: Colors.white,
                    size: 35,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  serviceName,
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Colors.white),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.star_rounded,
                        color: Colors.amber.shade400, size: 18),
                    const SizedBox(width: 4),
                    Text(
                      l10n.reviews('4.8', '1.2k'),
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String trailing;
  const _SectionHeader({required this.title, required this.trailing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            title,
            style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w900,
                color: ColorApp.textBlack,
                letterSpacing: -0.5),
          ),
          Text(
            trailing,
            style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: ColorApp.primary),
          ),
        ],
      ),
    );
  }
}

class _CalendarDateSection extends StatelessWidget {
  final BookingState state;
  final bool Function(DateTime) isLocked;
  const _CalendarDateSection({
    required this.state,
    required this.isLocked,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final now = DateTime.now();
    
    final firstDate = state.isRapid
        ? DateTime(now.year, now.month, now.day + 1)
        : DateTime(now.year, now.month, now.day + 3);
        
    final lastDate = now.add(const Duration(days: 365));

    final initialDate = state.selectedDate.isBefore(firstDate) ? firstDate : state.selectedDate;

    final dateText = '${state.selectedDate.day.toString().padLeft(2, '0')}/${state.selectedDate.month.toString().padLeft(2, '0')}/${state.selectedDate.year}';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeader(
          title: l10n.selectDate,
          trailing: '',
        ),
        GestureDetector(
          onTap: () async {
            final DateTime? picked = await showDatePicker(
              context: context,
              initialDate: initialDate,
              firstDate: firstDate,
              lastDate: lastDate,
              selectableDayPredicate: (DateTime date) => !isLocked(date),
              builder: (context, child) {
                return Theme(
                  data: Theme.of(context).copyWith(
                    colorScheme: const ColorScheme.light(
                      primary: ColorApp.primary,
                      onPrimary: Colors.white,
                      onSurface: ColorApp.textBlack,
                    ),
                  ),
                  child: child!,
                );
              },
            );
            if (picked != null && context.mounted) {
              context.read<BookingCubit>().selectDate(picked);
            }
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: ColorApp.greyBorder, width: 1.5),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_month_rounded, color: ColorApp.primary, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    dateText,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: ColorApp.textBlack,
                    ),
                  ),
                ),
                const Icon(Icons.keyboard_arrow_right_rounded, color: ColorApp.textGrey, size: 20),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _CategoryServiceSection extends StatelessWidget {
  final List<AppCategoryService> configs;
  final BookingState state;

  const _CategoryServiceSection({
    required this.configs,
    required this.state,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _SectionHeader(
          title: 'Layout/Type',
          trailing: '',
        ),
        Row(
          children: configs.map((config) {
            final isSelected = state.selectedCategoryServiceId == config.id;
            return Expanded(
              child: GestureDetector(
                onTap: () =>
                    context.read<BookingCubit>().selectCategoryService(config),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  height: 50,
                  margin: EdgeInsets.only(
                    right: config == configs.last ? 0 : 10,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected ? ColorApp.primary : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : ColorApp.greyBorder,
                      width: 1.5,
                    ),
                    boxShadow: isSelected ? AppShadows.primaryGlow() : null,
                  ),
                  child: Center(
                    child: Text(
                      config.nameFor(Localizations.localeOf(context).languageCode).toUpperCase(),
                      style: TextStyle(
                        color: isSelected ? Colors.white : ColorApp.textBlack,
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ColorApp.softGrey,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: Colors.black.withValues(alpha: 0.02)),
          ),
          child: Row(
            children: [
              Expanded(
                child: _ConfigMetric(
                  label: l10n.professionals,
                  value: '${state.selectedCleaners}',
                ),
              ),
              Expanded(
                child: _ConfigMetric(
                  label: l10n.duration,
                  value: '${state.selectedHours} ${l10n.hours}',
                ),
              ),
              Expanded(
                child: _ConfigMetric(
                  label: l10n.basePrice,
                  value: 'DA ${state.selectedBasePrice.toStringAsFixed(0)}',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SurfaceInputSection extends StatefulWidget {
  final double? initialValue;
  const _SurfaceInputSection({super.key, this.initialValue});

  @override
  State<_SurfaceInputSection> createState() => _SurfaceInputSectionState();
}

class _SurfaceInputSectionState extends State<_SurfaceInputSection> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(
      text: widget.initialValue != null && widget.initialValue! > 0
          ? widget.initialValue!.toStringAsFixed(0)
          : '',
    );
    _controller.addListener(() {
      final val = double.tryParse(_controller.text);
      context.read<BookingCubit>().setSizeM2(val);
    });
  }

  @override
  void didUpdateWidget(covariant _SurfaceInputSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialValue != oldWidget.initialValue) {
      final text = widget.initialValue != null && widget.initialValue! > 0
          ? widget.initialValue!.toStringAsFixed(0)
          : '';
      if (_controller.text != text) {
        _controller.text = text;
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _SectionHeader(title: 'Surface (m²)', trailing: ''),
        AppTextField(
          controller: _controller,
          label: 'Surface (m²)',
          hint: 'e.g. 85',
          icon: Icons.square_foot_rounded,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
          ],
        ),
      ],
    );
  }
}


class _HouseTypeSection extends StatelessWidget {
  final List<AppHouseConfig> configs;
  final BookingState state;

  const _HouseTypeSection({
    required this.configs,
    required this.state,
  });

  String _label(String type) => type.toUpperCase();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeader(
          title: 'House Type',
          trailing: state.selectedHouseType?.toUpperCase() ?? '',
        ),
        Row(
          children: configs.map((config) {
            final isSelected = state.selectedHouseConfigId == config.id;
            return Expanded(
              child: GestureDetector(
                onTap: () =>
                    context.read<BookingCubit>().selectHouseConfig(config),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  height: 50,
                  margin: EdgeInsets.only(
                    right: config == configs.last ? 0 : 10,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected ? ColorApp.primary : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : ColorApp.greyBorder,
                      width: 1.5,
                    ),
                    boxShadow: isSelected ? AppShadows.primaryGlow() : null,
                  ),
                  child: Center(
                    child: Text(
                      _label(config.typeFor(
                          Localizations.localeOf(context).languageCode)),
                      style: TextStyle(
                        color: isSelected ? Colors.white : ColorApp.textBlack,
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ColorApp.softGrey,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: Colors.black.withValues(alpha: 0.02)),
          ),
          child: Row(
            children: [
              Expanded(
                child: _ConfigMetric(
                  label: l10n.professionals,
                  value: '${state.selectedCleaners}',
                ),
              ),
              Expanded(
                child: _ConfigMetric(
                  label: l10n.duration,
                  value: '${state.selectedHours} ${l10n.hours}',
                ),
              ),
              Expanded(
                child: _ConfigMetric(
                  label: l10n.basePrice,
                  value: 'DA ${state.selectedBasePrice.toStringAsFixed(0)}',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ConfigMetric extends StatelessWidget {
  final String label;
  final String value;

  const _ConfigMetric({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: ColorApp.textGrey,
            fontSize: 11,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: ColorApp.textBlack,
            fontSize: 13,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _ExtraWorkersSection extends StatelessWidget {
  final BookingState state;

  const _ExtraWorkersSection({required this.state});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeader(
          title: 'Extra Workers',
          trailing: '+${state.extraWorkers}',
        ),
        Row(
          children: List.generate(4, (index) {
            final isSelected = state.extraWorkers == index;
            return Expanded(
              child: GestureDetector(
                onTap: () =>
                    context.read<BookingCubit>().selectExtraWorkers(index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  height: 50,
                  margin: EdgeInsets.only(right: index == 3 ? 0 : 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? ColorApp.primary.withValues(alpha: 0.12)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? ColorApp.primary : ColorApp.greyBorder,
                      width: 1.5,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      '+$index',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight:
                            isSelected ? FontWeight.w900 : FontWeight.w700,
                        color:
                            isSelected ? ColorApp.primary : ColorApp.textBlack,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 8),
        Text(
          'Total workers: ${state.selectedCleaners}',
          style: const TextStyle(
            color: ColorApp.textGrey,
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class _HoursSection extends StatelessWidget {
  final int selectedHours;
  const _HoursSection({required this.selectedHours});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeader(
            title: l10n.howManyHours,
            trailing: '$selectedHours ${l10n.hours}'),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: List.generate(7, (index) {
              final int hour = index + 4;
              final bool isSelected = selectedHours == hour;
              return GestureDetector(
                onTap: () =>
                    context.read<BookingCubit>().selectHours(hour),
                child: AnimatedScale(
                  scale: isSelected ? 1.05 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 54,
                    height: 54,
                    margin: const EdgeInsets.only(right: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? ColorApp.textBlack : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color: isSelected
                              ? Colors.transparent
                              : ColorApp.greyBorder,
                          width: 1.5),
                    ),
                    child: Center(
                      child: Text(
                        hour.toString().padLeft(2, '0'),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: isSelected
                              ? Colors.white
                              : ColorApp.textBlack,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _CleanersSection extends StatelessWidget {
  final int selectedCleaners;
  const _CleanersSection({required this.selectedCleaners});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeader(
            title: l10n.numberOfCleaners,
            trailing: '$selectedCleaners ${l10n.pro}'),
        Row(
          children: List.generate(5, (index) {
            final int count = index + 1;
            final bool isSelected = selectedCleaners == count;
            return Expanded(
              child: GestureDetector(
                onTap: () =>
                    context.read<BookingCubit>().selectCleaners(count),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  height: 50,
                  margin: EdgeInsets.only(right: index == 4 ? 0 : 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? ColorApp.primary.withValues(alpha: 0.12)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color: isSelected
                            ? ColorApp.primary
                            : ColorApp.greyBorder,
                        width: 1.5),
                  ),
                  child: Center(
                    child: Text(
                      count.toString().padLeft(2, '0'),
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight:
                            isSelected ? FontWeight.w900 : FontWeight.w700,
                        color:
                            isSelected ? ColorApp.primary : ColorApp.textBlack,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ],
    );
  }
}

class _TimeSlotSection extends StatelessWidget {
  final String selectedTimeSlot;
  final List<String> slots;
  const _TimeSlotSection(
      {required this.selectedTimeSlot, required this.slots});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeader(
            title: l10n.timeSlot, trailing: selectedTimeSlot.split(' ')[0]),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: slots.map((slot) {
              final bool isSelected = selectedTimeSlot.contains(slot);
              return GestureDetector(
                onTap: () =>
                    context.read<BookingCubit>().selectTimeSlot(slot),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 24, vertical: 16),
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? ColorApp.primary : Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                        color: isSelected
                            ? Colors.transparent
                            : ColorApp.greyBorder,
                        width: 1.5),
                  ),
                  child: Text(
                    slot,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: isSelected ? Colors.white : ColorApp.textBlack,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _MaterialsCard extends StatelessWidget {
  final bool needMaterials;
  final BookingMaterial materialType;
  final bool isMandatory;
  final double localPrice;
  final double importedPrice;

  const _MaterialsCard({
    required this.needMaterials,
    required this.materialType,
    required this.isMandatory,
    this.localPrice = 0,
    this.importedPrice = 0,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: ColorApp.softGrey,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.black.withValues(alpha: 0.02)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.auto_awesome_rounded,
                    color: ColorApp.primary, size: 22),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.cleaningMaterials,
                      style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: ColorApp.textBlack),
                    ),
                    Text(
                      l10n.chooseProducts,
                      style: const TextStyle(
                          fontSize: 12,
                          color: ColorApp.textGrey,
                          fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              Switch.adaptive(
                value: needMaterials || isMandatory,
                onChanged: isMandatory
                    ? null
                    : (val) =>
                        context.read<BookingCubit>().toggleMaterials(val),
                activeTrackColor:
                    ColorApp.primary.withValues(alpha: 0.39),
              ),
            ],
          ),
        ),
        if (needMaterials || isMandatory) ...[
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                  child: _BookingMaterialOption(
                      type: BookingMaterial.algerian,
                      price: localPrice > 0
                          ? 'DA ${localPrice.toStringAsFixed(0)}'
                          : 'DA ${BookingPricing.materialPriceAlgerian.toInt()}/hr',
                      isSelected:
                          materialType == BookingMaterial.algerian)),
              const SizedBox(width: 12),
              Expanded(
                  child: _BookingMaterialOption(
                      type: BookingMaterial.imported,
                      price: importedPrice > 0
                          ? 'DA ${importedPrice.toStringAsFixed(0)}'
                          : 'DA ${BookingPricing.materialPriceImported.toInt()}/hr',
                      isSelected:
                          materialType == BookingMaterial.imported)),
            ],
          ),
        ],
      ],
    );
  }
}

class _EquipmentCard extends StatelessWidget {
  final bool needEquipment;

  const _EquipmentCard({
    required this.needEquipment,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ColorApp.softGrey,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.black.withValues(alpha: 0.02)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.handyman_rounded,
                color: ColorApp.primary, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.cleaningEquipment,
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: ColorApp.textBlack),
                ),
                Text(
                  l10n.bringEquipment,
                  style: const TextStyle(
                      fontSize: 12,
                      color: ColorApp.textGrey,
                      fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          Switch.adaptive(
            value: needEquipment,
            onChanged: (val) =>
                context.read<BookingCubit>().toggleEquipment(val),
            activeTrackColor:
                ColorApp.primary.withValues(alpha: 0.39),
          ),
        ],
      ),
    );
  }
}

class _RapidCard extends StatelessWidget {
  final bool isRapid;
  final double rapidPrice;

  const _RapidCard({required this.isRapid, required this.rapidPrice});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ColorApp.softGrey,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.black.withValues(alpha: 0.02)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.bolt_rounded,
                color: Color(0xFFF59E0B), size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Rapid service',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: ColorApp.textBlack),
                ),
                Text(
                  'Priority scheduling — DA ${rapidPrice.toStringAsFixed(0)}',
                  style: const TextStyle(
                      fontSize: 12,
                      color: ColorApp.textGrey,
                      fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          Switch.adaptive(
            value: isRapid,
            onChanged: (val) =>
                context.read<BookingCubit>().toggleRapid(val),
            activeTrackColor: ColorApp.primary.withValues(alpha: 0.39),
          ),
        ],
      ),
    );
  }
}

class _BookingMaterialOption extends StatelessWidget {
  final BookingMaterial type;
  final String price;
  final bool isSelected;

  const _BookingMaterialOption({
    required this.type,
    required this.price,
    required this.isSelected,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final String label = type == BookingMaterial.algerian
        ? l10n.algerianProducts
        : l10n.importedFrance;

    return GestureDetector(
      onTap: () => context.read<BookingCubit>().selectMaterial(type),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? ColorApp.textBlack : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: isSelected ? Colors.transparent : ColorApp.greyBorder,
              width: 1.5),
          boxShadow: isSelected ? AppShadows.card : null,
        ),
        child: Column(
          children: [
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w900,
                color: isSelected ? Colors.white : ColorApp.textBlack,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              price,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.7)
                    : ColorApp.textGrey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BottomAction extends StatelessWidget {
  final String serviceName;
  final AppService? service;
  final AppCategory? category;
  const _BottomAction({
    required this.serviceName,
    this.service,
    this.category,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Align(
      alignment: Alignment.bottomCenter,
      child: Container(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 30),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
              topLeft: Radius.circular(40), topRight: Radius.circular(40)),
          boxShadow: AppShadows.topBar,
        ),
        child: BlocBuilder<BookingCubit, BookingState>(
          builder: (context, state) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (state.showBreakdown)
                  _PriceBreakdown(state: state, l10n: l10n),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          GestureDetector(
                            onTap: () => context
                                .read<BookingCubit>()
                                .toggleBreakdown(),
                            child: Row(
                              children: [
                                Text(l10n.totalPrice,
                                    style: const TextStyle(
                                        color: ColorApp.textGrey,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 11)),
                                const SizedBox(width: 4),
                                Icon(
                                    state.showBreakdown
                                        ? Icons.keyboard_arrow_down_rounded
                                        : Icons.keyboard_arrow_up_rounded,
                                    size: 14,
                                    color: ColorApp.textGrey),
                              ],
                            ),
                          ),
                          const SizedBox(height: 2),
                          TweenAnimationBuilder<double>(
                            tween: Tween(begin: 0, end: state.totalPrice),
                            duration: const Duration(milliseconds: 600),
                            curve: Curves.easeOutQuart,
                            builder: (context, value, child) {
                              return Text(
                                'DA ${value.toStringAsFixed(2)}',
                                style: const TextStyle(
                                    color: ColorApp.textBlack,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      flex: 2,
                      child: GestureDetector(
                        onTap: () => _openSummary(context, state),
                        child: Container(
                          height: 44,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                ColorApp.primary,
                                ColorApp.gradientTeal,
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow:
                                AppShadows.primaryGlow(opacity: 0.39),
                          ),
                          child: Center(
                            child: Text(
                              l10n.bookNow,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 14),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  void _openSummary(BuildContext context, BookingState state) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OrderSummaryPage(
          serviceName: serviceName,
          serviceId: service?.id,
          houseConfigId: state.selectedHouseConfigId,
          categoryId: category?.id,
          categoryServiceId: state.selectedCategoryServiceId,
          // Date with the selected slot's time merged in (not midnight).
          scheduledDate: state.scheduledDateTime,
          date: '${state.selectedDate.day}/${state.selectedDate.month}/${state.selectedDate.year}',
          time: state.selectedTimeSlot,
          // Entered/confirmed by the user on the summary page.
          address: '',
          frequency: 'One time schedule',
          duration: state.selectedHours,
          cleaners: state.selectedCleaners,
          extraWorkers: state.extraWorkers,
          needMaterials: state.needMaterials,
          needEquipment: state.needEquipment,
          materialType: state.materialType,
          subtotal: state.totalPrice,
          isRapid: state.isRapid,
          sizeM2: state.sizeM2,
        ),
      ),
    );
  }
}

class _PriceBreakdown extends StatelessWidget {
  final BookingState state;
  final AppLocalizations l10n;

  const _PriceBreakdown({required this.state, required this.l10n});

  @override
  Widget build(BuildContext context) {
    final productPrice = state.materialType == BookingMaterial.imported
        ? state.importedProductPrice
        : state.localProductPrice;
    return Container(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        children: [
          _BreakdownRow(
              label: state.isRapid ? '${l10n.basePrice} ⚡' : l10n.basePrice,
              value: state.selectedBasePrice > 0
                  ? 'DA ${state.effectiveBasePrice.toStringAsFixed(0)}'
                  : 'DA ${BookingPricing.basePricePerHour}/hr'),
          const SizedBox(height: 8),
          _BreakdownRow(
              label: l10n.professionals,
              value: 'x ${state.selectedCleaners}'),
          if (state.extraWorkers > 0 &&
              state.effectiveExtraWorkerPrice > 0) ...[
            const SizedBox(height: 8),
            _BreakdownRow(
                label: 'Extra workers',
                value:
                    '${state.extraWorkers} x DA ${state.effectiveExtraWorkerPrice.toStringAsFixed(0)}'),
          ],
          const SizedBox(height: 8),
          _BreakdownRow(
              label: l10n.duration,
              value: '${state.selectedHours} ${l10n.hours}'),
          if (state.needMaterials) ...[
            if (state.materialPrice > 0) ...[
              const SizedBox(height: 8),
              _BreakdownRow(
                  label: l10n.cleaningMaterials,
                  value: 'DA ${state.materialPrice.toStringAsFixed(0)}'),
            ],
            const SizedBox(height: 8),
            _BreakdownRow(
                label: state.materialType == BookingMaterial.algerian
                    ? l10n.algerianProducts
                    : l10n.importedFrance,
                value: state.selectedBasePrice > 0
                    ? 'DA ${productPrice.toStringAsFixed(0)}'
                    : 'DA ${(BookingPricing.materialRate(state.materialType) * state.selectedHours).toStringAsFixed(0)}'),
          ],
          const Divider(height: 32),
        ],
      ),
    );
  }
}

class _BreakdownRow extends StatelessWidget {
  final String label;
  final String value;
  const _BreakdownRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: const TextStyle(
                color: ColorApp.textGrey, fontWeight: FontWeight.w600)),
        Text(value,
            style: const TextStyle(
                color: ColorApp.textBlack, fontWeight: FontWeight.w800)),
      ],
    );
  }
}

class _BackgroundGlow extends StatelessWidget {
  const _BackgroundGlow();

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: -100,
      right: -100,
      child: Container(
        width: 300,
        height: 300,
        decoration: BoxDecoration(
          gradient: RadialGradient(
            colors: [
              ColorApp.primary.withValues(alpha: 0.18),
              ColorApp.primary.withValues(alpha: 0.0),
            ],
          ),
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}

class _CircleIcon extends StatelessWidget {
  final IconData icon;
  const _CircleIcon({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: AppShadows.card,
      ),
      child: Icon(icon, color: ColorApp.textBlack, size: 20),
    );
  }
}
