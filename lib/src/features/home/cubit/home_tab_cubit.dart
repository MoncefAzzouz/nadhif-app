import 'package:flutter_bloc/flutter_bloc.dart';

class HomeTabCubit extends Cubit<int> {
  HomeTabCubit(super.initial);

  void select(int index) {
    if (state != index) emit(index);
  }
}
