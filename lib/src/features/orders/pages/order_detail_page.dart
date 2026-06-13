import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/core/widgets/app_image.dart';
import 'package:cleanapp/src/features/orders/data/orders_api_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// Customer-facing detail view of one order (GET /api/orders/:id):
/// status, schedule, address, notes, photos and price.
class OrderDetailPage extends StatefulWidget {
  const OrderDetailPage({super.key, required this.orderId});

  final String orderId;

  @override
  State<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<OrderDetailPage> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = locator<OrdersApiService>().getOrder(widget.orderId);
  }

  static const Map<String, Color> _statusColors = {
    'PENDING': Color(0xFFF59E0B),
    'CALLED_NOT_PAID': Color(0xFFF97316),
    'CONFIRMED': Color(0xFF3B82F6),
    'IN_PROGRESS': Color(0xFF8B5CF6),
    'COMPLETED': Color(0xFF10B981),
    'CANCELLED': Color(0xFFEF4444),
  };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(l10n.orderDetails),
        backgroundColor: ColorApp.primary,
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(
                child: CircularProgressIndicator(color: ColorApp.primary));
          }
          if (snapshot.hasError || snapshot.data == null) {
            return Center(
              child: Text(
                snapshot.error
                        ?.toString()
                        .replaceFirst('Exception: ', '') ??
                    l10n.orderNotFound,
                style: const TextStyle(
                    color: ColorApp.textGrey, fontWeight: FontWeight.w600),
              ),
            );
          }

          final order = snapshot.data!;
          final service = order['service'] as Map<String, dynamic>?;
          final category = order['category'] as Map<String, dynamic>?;
          final title = (service?['name'] ??
              category?['name'] ??
              l10n.cleaningService) as String;
          final status = order['status'] as String? ?? 'PENDING';
          final statusColor = _statusColors[status] ?? ColorApp.textGrey;
          final scheduled =
              DateTime.tryParse(order['scheduledDate'] as String? ?? '')
                  ?.toLocal();
          final note = order['clientNote'] as String? ?? '';
          final photos = ((order['housePictures'] as List<dynamic>?) ?? [])
              .map((p) => p.toString())
              .toList();
          final isRapid = order['isRapid'] == true;

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // Header card: title + status
              Container(
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
                            title,
                            style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                color: ColorApp.textBlack),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            status.replaceAll('_', ' '),
                            style: TextStyle(
                                color: statusColor,
                                fontWeight: FontWeight.w900,
                                fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                    if (isRapid) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.bolt_rounded,
                              color: Color(0xFFF59E0B), size: 18),
                          const SizedBox(width: 4),
                          Text(l10n.rapidService,
                              style: const TextStyle(
                                  color: Color(0xFFF59E0B),
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13)),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Info card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  children: [
                    if (scheduled != null)
                      _infoRow(
                          Icons.calendar_today_rounded,
                          l10n.scheduled,
                          DateFormat('EEE, MMM d yyyy — h:mm a')
                              .format(scheduled)),
                    _infoRow(Icons.location_on_rounded, l10n.address,
                        order['address'] as String? ?? '-'),
                    _infoRow(Icons.people_outline_rounded, l10n.extraWorkers,
                        '${order['extraWorkers'] ?? 0}'),
                    _infoRow(
                        Icons.inventory_2_outlined,
                        l10n.materials,
                        order['useMaterials'] == true
                            ? (order['productOrigin'] == 'IMPORTED'
                                ? l10n.importedMaterials
                                : l10n.localMaterials)
                            : l10n.notNeeded),
                    _infoRow(
                        Icons.account_balance_wallet_outlined,
                        l10n.total,
                        'DA ${((order['totalPrice'] as num?) ?? 0).toStringAsFixed(2)}'),
                  ],
                ),
              ),

              if (note.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(l10n.yourNote,
                          style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: ColorApp.textBlack)),
                      const SizedBox(height: 8),
                      Text(note,
                          style: const TextStyle(
                              fontSize: 14,
                              height: 1.5,
                              color: ColorApp.textGrey,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],

              if (photos.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(l10n.photos,
                          style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: ColorApp.textBlack)),
                      const SizedBox(height: 12),
                      GridView.count(
                        crossAxisCount: 3,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 8,
                        crossAxisSpacing: 8,
                        children: photos
                            .map((p) => ClipRRect(
                                  borderRadius: BorderRadius.circular(14),
                                  child: AppImage(
                                    source: p,
                                    fit: BoxFit.cover,
                                    fallback: Container(
                                      color: ColorApp.softGrey,
                                      child: const Icon(
                                          Icons.image_not_supported_outlined,
                                          color: ColorApp.textGrey),
                                    ),
                                  ),
                                ))
                            .toList(),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 24),
            ],
          );
        },
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: ColorApp.primary, size: 20),
          const SizedBox(width: 12),
          Text(label,
              style: const TextStyle(
                  fontSize: 13,
                  color: ColorApp.textGrey,
                  fontWeight: FontWeight.w700)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                  fontSize: 13,
                  color: ColorApp.textBlack,
                  fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }
}
