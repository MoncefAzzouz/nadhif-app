import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/shadows.dart';
import 'package:cleanapp/src/core/widgets/app_image.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:cleanapp/src/features/services/pages/service_booking_page.dart';
import 'package:cleanapp/src/features/services/pages/property_selection_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ServiceDetailContent {
  final String objective;
  final List<String> includes;
  final String duration;
  final String additional;

  const ServiceDetailContent({
    required this.objective,
    required this.includes,
    required this.duration,
    required this.additional,
  });
}

class ServiceDetailsPage extends StatefulWidget {
  final String serviceName;
  final AppService? service;
  final AppCategory? category;
  final String? serviceImage;
  final IconData? serviceIcon;
  final bool fromRecommendation;

  const ServiceDetailsPage({
    super.key,
    required this.serviceName,
    this.service,
    this.category,
    this.serviceImage,
    this.serviceIcon,
    this.fromRecommendation = false,
  });

  @override
  State<ServiceDetailsPage> createState() => _ServiceDetailsPageState();
}

class _ServiceDetailsPageState extends State<ServiceDetailsPage> {
  AppHouseConfig? _selectedConfig;

  @override
  void initState() {
    super.initState();
    _selectedConfig = widget.service?.defaultHouseConfig;
  }

  static ServiceDetailContent _getDetailsForService(String name, String? backendDesc) {
    final lowerName = name.toLowerCase();
    
    if (lowerName.contains('deep clean') || lowerName.contains('deep cleaning')) {
      return const ServiceDetailContent(
        objective: 'A comprehensive and meticulous cleaning service aimed at removing accumulated dirt and stubborn stains that regular cleaning cannot cover.',
        includes: [
          'Deep cleaning of floors (washing and stain removal)',
          'Cleaning of walls, doors, and handles',
          'Complete kitchen cleaning (cabinets, countertops, sink, appliances, inside and out)',
          'Bathroom cleaning (toilet, sink, shower, and tiles)',
          'Dusting of all surfaces and corners',
          'Window cleaning (inside and out, if possible)',
          'Cleaning of frequently touched areas',
        ],
        duration: '7 hours',
        additional: 'If the work is not completed within this time, the house may require additional staff or extra days.\n\nOur staff are trained to provide high-quality service.',
      );
    }
    
    if (lowerName.contains('urgent') || lowerName.contains('home clean') || lowerName.contains('home cleaning') || lowerName.contains('fast clean')) {
      return const ServiceDetailContent(
        objective: 'Routine cleaning to keep your home fresh, tidy, and sanitized.',
        includes: [
          'Dusting & wiping all reachable surfaces',
          'Vacuuming and mopping floors',
          'Sanitizing bathroom toilets, sinks, and mirrors',
          'Kitchen cleanup including sink, counters, and exterior appliance cleaning',
          'Emptying trash bins and replacing liners',
        ],
        duration: '3 to 4 hours',
        additional: 'Ideal for weekly or bi-weekly maintenance. All cleaning products are eco-friendly and safe for kids and pets.',
      );
    }

    if (lowerName.contains('laundry')) {
      return const ServiceDetailContent(
        objective: 'Premium washing, drying, folding, and expert ironing to keep your clothes looking fresh.',
        includes: [
          'Sorting clothes by color and fabric type',
          'Washing with high-quality, fabric-safe detergents',
          'Tumble drying or air drying according to care labels',
          'Professional folding for clean storage',
          'Expert ironing and steam pressing',
        ],
        duration: '2 to 3 hours',
        additional: 'Handled with extreme care. Specific instructions for delicate clothes can be provided on-site.',
      );
    }

    if (lowerName.contains('car wash')) {
      return const ServiceDetailContent(
        objective: 'Full exterior wash and interior detailing to make your car look brand new.',
        includes: [
          'Active foam wash & pressure rinse',
          'Microfiber hand drying & tire dressing',
          'Vacuuming of all seats, carpets, and trunk space',
          'Detailed cleaning of dashboard, console, and windows',
          'Air freshening treatment',
        ],
        duration: '2 hours',
        additional: 'Performed on-site at your location. We use paint-safe microfiber towels and premium cleaning solutions.',
      );
    }

    if (lowerName.contains('carpet')) {
      return const ServiceDetailContent(
        objective: 'Deep carpet cleaning using advanced stain extraction methods to remove allergens and dirt.',
        includes: [
          'Deep industrial vacuuming to remove dry soil',
          'Targeted pre-treatment for tough spots and stains',
          'Hot water extraction / steam cleaning treatment',
          'Odor neutralization and sanitizing',
          'Fast-drying treatment',
        ],
        duration: '3 hours',
        additional: 'We recommend letting the carpet dry completely for 4-6 hours after cleaning before stepping on it.',
      );
    }

    if (lowerName.contains('ac repair') || lowerName.contains('ac service') || lowerName.contains('ac unit')) {
      return const ServiceDetailContent(
        objective: 'Full maintenance and repair for air conditioning units to ensure clean air and optimal cooling.',
        includes: [
          'Filter cleaning & debris replacement',
          'Condenser coil deep foam cleaning',
          'Refrigerant/gas level check & top-off',
          'Electrical wiring and connection inspection',
          'Overall performance and cooling test',
        ],
        duration: '2 hours',
        additional: 'Serviced by certified and experienced technicians. We offer a 30-day warranty on all repair services.',
      );
    }

    if (lowerName.contains('pest control')) {
      return const ServiceDetailContent(
        objective: 'Safe and effective removal of common household pests and insects.',
        includes: [
          'Detailed inspection of pest breeding areas and pathways',
          'Targeted chemical, spray, or gel application',
          'Advice on crack & crevice sealing to prevent returns',
          'Safety briefing for family members',
        ],
        duration: '3 hours',
        additional: 'We use odor-free and eco-friendly products that are safe for humans and pets.',
      );
    }

    if (lowerName.contains('furniture')) {
      return const ServiceDetailContent(
        objective: 'Deep steam cleaning and sanitization for sofas, mattresses, and upholstered chairs.',
        includes: [
          'Fabric inspection and color fastness test',
          'Deep vacuuming of crevices and cushion seams',
          'Steam extraction and shampooing to lift dirt',
          'Odor & stain removal treatment',
          'Fabric protection coating application',
        ],
        duration: '4 hours',
        additional: 'Prolongs the life of your furniture. Effectively removes allergens, dust mites, and bacteria.',
      );
    }

    if (lowerName.contains('subscription') || lowerName.contains('pack')) {
      return const ServiceDetailContent(
        objective: 'All-in-one recurring package covering general home checkups, cleaning, and light repairs.',
        includes: [
          'Weekly general home cleaning sessions',
          'Bi-weekly kitchen & bathroom deep sanitization',
          'Monthly AC and home appliance health checks',
          'Light plumbing & electrical troubleshooting as needed',
          'Priority customer scheduling and support',
        ],
        duration: 'Recurring (4h/session)',
        additional: 'Saves up to 25% compared to booking services individually. Cancel or pause anytime.',
      );
    }

    // Default fallback using backend description or general cleaning details
    return ServiceDetailContent(
      objective: (backendDesc != null && backendDesc.isNotEmpty)
          ? backendDesc
          : 'A professional service designed to meet your specific home maintenance and cleaning requirements.',
      includes: const [
        'Assessment of specific client needs',
        'Use of high-quality tools and equipment',
        'Trained and vetted service professionals',
        'Thorough cleanup after service completion',
      ],
      duration: 'Flexible',
      additional: 'Our staff are trained to provide high-quality service. Your satisfaction is guaranteed.',
    );
  }

