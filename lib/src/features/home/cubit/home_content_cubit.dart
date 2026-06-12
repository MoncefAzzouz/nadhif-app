import 'package:cleanapp/src/features/home/data/home_content_repository.dart';
import 'package:cleanapp/src/features/services/data/service_models.dart';
import 'package:cleanapp/src/features/slides/data/slides_api_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomeContentState {
  const HomeContentState({
    this.slides = const [],
    this.categories = const [],
    this.services = const [],
    this.isLoading = false,
  });

  final List<AppSlide> slides;
  final List<AppCategory> categories;
  final List<AppService> services;
  final bool isLoading;

  bool get hasContent =>
      slides.isNotEmpty || categories.isNotEmpty || services.isNotEmpty;

  HomeContentState copyWith({
    List<AppSlide>? slides,
    List<AppCategory>? categories,
    List<AppService>? services,
    bool? isLoading,
  }) {
    return HomeContentState(
      slides: slides ?? this.slides,
      categories: categories ?? this.categories,
      services: services ?? this.services,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  factory HomeContentState.fromContent(HomeContent content) =>
      HomeContentState(
        slides: content.slides,
        categories: content.categories,
        services: content.services,
      );
}

/// Holds the home screen content (slides / categories / services). The
/// initial state is seeded from the repository's disk cache (hydrated in
/// main) so the UI renders real data on the first frame, then [refresh]
/// silently updates from the network.
class HomeContentCubit extends Cubit<HomeContentState> {
  HomeContentCubit(this._repository)
      : super(_repository.cached != null
            ? HomeContentState.fromContent(_repository.cached!)
            : const HomeContentState()) {
    refresh();
  }

  final HomeContentRepository _repository;

  Future<void> refresh({bool force = false}) async {
    emit(state.copyWith(isLoading: true));
    try {
      final content = await _repository.getHomeContent(forceRefresh: force);
      emit(HomeContentState.fromContent(content));
    } catch (_) {
      // Keep showing the last known content when the network fails.
      emit(state.copyWith(isLoading: false));
    }
  }
}
