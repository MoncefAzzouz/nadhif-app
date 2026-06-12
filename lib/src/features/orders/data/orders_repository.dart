class ActiveOrder {
  final String id;
  final String title;
  final String subtitle;
  final String status;
  final double progress;
  final String imageUrl;
  final double price;

  const ActiveOrder({
    this.id = '',
    required this.title,
    required this.subtitle,
    required this.status,
    required this.progress,
    required this.imageUrl,
    required this.price,
  });

  /// Customers may only cancel before the order is confirmed (backend rule).
  bool get canCancel =>
      id.isNotEmpty && (status == 'PENDING' || status == 'CALLED NOT PAID');
}

class ScheduledOrder {
  final String title;
  final String subtitle;
  final String date;
  final String time;
  final String imageUrl;

  const ScheduledOrder({
    required this.title,
    required this.subtitle,
    required this.date,
    required this.time,
    required this.imageUrl,
  });
}

abstract class OrdersRepository {
  List<ActiveOrder> getActiveOrders();
  List<ScheduledOrder> getScheduledOrders();
}

class InMemoryOrdersRepository implements OrdersRepository {
  const InMemoryOrdersRepository();

  @override
  List<ActiveOrder> getActiveOrders() => const <ActiveOrder>[
        ActiveOrder(
          title: 'Home Cleaning',
          subtitle: 'Urgent Service',
          status: 'In Progress',
          progress: 0.65,
          imageUrl: 'assets/images/urgent.png',
          price: 88,
        ),
        ActiveOrder(
          title: 'AC Maintenance',
          subtitle: 'Scheduled for 2:30 PM',
          status: 'Technician Assigned',
          progress: 0.3,
          imageUrl:
              'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200',
          price: 88,
        ),
      ];

  @override
  List<ScheduledOrder> getScheduledOrders() => const <ScheduledOrder>[
        ScheduledOrder(
          title: 'Laundry Pack',
          subtitle: 'Subscription Pack',
          date: 'May 15, 2026',
          time: '10:00 AM',
          imageUrl: 'assets/images/pack.png',
        ),
      ];
}