  @override
  Widget build(BuildContext context) {
    final backendDesc = widget.service?.description ?? widget.category?.description;
    final details = _getDetailsForService(widget.serviceName, backendDesc);
    final houseConfigs = widget.service?.houseConfigs ?? const <AppHouseConfig>[];
    final hasHouseConfigs = houseConfigs.isNotEmpty;

    return Scaffold(
      backgroundColor: Colors.white,
      body: AnnotatedRegion<SystemUiOverlayStyle>(
        value: SystemUiOverlayStyle.light,
        child: Stack(
          children: [
            // Scrollable Content
            Positioned.fill(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top Hero Image Section
                    SizedBox(
                      height: 340,
                      width: double.infinity,
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: Hero(
                              tag: 'service_details_img_${widget.serviceName}',
                              child: AppImage(
                                source: widget.serviceImage,
                                width: double.infinity,
                                height: double.infinity,
                                fallback: Container(
                                  color: ColorApp.primary.withValues(alpha: 0.1),
                                  child: Icon(
                                    widget.serviceIcon ?? Icons.cleaning_services_rounded,
                                    color: ColorApp.primary,
                                    size: 80,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          // Dark gradient overlay at the bottom to ensure title text readability
                          Positioned.fill(
                            child: Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    Colors.black.withValues(alpha: 0.3),
                                    Colors.black.withValues(alpha: 0.0),
                                    Colors.black.withValues(alpha: 0.6),
                                  ],
                                  stops: const [0.0, 0.5, 1.0],
                                ),
                              ),
                            ),
                          ),
                          // Service Name Overlay
                          Positioned(
                            bottom: 24,
                            left: 24,
                            right: 24,
                            child: Text(
                              widget.serviceName,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 30,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -0.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Description and details section
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 28, 24, 120),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Description',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              color: ColorApp.textBlack,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Objective Section
                          _buildSectionTitle('Objective'),
                          const SizedBox(height: 8),
                          Text(
                            details.objective,
                            style: const TextStyle(
                              fontSize: 15,
                              height: 1.5,
                              color: ColorApp.textGrey,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Service Includes Section
                          _buildSectionTitle('Service Includes'),
                          const SizedBox(height: 12),
                          ...details.includes.map((item) => Padding(
                                padding: const EdgeInsets.only(bottom: 8.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Padding(
                                      padding: EdgeInsets.only(top: 4.0),
                                      child: Icon(
                                        Icons.circle_rounded,
                                        size: 8,
                                        color: ColorApp.primary,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        item,
                                        style: const TextStyle(
                                          fontSize: 15,
                                          height: 1.4,
                                          color: ColorApp.textGrey,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              )),
                          const SizedBox(height: 24),

                          // House layout selection (only when the service has
                          // backend house configs). Picking a layout auto-fills
                          // Workers / Base Price / Duration below.
                          if (hasHouseConfigs) ...[
                            _buildSectionTitle('House Type'),
                            const SizedBox(height: 12),
                            _HouseLayoutSection(
                              configs: houseConfigs,
                              onChanged: (config) =>
                                  _selectedConfig = config,
                            ),
                            const SizedBox(height: 24),
                          ] else ...[
                            // Duration Section
                            Row(
                              children: [
                                _buildSectionTitle('Duration'),
                                const SizedBox(width: 8),
                                Text(
                                  details.duration,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    color: ColorApp.primary,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                          ],

                          // Additional Section
                          Text(
                            details.additional,
                            style: const TextStyle(
                              fontSize: 15,
                              height: 1.5,
                              color: ColorApp.textGrey,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Persistent Back Button (top left)
            Positioned(
              top: MediaQuery.of(context).padding.top + 8,
              left: 16,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.25),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.arrow_back_rounded,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ),
            ),

            // Persistent Bottom Action Button ("Continue")
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: SafeArea(
                  top: false,
                  child: GestureDetector(
                    onTap: () {
                      if (widget.fromRecommendation) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PropertySelectionPage(
                              serviceName: widget.serviceName,
                              service: widget.service,
                              category: widget.category,
                              serviceImage: widget.serviceImage,
                              serviceIcon: widget.serviceIcon,
                            ),
                          ),
                        );
                      } else {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ServiceBookingPage(
                              serviceName: widget.serviceName,
                              service: widget.service,
                              category: widget.category,
                              serviceImage: widget.serviceImage,
                              serviceIcon: widget.serviceIcon,
                              selectedPropertyType: _selectedConfig?.type,
                            ),
                          ),
                        );
                      }
                    },
                    child: Container(
                      height: 56,
                      decoration: BoxDecoration(
                        color: ColorApp.primary,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: ColorApp.primary.withValues(alpha: 0.3),
                            blurRadius: 15,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'Continue',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w800,
        color: ColorApp.textBlack,
        letterSpacing: -0.2,
      ),
    );
  }
}

/// House-layout picker for the service details page. Mirrors the booking
/// page's `_HouseTypeSection`: a row of selectable type buttons (F2/F3/…)
/// plus a metric box that auto-fills Workers / Duration / Base Price from the
/// selected [AppHouseConfig]. Manages its own selection locally and reports
/// the current config back to the parent via [onChanged].
class _HouseLayoutSection extends StatefulWidget {
  final List<AppHouseConfig> configs;
  final ValueChanged<AppHouseConfig>? onChanged;

  const _HouseLayoutSection({
    required this.configs,
    this.onChanged,
  });

  @override
  State<_HouseLayoutSection> createState() => _HouseLayoutSectionState();
}

class _HouseLayoutSectionState extends State<_HouseLayoutSection> {
  late AppHouseConfig _selected;

  @override
  void initState() {
    super.initState();
    _selected = widget.configs.first;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.onChanged?.call(_selected);
    });
  }

  void _select(AppHouseConfig config) {
    setState(() => _selected = config);
    widget.onChanged?.call(config);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: widget.configs.map((config) {
            final isSelected = _selected.id == config.id;
            return Expanded(
              child: GestureDetector(
                onTap: () => _select(config),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  height: 50,
                  margin: EdgeInsets.only(
                    right: config == widget.configs.last ? 0 : 10,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected ? ColorApp.primary : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color:
                          isSelected ? Colors.transparent : ColorApp.greyBorder,
                      width: 1.5,
                    ),
                    boxShadow: isSelected ? AppShadows.primaryGlow() : null,
                  ),
                  child: Center(
                    child: Text(
                      config.type.toUpperCase(),
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
                  value: '${_selected.workers}',
                ),
              ),
              Expanded(
                child: _ConfigMetric(
                  label: l10n.duration,
                  value: '${_selected.durationHours} ${l10n.hours}',
                ),
              ),
              Expanded(
                child: _ConfigMetric(
                  label: l10n.basePrice,
                  value: 'DA ${_selected.basePrice.toStringAsFixed(0)}',
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
