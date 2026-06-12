import 'dart:async';

import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/shadows.dart';
import 'package:cleanapp/src/core/services/notification_service.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/core/widgets/app_image.dart';
import 'package:cleanapp/src/features/orders/data/orders_api_service.dart';
import 'package:cleanapp/src/features/orders/data/orders_repository.dart';
import 'package:cleanapp/src/features/orders/pages/order_detail_page.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

enum OrderFilter { active, scheduled, history }

class _OrderFilterMeta {
  final OrderFilter filter;
  final String label;
  final IconData icon;

  const _OrderFilterMeta(this.filter, this.label, this.icon);
}

class OrdersPage extends StatefulWidget {
  final OrdersRepository repository;

  const OrdersPage({
    super.key,
    this.repository = const InMemoryOrdersRepository(),
  });

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  List<ActiveOrder> _activeOrders = const [];
  List<ScheduledOrder> _scheduledOrders = const [];
  bool _isLoading = true;
  String? _error;
  OrderFilter _activeFilter = OrderFilter.active;
  StreamSubscription<void>? _orderUpdateSub;

  @override
  void initState() {
    super.initState();
    _activeOrders = widget.repository.getActiveOrders();
    _scheduledOrders = widget.repository.getScheduledOrders();
    _loadOrders();
    // Refresh live when an order-status push arrives (no manual pull needed).
    _orderUpdateSub = notificationService.onOrderUpdate.listen((_) {
      if (mounted) _loadOrders();
    });
  }

  @override
  void dispose() {
    _orderUpdateSub?.cancel();
    super.dispose();
  }

