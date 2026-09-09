import 'package:flutter/material.dart';

import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/services/auth_token_store.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/auth/pages/phone_number_page.dart';

/// Returns true if a real (non-guest) account is signed in. If not — whether
/// truly logged out or just browsing as a guest — explains why and, once the
/// user acknowledges, sends them to sign in/register; returns false either
/// way, so callers should abort the current action:
/// `if (!await requireAccount(context)) return;`.
Future<bool> requireAccount(BuildContext context) async {
  final user = await locator<AuthTokenStore>().readUser();
  if (user != null && !user.isGuest) return true;
  if (!context.mounted) return false;

  final proceed = await showDialog<bool>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      title: const Text(
        "Create an account to continue",
        style: TextStyle(fontWeight: FontWeight.w900, color: ColorApp.textBlack),
      ),
      content: const Text(
        "You're browsing as a guest. Sign up or log in to complete this booking.",
        style: TextStyle(color: ColorApp.textGrey, fontWeight: FontWeight.w500, height: 1.4),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(dialogContext, false),
          child: const Text(
            "Cancel",
            style: TextStyle(color: ColorApp.textGrey, fontWeight: FontWeight.w700),
          ),
        ),
        TextButton(
          onPressed: () => Navigator.pop(dialogContext, true),
          child: const Text(
            "OK",
            style: TextStyle(color: ColorApp.primary, fontWeight: FontWeight.w800),
          ),
        ),
      ],
    ),
  );

  if (proceed == true && context.mounted) {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const PhoneNumberPage()),
    );
  }
  return false;
}
