import 'package:cached_network_image/cached_network_image.dart';
import 'package:cleanapp/l10n/app_localizations.dart';
import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/res/shadows.dart';
import 'package:cleanapp/src/features/orders/data/orders_repository.dart';
import 'package:flutter/material.dart';

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
  late final List<ActiveOrder> _activeOrders;
  late final List<ScheduledOrder> _scheduledOrders;
  OrderFilter _activeFilter = OrderFilter.active;

  @override
  void initState() {
    super.initState();
    _activeOrders = widget.repository.getActiveOrders();
    _scheduledOrders = widget.repository.getScheduledOrders();
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
                Expanded(child: _buildOrderList(context)),
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
                child: const Icon(Icons.search_rounded,
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
            child: _ActiveOrderCard(order: _activeOrders[index]),
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
        child: imageUrl.startsWith('http')
            ? CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                placeholder: (_, __) =>
                    const ColoredBox(color: ColorApp.softGrey),
                errorWidget: (_, __, ___) => const Icon(
                  Icons.image_not_supported,
                  color: ColorApp.textGrey,
                ),
              )
            : Image.asset(imageUrl, fit: BoxFit.cover),
      ),
    );
  }
}

class _ActiveOrderCard extends StatelessWidget {
  final ActiveOrder order;
  const _ActiveOrderCard({required this.order});

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
                child: const Text(
                  'DA 88',
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
              Text(
                '${(order.progress * 100).toInt()}%',
                style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: ColorApp.primary),
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
