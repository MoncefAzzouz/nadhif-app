import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';
import 'app_localizations_fr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
    Locale('fr')
  ];

  /// No description provided for @welcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get welcome;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @services.
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get services;

  /// No description provided for @orders.
  ///
  /// In en, this message translates to:
  /// **'Orders'**
  String get orders;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @hello.
  ///
  /// In en, this message translates to:
  /// **'Hello'**
  String get hello;

  /// No description provided for @trackManage.
  ///
  /// In en, this message translates to:
  /// **'Track and manage your bookings'**
  String get trackManage;

  /// No description provided for @active.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get active;

  /// No description provided for @noOrders.
  ///
  /// In en, this message translates to:
  /// **'No orders yet'**
  String get noOrders;

  /// No description provided for @bookServiceNow.
  ///
  /// In en, this message translates to:
  /// **'Book a service now to see it here'**
  String get bookServiceNow;

  /// No description provided for @welcomeTitle.
  ///
  /// In en, this message translates to:
  /// **'WELCOME TO NADHIF'**
  String get welcomeTitle;

  /// No description provided for @welcomeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Professional cleaning\nservices at your door'**
  String get welcomeSubtitle;

  /// No description provided for @flashSale.
  ///
  /// In en, this message translates to:
  /// **'FLASH SALE'**
  String get flashSale;

  /// No description provided for @flashSaleTitle.
  ///
  /// In en, this message translates to:
  /// **'Home Deep Cleaning\nPackage'**
  String get flashSaleTitle;

  /// No description provided for @flashSaleSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Special 30% discount'**
  String get flashSaleSubtitle;

  /// No description provided for @newLabel.
  ///
  /// In en, this message translates to:
  /// **'NEW'**
  String get newLabel;

  /// No description provided for @laundry.
  ///
  /// In en, this message translates to:
  /// **'Laundry'**
  String get laundry;

  /// No description provided for @homeClean.
  ///
  /// In en, this message translates to:
  /// **'Home Clean'**
  String get homeClean;

  /// No description provided for @carWash.
  ///
  /// In en, this message translates to:
  /// **'Car Wash'**
  String get carWash;

  /// No description provided for @carpet.
  ///
  /// In en, this message translates to:
  /// **'Carpet'**
  String get carpet;

  /// No description provided for @shoeCare.
  ///
  /// In en, this message translates to:
  /// **'Shoe Care'**
  String get shoeCare;

  /// No description provided for @acRepair.
  ///
  /// In en, this message translates to:
  /// **'AC Repair'**
  String get acRepair;

  /// No description provided for @furniture.
  ///
  /// In en, this message translates to:
  /// **'Furniture'**
  String get furniture;

  /// No description provided for @deepClean.
  ///
  /// In en, this message translates to:
  /// **'Deep Clean'**
  String get deepClean;

  /// No description provided for @luxuryCare.
  ///
  /// In en, this message translates to:
  /// **'Luxury Care'**
  String get luxuryCare;

  /// No description provided for @babySafe.
  ///
  /// In en, this message translates to:
  /// **'Baby Safe'**
  String get babySafe;

  /// No description provided for @exclusiveOffers.
  ///
  /// In en, this message translates to:
  /// **'Exclusive Offers\nfor You'**
  String get exclusiveOffers;

  /// No description provided for @joinPremium.
  ///
  /// In en, this message translates to:
  /// **'Join our premium membership!'**
  String get joinPremium;

  /// No description provided for @joinNow.
  ///
  /// In en, this message translates to:
  /// **'Join Now'**
  String get joinNow;

  /// No description provided for @homeLabel.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get homeLabel;

  /// No description provided for @servicesLabel.
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get servicesLabel;

  /// No description provided for @ordersLabel.
  ///
  /// In en, this message translates to:
  /// **'Orders'**
  String get ordersLabel;

  /// No description provided for @profileLabel.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profileLabel;

  /// No description provided for @all.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get all;

  /// No description provided for @cleaning.
  ///
  /// In en, this message translates to:
  /// **'Cleaning'**
  String get cleaning;

  /// No description provided for @repair.
  ///
  /// In en, this message translates to:
  /// **'Repair'**
  String get repair;

  /// No description provided for @maintenance.
  ///
  /// In en, this message translates to:
  /// **'Maintenance'**
  String get maintenance;

  /// No description provided for @helpQuestion.
  ///
  /// In en, this message translates to:
  /// **'What can we help you with today?'**
  String get helpQuestion;

  /// No description provided for @searchServices.
  ///
  /// In en, this message translates to:
  /// **'Search for services...'**
  String get searchServices;

  /// No description provided for @book.
  ///
  /// In en, this message translates to:
  /// **'Book'**
  String get book;

  /// No description provided for @homeCleaningDesc.
  ///
  /// In en, this message translates to:
  /// **'Professional home cleaning & sanitization'**
  String get homeCleaningDesc;

  /// No description provided for @laundryDesc.
  ///
  /// In en, this message translates to:
  /// **'Premium wash, fold & expert ironing'**
  String get laundryDesc;

  /// No description provided for @carWashDesc.
  ///
  /// In en, this message translates to:
  /// **'Full exterior & detailed interior cleaning'**
  String get carWashDesc;

  /// No description provided for @acServicesDesc.
  ///
  /// In en, this message translates to:
  /// **'Expert AC repair & deep foam maintenance'**
  String get acServicesDesc;

  /// No description provided for @pestControl.
  ///
  /// In en, this message translates to:
  /// **'Pest Control'**
  String get pestControl;

  /// No description provided for @pestControlDesc.
  ///
  /// In en, this message translates to:
  /// **'Safe & effective pest removal services'**
  String get pestControlDesc;

  /// No description provided for @carpetDesc.
  ///
  /// In en, this message translates to:
  /// **'Professional carpet & rug deep cleaning'**
  String get carpetDesc;

  /// No description provided for @furnitureDesc.
  ///
  /// In en, this message translates to:
  /// **'Deep upholstery & furniture cleaning'**
  String get furnitureDesc;

  /// No description provided for @fromPrice.
  ///
  /// In en, this message translates to:
  /// **'From {price}'**
  String fromPrice(Object price);

  /// No description provided for @recommendedServices.
  ///
  /// In en, this message translates to:
  /// **'Recommended Services'**
  String get recommendedServices;

  /// No description provided for @ourServices.
  ///
  /// In en, this message translates to:
  /// **'Our Services'**
  String get ourServices;

  /// No description provided for @officialPartners.
  ///
  /// In en, this message translates to:
  /// **'Official Partners'**
  String get officialPartners;

  /// No description provided for @seeAll.
  ///
  /// In en, this message translates to:
  /// **'See All'**
  String get seeAll;

  /// No description provided for @bookNow.
  ///
  /// In en, this message translates to:
  /// **'Book Now'**
  String get bookNow;

  /// No description provided for @urgentCleaning.
  ///
  /// In en, this message translates to:
  /// **'Urgent Cleaning'**
  String get urgentCleaning;

  /// No description provided for @subscriptionPack.
  ///
  /// In en, this message translates to:
  /// **'Subscription Pack'**
  String get subscriptionPack;

  /// No description provided for @acServices.
  ///
  /// In en, this message translates to:
  /// **'AC Services'**
  String get acServices;

  /// No description provided for @startingHours.
  ///
  /// In en, this message translates to:
  /// **'Starting {hours} Hours'**
  String startingHours(Object hours);

  /// No description provided for @fullMaintenance.
  ///
  /// In en, this message translates to:
  /// **'Full Maintenance'**
  String get fullMaintenance;

  /// No description provided for @foamDeepCleaning.
  ///
  /// In en, this message translates to:
  /// **'Foam Deep Cleaning'**
  String get foamDeepCleaning;

  /// No description provided for @bookingDetails.
  ///
  /// In en, this message translates to:
  /// **'Booking Details'**
  String get bookingDetails;

  /// No description provided for @selectDate.
  ///
  /// In en, this message translates to:
  /// **'Select Date'**
  String get selectDate;

  /// No description provided for @howManyHours.
  ///
  /// In en, this message translates to:
  /// **'How Many Hours'**
  String get howManyHours;

  /// No description provided for @numberOfCleaners.
  ///
  /// In en, this message translates to:
  /// **'Number Of Cleaners'**
  String get numberOfCleaners;

  /// No description provided for @timeSlot.
  ///
  /// In en, this message translates to:
  /// **'Time Slot'**
  String get timeSlot;

  /// No description provided for @cleaningMaterials.
  ///
  /// In en, this message translates to:
  /// **'Cleaning Materials'**
  String get cleaningMaterials;

  /// No description provided for @chooseProducts.
  ///
  /// In en, this message translates to:
  /// **'Choose your preferred products'**
  String get chooseProducts;

  /// No description provided for @algerianProducts.
  ///
  /// In en, this message translates to:
  /// **'Algerian Products'**
  String get algerianProducts;

  /// No description provided for @importedFrance.
  ///
  /// In en, this message translates to:
  /// **'Imported (France)'**
  String get importedFrance;

  /// No description provided for @totalPrice.
  ///
  /// In en, this message translates to:
  /// **'Total Price'**
  String get totalPrice;

  /// No description provided for @pro.
  ///
  /// In en, this message translates to:
  /// **'Pro'**
  String get pro;

  /// No description provided for @hours.
  ///
  /// In en, this message translates to:
  /// **'Hours'**
  String get hours;

  /// No description provided for @urgentService.
  ///
  /// In en, this message translates to:
  /// **'Urgent Service'**
  String get urgentService;

  /// No description provided for @inProgress.
  ///
  /// In en, this message translates to:
  /// **'In Progress'**
  String get inProgress;

  /// No description provided for @scheduled.
  ///
  /// In en, this message translates to:
  /// **'Scheduled'**
  String get scheduled;

  /// No description provided for @history.
  ///
  /// In en, this message translates to:
  /// **'History'**
  String get history;

  /// No description provided for @myOrders.
  ///
  /// In en, this message translates to:
  /// **'My Orders'**
  String get myOrders;

  /// No description provided for @trackBookings.
  ///
  /// In en, this message translates to:
  /// **'Track and manage your bookings'**
  String get trackBookings;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @myProfile.
  ///
  /// In en, this message translates to:
  /// **'My Profile'**
  String get myProfile;

  /// No description provided for @personalInfo.
  ///
  /// In en, this message translates to:
  /// **'Personal information'**
  String get personalInfo;

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @alertsUpdates.
  ///
  /// In en, this message translates to:
  /// **'Alerts & updates'**
  String get alertsUpdates;

  /// No description provided for @payments.
  ///
  /// In en, this message translates to:
  /// **'Payments'**
  String get payments;

  /// No description provided for @cardsWallet.
  ///
  /// In en, this message translates to:
  /// **'Cards & wallet'**
  String get cardsWallet;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @languagePreferences.
  ///
  /// In en, this message translates to:
  /// **'Language Preferences'**
  String get languagePreferences;

  /// No description provided for @english.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @defaultLang.
  ///
  /// In en, this message translates to:
  /// **'Default language'**
  String get defaultLang;

  /// No description provided for @french.
  ///
  /// In en, this message translates to:
  /// **'French'**
  String get french;

  /// No description provided for @frenchNative.
  ///
  /// In en, this message translates to:
  /// **'Français'**
  String get frenchNative;

  /// No description provided for @arabic.
  ///
  /// In en, this message translates to:
  /// **'Arabic'**
  String get arabic;

  /// No description provided for @arabicNative.
  ///
  /// In en, this message translates to:
  /// **'العربية'**
  String get arabicNative;

  /// No description provided for @manageAddresses.
  ///
  /// In en, this message translates to:
  /// **'Manage Addresses'**
  String get manageAddresses;

  /// No description provided for @paymentMethods.
  ///
  /// In en, this message translates to:
  /// **'Payment Methods'**
  String get paymentMethods;

  /// No description provided for @appearance.
  ///
  /// In en, this message translates to:
  /// **'Appearance'**
  String get appearance;

  /// No description provided for @support.
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get support;

  /// No description provided for @helpCenter.
  ///
  /// In en, this message translates to:
  /// **'Help Center'**
  String get helpCenter;

  /// No description provided for @privacyPolicy.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get privacyPolicy;

  /// No description provided for @aboutNadhif.
  ///
  /// In en, this message translates to:
  /// **'About Nadhif'**
  String get aboutNadhif;

  /// No description provided for @logOut.
  ///
  /// In en, this message translates to:
  /// **'Log Out'**
  String get logOut;

  /// No description provided for @chooseLanguage.
  ///
  /// In en, this message translates to:
  /// **'Choose Language'**
  String get chooseLanguage;

  /// No description provided for @basePrice.
  ///
  /// In en, this message translates to:
  /// **'Base Price'**
  String get basePrice;

  /// No description provided for @professionals.
  ///
  /// In en, this message translates to:
  /// **'Professionals'**
  String get professionals;

  /// No description provided for @duration.
  ///
  /// In en, this message translates to:
  /// **'Duration'**
  String get duration;

  /// No description provided for @localMaterials.
  ///
  /// In en, this message translates to:
  /// **'Local Materials'**
  String get localMaterials;

  /// No description provided for @importedMaterials.
  ///
  /// In en, this message translates to:
  /// **'Imported Materials'**
  String get importedMaterials;

  /// No description provided for @reviews.
  ///
  /// In en, this message translates to:
  /// **'{rating} ({count} Reviews)'**
  String reviews(Object count, Object rating);

  /// No description provided for @baridiMobCCP.
  ///
  /// In en, this message translates to:
  /// **'Baridi Mob / CCP'**
  String get baridiMobCCP;

  /// No description provided for @enterYourCode.
  ///
  /// In en, this message translates to:
  /// **'Enter your code'**
  String get enterYourCode;

  /// No description provided for @tapYourCodeHere.
  ///
  /// In en, this message translates to:
  /// **'Tap your code here'**
  String get tapYourCodeHere;

  /// No description provided for @apply.
  ///
  /// In en, this message translates to:
  /// **'Apply'**
  String get apply;

  /// No description provided for @cleaningEquipment.
  ///
  /// In en, this message translates to:
  /// **'Cleaning Equipment'**
  String get cleaningEquipment;

  /// No description provided for @bringEquipment.
  ///
  /// In en, this message translates to:
  /// **'Bring vacuum, mop, and bucket'**
  String get bringEquipment;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
    case 'fr':
      return AppLocalizationsFr();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