  Future<void> _loadOrders() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final orders = await locator<OrdersApiService>().getOrders();
      if (!mounted) return;
      setState(() {
        _activeOrders = orders
            .where((order) => !_isFinished(order['status'] as String?))
            .map(_toActiveOrder)
            .toList();
        _scheduledOrders = orders
            .where((order) => order['status'] == 'PENDING' || order['status'] == 'CONFIRMED')
            .map(_toScheduledOrder)
            .toList();
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

  bool _isFinished(String? status) => status == 'COMPLETED' || status == 'CANCELLED';

  Future<void> _cancelOrder(ActiveOrder order) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Cancel this order?',
            style: TextStyle(fontWeight: FontWeight.w900)),
        content: Text('${order.title} will be cancelled. This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Keep order'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Cancel order',
                style: TextStyle(
                    color: Color(0xFFDC2626), fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    try {
      await locator<OrdersApiService>().cancelOrder(order.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Order cancelled'),
          backgroundColor: ColorApp.primary,
        ),
      );
      _loadOrders();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: const Color(0xFFDC2626),
        ),
      );
    }
  }

  ActiveOrder _toActiveOrder(Map<String, dynamic> order) {
    final service = order['service'] as Map<String, dynamic>?;
    final category = order['category'] as Map<String, dynamic>?;
    final status = order['status'] as String? ?? 'PENDING';
    return ActiveOrder(
      id: order['id'] as String? ?? '',
      title: (service?['name'] ?? category?['name'] ?? 'Cleaning Service') as String,
      subtitle: DateFormat('MMM d, h:mm a').format(DateTime.parse(order['scheduledDate'] as String).toLocal()),
      status: status.replaceAll('_', ' '),
      progress: _progressForStatus(status),
      imageUrl: _imageForOrder(service, category),
      price: (order['totalPrice'] as num?)?.toDouble() ?? 0,
    );
  }

  ScheduledOrder _toScheduledOrder(Map<String, dynamic> order) {
    final service = order['service'] as Map<String, dynamic>?;
    final category = order['category'] as Map<String, dynamic>?;
    final date = DateTime.parse(order['scheduledDate'] as String).toLocal();
    return ScheduledOrder(
      title: (service?['name'] ?? category?['name'] ?? 'Cleaning Service') as String,
      subtitle: (order['status'] as String? ?? 'PENDING').replaceAll('_', ' '),
      date: DateFormat('MMM d, yyyy').format(date),
      time: DateFormat('h:mm a').format(date),
      imageUrl: _imageForOrder(service, category),
    );
  }

  String _imageForOrder(Map<String, dynamic>? service, Map<String, dynamic>? category) {
    final picture = (service?['picture'] ?? category?['picture']) as String?;
    if (picture != null && picture.isNotEmpty && !picture.startsWith('/')) {
      return picture;
    }
    return 'assets/images/urgent.png';
  }

  double _progressForStatus(String status) {
    switch (status) {
      case 'CONFIRMED':
        return 0.35;
      case 'IN_PROGRESS':
        return 0.7;
      case 'COMPLETED':
        return 1;
      case 'CANCELLED':
        return 0;
      default:
        return 0.15;
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final filters = <_OrderFilterMeta>[
      _OrderFilterMeta(
          OrderFilter.active, l10n.active, Icons.local_fire_department_rounded),
      _OrderFilterMeta(
          OrderFilter.scheduled, l10n.scheduled, Icons.calendar_month_rounded),
      _OrderFilterMeta(
          OrderFilter.history, l10n.history, Icons.history_rounded),
    ];

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          const _BackgroundGlow(),
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(context),
                _buildFilterBar(filters),
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            _error!,
                            style: const TextStyle(
                              color: Color(0xFFDC2626),
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        TextButton(onPressed: _loadOrders, child: const Text('Retry')),
                      ],
                    ),
                  ),
                Expanded(child: _isLoading ? const Center(child: CircularProgressIndicator()) : _buildOrderList(context)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                l10n.orders,
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: ColorApp.textBlack,
                  letterSpacing: -1,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: AppShadows.card,
                ),
                child: const Icon(Icons.refresh_rounded,
                    color: ColorApp.textBlack, size: 22),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            l10n.trackManage,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: ColorApp.textGrey.withValues(alpha: 0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBar(List<_OrderFilterMeta> filters) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: filters.map((filter) {
          final bool isSelected = _activeFilter == filter.filter;
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () => setState(() => _activeFilter = filter.filter),
              child: AnimatedScale(
                scale: isSelected ? 1.05 : 1.0,
                duration: const Duration(milliseconds: 200),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 24, vertical: 14),
                  decoration: BoxDecoration(
                    color: isSelected ? ColorApp.textBlack : Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isSelected
                          ? Colors.transparent
                          : ColorApp.greyBorder,
                      width: 1.5,
                    ),
                    boxShadow: isSelected ? AppShadows.chipSelected : null,
                  ),
                  child: Row(
                    children: [
                      Icon(
                        filter.icon,
                        size: 18,
                        color: isSelected ? Colors.white : ColorApp.textGrey,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        filter.label,
                        style: TextStyle(
                          color:
                              isSelected ? Colors.white : ColorApp.textGrey,
                          fontWeight: isSelected
                              ? FontWeight.w900
                              : FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildOrderList(BuildContext context) {
    switch (_activeFilter) {
      case OrderFilter.history:
        return const _EmptyState();
      case OrderFilter.active:
        return ListView.builder(
          padding: const EdgeInsets.all(24),
          physics: const BouncingScrollPhysics(),
          itemCount: _activeOrders.length,
          itemBuilder: (context, index) => Padding(
            padding: EdgeInsets.only(
                bottom: index == _activeOrders.length - 1 ? 0 : 20),
            child: GestureDetector(
              onTap: _activeOrders[index].id.isEmpty
                  ? null
                  : () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => OrderDetailPage(
                              orderId: _activeOrders[index].id),
                        ),
                      ),
              child: _ActiveOrderCard(
                order: _activeOrders[index],
                onCancel: _cancelOrder,
              ),
            ),
          ),
        );
      case OrderFilter.scheduled:
        return ListView.builder(
          padding: const EdgeInsets.all(24),
          physics: const BouncingScrollPhysics(),
          itemCount: _scheduledOrders.length,
          itemBuilder: (context, index) => Padding(
            padding: EdgeInsets.only(
                bottom: index == _scheduledOrders.length - 1 ? 0 : 20),
            child: _ScheduledOrderCard(order: _scheduledOrders[index]),
          ),
        );
    }
  }
}

class _OrderThumb extends StatelessWidget {
  final String imageUrl;
  final double size;

  const _OrderThumb({required this.imageUrl, this.size = 60});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: size,
        height: size,
        color: ColorApp.softGrey,
        child: AppImage(
          source: imageUrl,
          fit: BoxFit.cover,
          fallback: const Icon(
            Icons.image_not_supported,
            color: ColorApp.textGrey,
          ),
        ),
      ),
    );
  }
}

