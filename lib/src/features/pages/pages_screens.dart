import 'package:cleanapp/src/core/res/color_app.dart';
import 'package:cleanapp/src/core/utils/dependency_injection.dart';
import 'package:cleanapp/src/features/pages/data/pages_api_service.dart';
import 'package:flutter/material.dart';

/// Shared scaffold for the CMS info screens (FAQ / Privacy / About).
class _InfoScaffold extends StatelessWidget {
  const _InfoScaffold({required this.title, required this.body});

  final String title;
  final Widget body;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(title),
        backgroundColor: ColorApp.primary,
      ),
      body: body,
    );
  }
}

class _AsyncBody<T> extends StatelessWidget {
  const _AsyncBody({required this.future, required this.builder});

  final Future<T> future;
  final Widget Function(BuildContext, T) builder;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(
              child: CircularProgressIndicator(color: ColorApp.primary));
        }
        if (snapshot.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                snapshot.error.toString().replaceFirst('Exception: ', ''),
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: ColorApp.textGrey, fontWeight: FontWeight.w600),
              ),
            ),
          );
        }
        return builder(context, snapshot.data as T);
      },
    );
  }
}

/// Help Center — FAQs from the admin CMS.
class HelpCenterPage extends StatelessWidget {
  const HelpCenterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return _InfoScaffold(
      title: 'Help Center',
      body: _AsyncBody<List<AppFaq>>(
        future: locator<PagesApiService>().getFaqs(),
        builder: (context, faqs) {
          if (faqs.isEmpty) {
            return const Center(
              child: Text('No FAQs yet',
                  style: TextStyle(
                      color: ColorApp.textGrey, fontWeight: FontWeight.w600)),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: faqs.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final faq = faqs[index];
              return Container(
                decoration: BoxDecoration(
                  color: ColorApp.softGrey,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Theme(
                  data: Theme.of(context)
                      .copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    tilePadding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    childrenPadding:
                        const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    iconColor: ColorApp.primary,
                    title: Text(
                      faq.question,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: ColorApp.textBlack,
                      ),
                    ),
                    children: [
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          faq.answer,
                          style: const TextStyle(
                            fontSize: 14,
                            height: 1.5,
                            color: ColorApp.textGrey,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

/// Privacy Policy text from the admin CMS.
class PrivacyPolicyPage extends StatelessWidget {
  const PrivacyPolicyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return _InfoScaffold(
      title: 'Privacy Policy',
      body: _AsyncBody<String>(
        future: locator<PagesApiService>().getPrivacyPolicy(),
        builder: (context, text) => SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Text(
            text.isEmpty ? 'No privacy policy published yet.' : text,
            style: const TextStyle(
              fontSize: 14,
              height: 1.6,
              color: ColorApp.textBlack,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}

/// About — company info from the admin CMS.
class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return _InfoScaffold(
      title: 'About Nadhif',
      body: _AsyncBody<AppAboutUs?>(
        future: locator<PagesApiService>().getAbout(),
        builder: (context, about) {
          if (about == null) {
            return const Center(
              child: Text('No information published yet.',
                  style: TextStyle(
                      color: ColorApp.textGrey, fontWeight: FontWeight.w600)),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              if (about.vision.isNotEmpty) ...[
                const Text('Our Vision',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: ColorApp.textBlack)),
                const SizedBox(height: 8),
                Text(about.vision,
                    style: const TextStyle(
                        fontSize: 14,
                        height: 1.6,
                        color: ColorApp.textGrey,
                        fontWeight: FontWeight.w600)),
                const SizedBox(height: 24),
              ],
              _contactTile(Icons.phone_rounded, 'Hotline', about.hotline),
              _contactTile(Icons.email_rounded, 'Email', about.email),
              _contactTile(Icons.language_rounded, 'Website', about.website),
              _contactTile(Icons.facebook_rounded, 'Facebook', about.facebook),
              _contactTile(
                  Icons.camera_alt_rounded, 'Instagram', about.instagram),
              _contactTile(
                  Icons.location_on_rounded, 'Address', about.wilayaCenter),
            ],
          );
        },
      ),
    );
  }

  Widget _contactTile(IconData icon, String label, String value) {
    if (value.isEmpty) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColorApp.softGrey,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Icon(icon, color: ColorApp.primary, size: 22),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: const TextStyle(
                      fontSize: 11,
                      color: ColorApp.textGrey,
                      fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(value,
                  style: const TextStyle(
                      fontSize: 14,
                      color: ColorApp.textBlack,
                      fontWeight: FontWeight.w800)),
            ],
          ),
        ],
      ),
    );
  }
}
