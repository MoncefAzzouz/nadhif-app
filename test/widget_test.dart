import 'package:cleanapp/main.dart';
import 'package:cleanapp/src/core/common/cubit/locale_cubit.dart';
import 'package:cleanapp/src/features/auth/cubit/auth_cubit.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('CleanApp boots without exceptions', (tester) async {
    await tester.pumpWidget(
      MultiBlocProvider(
        providers: [
          BlocProvider(create: (_) => AuthCubit()),
          BlocProvider(create: (_) => LocaleCubit()),
        ],
        child: const CleanApp(),
      ),
    );
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