class _ActiveOrderCard extends StatelessWidget {
  final ActiveOrder order;
  final void Function(ActiveOrder)? onCancel;
  const _ActiveOrderCard({required this.order, this.onCancel});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border:
            Border.all(color: ColorApp.greyBorder.withValues(alpha: 0.39)),
        boxShadow: AppShadows.elevated,
      ),
      child: Column(
        children: [
          Row(
            children: [
              _OrderThumb(imageUrl: order.imageUrl),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.title,
                      style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: ColorApp.textBlack),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      order.subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: ColorApp.textGrey.withValues(alpha: 0.78),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: ColorApp.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'DA ${order.price.toStringAsFixed(0)}',
                  style: TextStyle(
                      color: ColorApp.primary,
                      fontWeight: FontWeight.w900,
                      fontSize: 13),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                order.status,
                style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: ColorApp.textBlack),
              ),
              Row(
                children: [
                  if (order.canCancel && onCancel != null) ...[
                    GestureDetector(
                      onTap: () => onCancel!(order),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDC2626).withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'Cancel',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFFDC2626),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                  ],
                  Text(
                    '${(order.progress * 100).toInt()}%',
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: ColorApp.primary),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Stack(
            children: [
              Container(
                height: 8,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: ColorApp.softGrey,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              AnimatedContainer(
                duration: const Duration(seconds: 1),
                height: 8,
                width: MediaQuery.of(context).size.width * 0.6 * order.progress,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [ColorApp.primary, ColorApp.gradientTeal],
                  ),
                  borderRadius: BorderRadius.circular(4),
                  boxShadow: [
                    BoxShadow(
                      color: ColorApp.primary.withValues(alpha: 0.31),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ScheduledOrderCard extends StatelessWidget {
  final ScheduledOrder order;
  const _ScheduledOrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border:
            Border.all(color: ColorApp.greyBorder.withValues(alpha: 0.39)),
        boxShadow: AppShadows.elevated,
      ),
      child: Column(
        children: [
          Row(
            children: [
              _OrderThumb(imageUrl: order.imageUrl, size: 50),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.title,
                      style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: ColorApp.textBlack),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      order.subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: ColorApp.textGrey.withValues(alpha: 0.78),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ColorApp.softGrey.withValues(alpha: 0.59),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Icon(Icons.calendar_today_rounded,
                    size: 16,
                    color: ColorApp.textBlack.withValues(alpha: 0.59)),
                const SizedBox(width: 8),
                Text(
                  order.date,
                  style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                      color: ColorApp.textBlack),
                ),
                const Spacer(),
                Icon(Icons.access_time_rounded,
                    size: 16,
                    color: ColorApp.textBlack.withValues(alpha: 0.59)),
                const SizedBox(width: 8),
                Text(
                  order.time,
                  style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                      color: ColorApp.textBlack),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: const BoxDecoration(
              color: ColorApp.softGrey,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.assignment_rounded,
                size: 40,
                color: ColorApp.textGrey.withValues(alpha: 0.39)),
          ),
          const SizedBox(height: 24),
          Text(
            l10n.noOrders,
            style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: ColorApp.textBlack),
          ),
          const SizedBox(height: 8),
          Text(
            l10n.bookServiceNow,
            style: const TextStyle(
              fontSize: 14,
              color: ColorApp.textGrey,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _BackgroundGlow extends StatelessWidget {
  const _BackgroundGlow();

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: -100,
      left: -100,
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
