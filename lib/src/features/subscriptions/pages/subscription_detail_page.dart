import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/subscriptions/data/subscriptions_api_service.dart';
import 'package:flutter/material.dart';

/// Subscription detail: status, pricing and sessions. When the admin has
/// proposed days (DAYS_PROPOSED), lets the customer pick their cleaning days
/// from real availability and confirm the schedule.
class SubscriptionDetailPage extends StatefulWidget {
  const SubscriptionDetailPage({super.key, required this.subscriptionId});

  final String subscriptionId;

  @override
  State<SubscriptionDetailPage> createState() => _SubscriptionDetailPageState();
}

class _SubscriptionDetailPageState extends State<SubscriptionDetailPage> {
  AppSubscription? _subscription;
  AvailableDaysResult? _availability;
  bool _isLoading = true;
  String? _error;
  bool _isSubmitting = false;

  /// Selected day dates (yyyy-MM-dd) when choosing the schedule.
  final Set<String> _selectedDates = {};
  int _startHour = 9;

  static const Map<String, Color> _statusColors = {
    'PENDING': Color(0xFFF59E0B),
    'DAYS_PROPOSED': Color(0xFF3B82F6),
    'CONFIRMED': Color(0xFF3B82F6),
    'ACTIVE': Color(0xFF10B981),
    'COMPLETED': Color(0xFF64748B),
    'CANCELLED': Color(0xFFEF4444),
    'SCHEDULED': Color(0xFF3B82F6),
    'DONE': Color(0xFF10B981),
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final api = locator<SubscriptionsApiService>();
      final sub = await api.getSubscription(widget.subscriptionId);
      AvailableDaysResult? availability;
      if (sub.status == 'DAYS_PROPOSED') {
        availability = await api.getAvailableDays(widget.subscriptionId);
      }
      if (!mounted) return;
      setState(() {
        _subscription = sub;
        _availability = availability;
        _selectedDates.clear();
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  int get _requiredCount {
    final availability = _availability;
    final sub = _subscription;
    if (availability == null || sub == null) return 0;
    final perWeek = availability.daysPerWeek > 0
        ? availability.daysPerWeek
        : (sub.daysPerWeek > 0 ? sub.daysPerWeek : 1);
    return perWeek * availability.weeks.length;
  }

  Future<void> _confirmDays() async {
    final availability = _availability;
    if (availability == null || _selectedDates.isEmpty || _isSubmitting) return;

    setState(() => _isSubmitting = true);
    try {
      final dates = _selectedDates.map((d) {
        final parts = d.split('-').map(int.parse).toList();
        return DateTime(parts[0], parts[1], parts[2], _startHour);
      }).toList()
        ..sort();
      await locator<SubscriptionsApiService>().submitSessions(
        widget.subscriptionId,
        dates,
        availability.durationHours,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Schedule confirmed! See you on your cleaning days.'),
        backgroundColor: ColorApp.primary,
      ));
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(e.toString().replaceFirst('Exception: ', '')),
        backgroundColor: const Color(0xFFDC2626),
      ));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Subscription'),
        backgroundColor: ColorApp.primary,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: ColorApp.primary))
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Text(_error!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                color: ColorApp.textGrey,
                                fontWeight: FontWeight.w600)),
                      ),
                      const SizedBox(height: 12),
                      TextButton(onPressed: _load, child: const Text('Retry')),
                    ],
                  ),
                )
              : RefreshIndicator(
                  color: ColorApp.primary,
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(20),
                    children: [
                      _headerCard(),
                      const SizedBox(height: 20),
                      if (_subscription!.status == 'DAYS_PROPOSED' &&
                          _availability != null)
                        _dayPicker(),
                      if (_subscription!.sessions.isNotEmpty) ...[
                        _sectionTitle('Sessions'),
                        const SizedBox(height: 12),
                        ..._subscription!.sessions.map(_sessionTile),
                      ],
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
    );
  }

  Widget _headerCard() {
    final sub = _subscription!;
    final localeCode = Localizations.localeOf(context).languageCode;
    final color = _statusColors[sub.status] ?? ColorApp.textGrey;
    final tierName = sub.tierNameFor(localeCode);
    final propertyName = sub.propertyTypeNameFor(localeCode);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  tierName.isEmpty ? 'Subscription' : tierName,
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: ColorApp.textBlack),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  sub.status.replaceAll('_', ' '),
                  style: TextStyle(
                      color: color,
                      fontWeight: FontWeight.w900,
                      fontSize: 11),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _infoRow(Icons.home_rounded,
              '$propertyName · ${sub.surfaceM2.toStringAsFixed(0)} m² · ${sub.roomsToClean} rooms'),
          _infoRow(Icons.calendar_month_rounded,
              '${sub.daysPerWeek} days per week · ${sub.tierDurationHours}h per session'),
          if (sub.monthlyPrice > 0)
            _infoRow(Icons.payments_rounded,
                'DA ${sub.monthlyPrice.toStringAsFixed(0)} / month'
                '${sub.amountPaid > 0 ? ' · DA ${sub.amountPaid.toStringAsFixed(0)} paid' : ''}'),
          if (sub.status == 'PENDING')
            _infoRow(Icons.hourglass_top_rounded,
                'Our team is reviewing your request and will propose a price.'),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: ColorApp.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                  fontSize: 13,
                  color: ColorApp.textGrey,
                  fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _dayPicker() {
    final availability = _availability!;
    final required = _requiredCount;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Choose Your Days'),
        const SizedBox(height: 6),
        Text(
          'Pick ${availability.daysPerWeek} day(s) per week for the next '
          '${availability.weeks.length} weeks (${_selectedDates.length}/$required selected).',
          style: const TextStyle(
              fontSize: 12.5,
              color: ColorApp.textGrey,
              fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ...availability.weeks.map(_weekRow),
              const SizedBox(height: 8),
              const Text(
                'Start time',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: ColorApp.textGrey),
              ),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: List.generate(7, (i) {
                    final hour = 8 + i;
                    final selected = _startHour == hour;
                    return GestureDetector(
                      onTap: () => setState(() => _startHour = hour),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: selected ? ColorApp.primary : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: selected
                                  ? Colors.transparent
                                  : ColorApp.greyBorder),
                        ),
                        child: Text(
                          '${hour.toString().padLeft(2, '0')}:00',
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                            color:
                                selected ? Colors.white : ColorApp.textBlack,
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _selectedDates.isEmpty || _isSubmitting
                      ? null
                      : _confirmDays,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColorApp.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18)),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2.5),
                        )
                      : const Text('Confirm Days',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w900)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _weekRow(AvailableWeek week) {
    final perWeek = _availability!.daysPerWeek;
    final selectedInWeek =
        week.days.where((d) => _selectedDates.contains(d.date)).length;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Week ${week.week}',
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: ColorApp.textGrey),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: week.days.map((day) {
              final selected = _selectedDates.contains(day.date);
              final selectable = day.isAvailable && !day.isLocked;
              final dayNum = day.date.length >= 10
                  ? day.date.substring(8, 10)
                  : day.date;
              final label = day.dayName.isEmpty
                  ? day.date
                  : '${day.dayName.substring(0, day.dayName.length >= 3 ? 3 : day.dayName.length)} $dayNum';
              return GestureDetector(
                onTap: !selectable
                    ? null
                    : () {
                        setState(() {
                          if (selected) {
                            _selectedDates.remove(day.date);
                          } else {
                            if (perWeek > 0 && selectedInWeek >= perWeek) {
                              // Replace within the week instead of exceeding it.
                              return;
                            }
                            _selectedDates.add(day.date);
                          }
                        });
                      },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: selected
                        ? ColorApp.primary
                        : selectable
                            ? Colors.white
                            : ColorApp.softGrey,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: selected
                            ? Colors.transparent
                            : ColorApp.greyBorder),
                  ),
                  child: Text(
                    label,
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 12.5,
                      color: selected
                          ? Colors.white
                          : selectable
                              ? ColorApp.textBlack
                              : ColorApp.textGrey.withValues(alpha: 0.5),
                      decoration:
                          selectable ? null : TextDecoration.lineThrough,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _sessionTile(AppSubscriptionSession session) {
    final color = _statusColors[session.status] ?? ColorApp.textGrey;
    final date = session.scheduledDate;
    final dateText = date == null
        ? '—'
        : '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year} · '
            '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: ColorApp.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.cleaning_services_rounded,
                size: 18, color: ColorApp.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  dateText,
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: ColorApp.textBlack),
                ),
                Text(
                  '${session.durationHours}h session',
                  style: const TextStyle(
                      fontSize: 12,
                      color: ColorApp.textGrey,
                      fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              session.status.replaceAll('_', ' '),
              style: TextStyle(
                  color: color, fontWeight: FontWeight.w900, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String text) => Text(
        text,
        style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: ColorApp.textBlack),
      );
}
