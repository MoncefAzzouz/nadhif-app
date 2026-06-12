import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppTextField extends StatefulWidget {
  const AppTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.icon,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.suffixIcon,
    this.inputFormatters,
    this.onSubmitted,
    this.minLines = 1,
    this.maxLines = 1,
    this.fillColor = ColorApp.softGrey,
    this.borderRadius = 18,
    this.contentPadding =
        const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    this.textCapitalization = TextCapitalization.none,
  });

  final TextEditingController controller;
  final String label;
  final String? hint;
  final IconData? icon;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool obscureText;
  final Widget? suffixIcon;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onSubmitted;
  final int minLines;
  final int maxLines;
  final Color fillColor;
  final double borderRadius;
  final EdgeInsetsGeometry contentPadding;
  final TextCapitalization textCapitalization;

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  late final FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _focusNode = FocusNode()..addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isFocused = _focusNode.hasFocus;
    final borderRadius = BorderRadius.circular(widget.borderRadius);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      curve: Curves.easeOut,
      decoration: BoxDecoration(
        borderRadius: borderRadius,
        boxShadow: isFocused
            ? [
                BoxShadow(
                  color: ColorApp.primary.withValues(alpha: 0.12),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ]
            : null,
      ),
      child: TextField(
        controller: widget.controller,
        focusNode: _focusNode,
        keyboardType: widget.keyboardType,
        textInputAction: widget.textInputAction,
        obscureText: widget.obscureText,
        inputFormatters: widget.inputFormatters,
        onSubmitted: widget.onSubmitted,
        minLines: widget.obscureText ? 1 : widget.minLines,
        maxLines: widget.obscureText ? 1 : widget.maxLines,
        textCapitalization: widget.textCapitalization,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w700,
          color: ColorApp.textBlack,
        ),
        decoration: InputDecoration(
          labelText: widget.label,
          hintText: widget.hint,
          floatingLabelBehavior: FloatingLabelBehavior.auto,
          labelStyle: TextStyle(
            color: isFocused ? ColorApp.primary : ColorApp.textGrey,
            fontSize: 13,
            fontWeight: FontWeight.w800,
          ),
          floatingLabelStyle: const TextStyle(
            color: ColorApp.primary,
            fontSize: 13,
            fontWeight: FontWeight.w900,
          ),
          hintStyle: TextStyle(
            color: ColorApp.textGrey.withValues(alpha: 0.45),
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
          filled: true,
          fillColor: widget.fillColor,
          prefixIcon: widget.icon == null
              ? null
              : Icon(widget.icon, color: ColorApp.primary, size: 21),
          suffixIcon: widget.suffixIcon,
          border: OutlineInputBorder(
            borderRadius: borderRadius,
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: borderRadius,
            borderSide: BorderSide(
              color: Colors.black.withValues(alpha: 0.04),
              width: 1.2,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: borderRadius,
            borderSide: const BorderSide(color: ColorApp.primary, width: 1.5),
          ),
          contentPadding: widget.contentPadding,
        ),
      ),
    );
  }
}
