import type { Metadata } from 'next';
import LegalDoc, { type LegalDocContent } from '../components/legal/LegalDoc';
import { SITE_INFO, type LegalLang } from '../lib/site-info';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Nadif',
  description:
    'The terms governing the use of the Nadif application and website: accounts, bookings, prices, payment, cancellation, subscriptions and liability.',
  alternates: { canonical: `${SITE_INFO.siteUrl}/terms` },
};

const doc: Record<LegalLang, LegalDocContent> = {
  EN: {
    title: 'Terms & Conditions',
    subtitle:
      'These terms form the agreement between you and Nadif when you create an account, book a service or use this website. By using the service you accept them.',
    intro: `The Nadif service is operated by ${SITE_INFO.legalName}, ${SITE_INFO.address.EN}. "Service" means the home cleaning, laundry, ironing and related services booked through the Nadif mobile application (Android package ${SITE_INFO.androidPackage}), through this website, or by phone with our team.`,
    sections: [
      {
        heading: 'Eligibility and your account',
        bullets: [
          'You must be at least 18 years old and legally capable of entering into a contract.',
          'You must provide accurate contact details — your name, a reachable mobile phone number and a valid address. Our agents cannot perform a service at an address we cannot find or reach.',
          'You are responsible for keeping your password confidential and for all activity carried out from your account.',
          'One account per person. We may suspend or close accounts used for abusive, fraudulent or repeated no-show bookings.',
        ],
      },
      {
        heading: 'Booking a service',
        bullets: [
          'A booking is a request. It becomes a confirmed appointment only once our team validates it and its status changes to "Confirmed" in the app.',
          'You choose the service or category, the surface or configuration, the date and the time slot, and optional extras: additional workers, cleaning materials, and local or imported products.',
          'The express option (Service Rapide) is priced separately and is subject to agent availability.',
          'Some dates may be unavailable because our schedule is full or because the day is closed. Unavailable days are not selectable in the app.',
          'You may be asked to add photos or notes to help us prepare the intervention correctly (surface, access, items to treat).',
        ],
      },
      {
        heading: 'Prices and payment',
        bullets: [
          'All prices are shown in Algerian dinars (DZD) in the app before you confirm a booking, and include the base service plus any extras you selected.',
          'The price displayed at booking is based on the information you provide. If the actual situation differs materially on site (much larger surface, condition requiring substantially more time, additional rooms), our team will inform you and agree a revised price with you before continuing, or the intervention may be rescheduled.',
          'Payment is due for each completed intervention according to the method indicated in the app or agreed with our team at booking.',
          'For subscription plans, the monthly amount and the payments received are recorded on your subscription. Sessions may be suspended if payments are overdue.',
        ],
      },
      {
        heading: 'Promo codes',
        bullets: [
          'Promo codes give a percentage discount and are valid only between their start and end dates, while they remain active.',
          'A code applies to a single order unless stated otherwise, cannot be combined with other codes, and has no cash value.',
          'We may deactivate a code that is being misused.',
        ],
      },
      {
        heading: 'Cancellation, rescheduling and no-show',
        bullets: [
          'You can cancel or ask to reschedule a booking from the app or by contacting us. Please do so as early as possible — at the latest a few hours before the scheduled slot — so we can reassign the agent.',
          'If nobody is present at the address at the scheduled time, or if the agent cannot access the premises, the intervention is considered a no-show and may be charged in whole or in part to cover the travel and the reserved slot.',
          'We may cancel or postpone an intervention for reasons of force majeure, safety, agent illness or exceptional conditions. In that case we offer a new slot at no extra cost.',
        ],
      },
      {
        heading: 'Subscriptions',
        bullets: [
          'A subscription request describes your property (type, surface, rooms), the chosen service tier and the number of visits per week.',
          'Our team proposes the session days based on agent availability; the schedule becomes firm once confirmed.',
          'A missed session that was not cancelled in advance is counted as used.',
          'You can stop a subscription by contacting us. Sessions already performed remain due.',
        ],
      },
      {
        heading: 'Your obligations during the intervention',
        bullets: [
          'Provide safe access to the premises and to water and electricity where the service requires them.',
          'Put away cash, jewellery, valuables, fragile items and sensitive documents before the agent arrives.',
          'Secure pets, and inform us of any hazard, fragile surface or item requiring particular care.',
          'Treat our agents with respect. Any harassment, threat or discriminatory behaviour terminates the intervention immediately and may lead to closure of your account.',
        ],
      },
      {
        heading: 'Quality, claims and liability',
        bullets: [
          'If the result does not match what was booked, contact us within 48 hours of the intervention with your order number and photos. Where the claim is founded, we will redo the concerned part of the service or make a fair commercial gesture.',
          'We are liable for damage directly and demonstrably caused by our agents during the intervention, up to the value of the damaged item and subject to proof, reported within 48 hours.',
          'We are not liable for pre-existing wear or defects, for damage to items whose specific fragility was not disclosed to us, for colour or texture changes inherent in the treatment of a delicate material, or for indirect losses.',
          'We are not liable for interruptions caused by force majeure, network or third-party service failures.',
        ],
      },
      {
        heading: 'Use of the app and website',
        bullets: [
          'You agree not to disrupt the service, attempt to access accounts or data that are not yours, reverse engineer the application, or use automated means to place bookings.',
          'The Nadif name, logo, interface, texts and images are our property or used under licence and may not be reproduced without our written consent.',
        ],
      },
      {
        heading: 'Personal data',
        paragraphs: [
          `The processing of your personal data is described in our Privacy Policy: ${SITE_INFO.siteUrl}/privacy-policy. You can delete your account and your data at any time: ${SITE_INFO.siteUrl}/delete-account.`,
        ],
      },
      {
        heading: 'Suspension and termination',
        paragraphs: [
          'You may stop using the service and delete your account at any time. We may suspend or terminate access in case of a serious or repeated breach of these terms, of non-payment, or of behaviour endangering our agents. Amounts due for services already performed remain payable.',
        ],
      },
      {
        heading: 'Changes to these terms',
        paragraphs: [
          'We may amend these terms to reflect changes to the service or to the law. The date at the top of this page indicates the current version. Continuing to use the service after a change means you accept the updated terms.',
        ],
      },
      {
        heading: 'Governing law and contact',
        paragraphs: [
          'These terms are governed by Algerian law. Any dispute will first be addressed amicably with our support team; failing agreement, it falls under the jurisdiction of the competent Algerian courts.',
          `Contact: ${SITE_INFO.supportEmail} — ${SITE_INFO.phoneDisplay} — ${SITE_INFO.legalName}, ${SITE_INFO.address.EN}.`,
        ],
      },
    ],
  },

  FR: {
    title: 'Conditions générales',
    subtitle:
      "Ces conditions constituent le contrat entre vous et Nadif lorsque vous créez un compte, réservez une prestation ou utilisez ce site. En utilisant le service, vous les acceptez.",
    intro: `Le service Nadif est exploité par ${SITE_INFO.legalName}, ${SITE_INFO.address.FR}. Le « Service » désigne les prestations de nettoyage à domicile, de pressing, de repassage et les services associés réservés via l'application mobile Nadif (package Android ${SITE_INFO.androidPackage}), via ce site web, ou par téléphone auprès de notre équipe.`,
    sections: [
      {
        heading: 'Conditions d’accès et compte',
        bullets: [
          "Vous devez avoir au moins 18 ans et la capacité juridique de contracter.",
          "Vous devez fournir des coordonnées exactes : votre nom, un numéro de téléphone joignable et une adresse valide. Nos agents ne peuvent pas intervenir à une adresse introuvable ou inaccessible.",
          "Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité effectuée depuis votre compte.",
          "Un seul compte par personne. Nous pouvons suspendre ou fermer les comptes utilisés pour des réservations abusives, frauduleuses ou répétées sans présence sur place.",
        ],
      },
      {
        heading: 'Réservation d’une prestation',
        bullets: [
          "Une réservation est une demande. Elle ne devient un rendez-vous ferme qu'après validation par notre équipe et passage du statut à « Confirmée » dans l'application.",
          "Vous choisissez le service ou la catégorie, la surface ou la configuration, la date et le créneau, ainsi que les options : agents supplémentaires, matériel de nettoyage, produits locaux ou importés.",
          "L'option express (Service Rapide) est tarifée séparément et reste soumise à la disponibilité des agents.",
          "Certaines dates peuvent être indisponibles lorsque le planning est complet ou que la journée est fermée. Les jours indisponibles ne sont pas sélectionnables dans l'application.",
          "Il peut vous être demandé d'ajouter des photos ou des notes afin de préparer correctement l'intervention (surface, accès, articles à traiter).",
        ],
      },
      {
        heading: 'Prix et paiement',
        bullets: [
          "Tous les prix sont affichés en dinars algériens (DZD) dans l'application avant la confirmation de la réservation et comprennent la prestation de base ainsi que les options retenues.",
          "Le prix affiché à la réservation repose sur les informations que vous fournissez. Si la situation réelle diffère sensiblement sur place (surface bien supérieure, état nécessitant beaucoup plus de temps, pièces supplémentaires), notre équipe vous en informe et convient d'un prix révisé avec vous avant de poursuivre, ou l'intervention peut être reprogrammée.",
          "Le paiement est dû pour chaque intervention réalisée, selon le mode indiqué dans l'application ou convenu avec notre équipe lors de la réservation.",
          "Pour les abonnements, le montant mensuel et les paiements reçus sont enregistrés sur votre abonnement. Les séances peuvent être suspendues en cas de retard de paiement.",
        ],
      },
      {
        heading: 'Codes promo',
        bullets: [
          "Les codes promo accordent une remise en pourcentage et ne sont valables qu'entre leur date de début et leur date de fin, tant qu'ils restent actifs.",
          "Sauf mention contraire, un code s'applique à une seule commande, n'est pas cumulable avec un autre code et n'a aucune valeur monétaire.",
          "Nous pouvons désactiver un code faisant l'objet d'un usage abusif.",
        ],
      },
      {
        heading: 'Annulation, report et absence',
        bullets: [
          "Vous pouvez annuler ou demander le report d'une réservation depuis l'application ou en nous contactant. Faites-le le plus tôt possible — au plus tard quelques heures avant le créneau — afin que nous puissions réaffecter l'agent.",
          "Si personne n'est présent à l'adresse à l'heure prévue, ou si l'agent ne peut accéder aux lieux, l'intervention est considérée comme non honorée et peut être facturée en tout ou partie pour couvrir le déplacement et le créneau réservé.",
          "Nous pouvons annuler ou reporter une intervention pour des motifs de force majeure, de sécurité, de maladie de l'agent ou de conditions exceptionnelles. Dans ce cas, un nouveau créneau vous est proposé sans frais supplémentaires.",
        ],
      },
      {
        heading: 'Abonnements',
        bullets: [
          "Une demande d'abonnement décrit votre bien (type, surface, pièces), la formule choisie et le nombre de passages par semaine.",
          "Notre équipe propose les jours de séance en fonction de la disponibilité des agents ; le planning devient ferme après confirmation.",
          "Une séance manquée qui n'a pas été annulée à l'avance est comptée comme consommée.",
          "Vous pouvez mettre fin à un abonnement en nous contactant. Les séances déjà réalisées restent dues.",
        ],
      },
      {
        heading: 'Vos obligations pendant l’intervention',
        bullets: [
          "Assurer un accès sûr aux lieux ainsi qu'à l'eau et à l'électricité lorsque la prestation les nécessite.",
          "Ranger l'argent liquide, les bijoux, les objets de valeur, les objets fragiles et les documents sensibles avant l'arrivée de l'agent.",
          "Sécuriser les animaux domestiques et nous signaler tout danger, surface fragile ou article nécessitant un soin particulier.",
          "Traiter nos agents avec respect. Tout harcèlement, menace ou comportement discriminatoire met immédiatement fin à l'intervention et peut entraîner la fermeture de votre compte.",
        ],
      },
      {
        heading: 'Qualité, réclamations et responsabilité',
        bullets: [
          "Si le résultat ne correspond pas à la prestation réservée, contactez-nous dans les 48 heures suivant l'intervention avec votre numéro de commande et des photos. Si la réclamation est fondée, nous refaisons la partie concernée de la prestation ou proposons un geste commercial équitable.",
          "Nous répondons des dommages directement et manifestement causés par nos agents pendant l'intervention, à hauteur de la valeur de l'objet endommagé, sur justificatif et à condition d'un signalement sous 48 heures.",
          "Nous ne répondons pas de l'usure ou des défauts préexistants, des dommages sur des articles dont la fragilité particulière ne nous a pas été signalée, des variations de couleur ou de texture inhérentes au traitement d'une matière délicate, ni des préjudices indirects.",
          "Nous ne sommes pas responsables des interruptions dues à un cas de force majeure, à une panne réseau ou à la défaillance d'un service tiers.",
        ],
      },
      {
        heading: 'Utilisation de l’application et du site',
        bullets: [
          "Vous vous engagez à ne pas perturber le service, à ne pas tenter d'accéder à des comptes ou données qui ne sont pas les vôtres, à ne pas décompiler l'application et à ne pas utiliser de moyens automatisés pour passer des réservations.",
          "Le nom Nadif, le logo, l'interface, les textes et les images sont notre propriété ou utilisés sous licence et ne peuvent être reproduits sans notre accord écrit.",
        ],
      },
      {
        heading: 'Données personnelles',
        paragraphs: [
          `Le traitement de vos données personnelles est décrit dans notre politique de confidentialité : ${SITE_INFO.siteUrl}/privacy-policy. Vous pouvez supprimer votre compte et vos données à tout moment : ${SITE_INFO.siteUrl}/delete-account.`,
        ],
      },
      {
        heading: 'Suspension et résiliation',
        paragraphs: [
          "Vous pouvez cesser d'utiliser le service et supprimer votre compte à tout moment. Nous pouvons suspendre ou résilier l'accès en cas de manquement grave ou répété à ces conditions, de défaut de paiement, ou de comportement mettant en danger nos agents. Les sommes dues pour les prestations déjà réalisées restent exigibles.",
        ],
      },
      {
        heading: 'Modification des conditions',
        paragraphs: [
          "Nous pouvons modifier ces conditions pour refléter des évolutions du service ou de la réglementation. La date en haut de cette page indique la version en vigueur. Continuer à utiliser le service après une modification vaut acceptation des nouvelles conditions.",
        ],
      },
      {
        heading: 'Droit applicable et contact',
        paragraphs: [
          "Ces conditions sont régies par le droit algérien. Tout litige sera d'abord traité à l'amiable avec notre équipe de support ; à défaut d'accord, il relève de la compétence des juridictions algériennes.",
          `Contact : ${SITE_INFO.supportEmail} — ${SITE_INFO.phoneDisplay} — ${SITE_INFO.legalName}, ${SITE_INFO.address.FR}.`,
        ],
      },
    ],
  },

  AR: {
    title: 'الشروط والأحكام',
    subtitle:
      'تشكّل هذه الشروط الاتفاق بينك وبين نظيف عند إنشاء حساب أو حجز خدمة أو استخدام هذا الموقع. وباستخدامك للخدمة فإنك تقبلها.',
    intro: `تُشغّل خدمة نظيف شركة ${SITE_INFO.legalName}، ${SITE_INFO.address.AR}. ويقصد بـ«الخدمة» أعمال تنظيف المنازل والغسيل والكي والخدمات المرتبطة بها التي تُحجز عبر تطبيق نظيف (حزمة أندرويد ${SITE_INFO.androidPackage}) أو عبر هذا الموقع أو هاتفياً مع فريقنا.`,
    sections: [
      {
        heading: 'شروط الاستخدام والحساب',
        bullets: [
          'يجب أن يكون عمرك 18 سنة على الأقل وأن تتمتع بالأهلية القانونية للتعاقد.',
          'يجب تقديم بيانات اتصال صحيحة: اسمك ورقم هاتف يمكن الوصول إليه وعنوان صحيح. لا يستطيع عمالنا التنقل إلى عنوان غير موجود أو لا يمكن الوصول إليه.',
          'أنت مسؤول عن سرية كلمة المرور وعن جميع العمليات التي تجري من حسابك.',
          'حساب واحد لكل شخص. ويحق لنا تعليق أو إغلاق الحسابات المستخدمة في حجوزات مسيئة أو وهمية أو متكررة دون التواجد في الموعد.',
        ],
      },
      {
        heading: 'حجز الخدمة',
        bullets: [
          'الحجز هو طلب. ولا يصبح موعداً مؤكداً إلا بعد مصادقة فريقنا وتحوّل حالته إلى «مؤكد» في التطبيق.',
          'أنت تختار الخدمة أو الفئة والمساحة أو التركيبة والتاريخ والفترة الزمنية، إضافة إلى الخيارات: عمال إضافيون، مواد التنظيف، منتجات محلية أو مستوردة.',
          'خيار الخدمة السريعة يُسعَّر بشكل منفصل ويبقى مرهوناً بتوفر العمال.',
          'قد تكون بعض التواريخ غير متاحة لاكتمال البرنامج أو لكون اليوم مغلقاً، والأيام غير المتاحة لا يمكن اختيارها في التطبيق.',
          'قد يُطلب منك إضافة صور أو ملاحظات لتحضير التدخل على الوجه الصحيح (المساحة، الوصول، الأغراض المطلوب معالجتها).',
        ],
      },
      {
        heading: 'الأسعار والدفع',
        bullets: [
          'تُعرض جميع الأسعار بالدينار الجزائري (DZD) في التطبيق قبل تأكيد الحجز، وتشمل الخدمة الأساسية والخيارات التي حددتها.',
          'يستند السعر المعروض عند الحجز إلى المعلومات التي تقدمها. وإذا اختلف الوضع الفعلي على أرض الواقع اختلافاً جوهرياً (مساحة أكبر بكثير، حالة تتطلب وقتاً أطول بكثير، غرف إضافية)، يخبرك فريقنا ويتفق معك على سعر معدّل قبل المتابعة، أو يُعاد برمجة التدخل.',
          'الدفع مستحق عن كل تدخل منجز، وفق الطريقة المبينة في التطبيق أو المتفق عليها مع فريقنا عند الحجز.',
          'في الاشتراكات، يُسجَّل المبلغ الشهري والمدفوعات المستلمة على اشتراكك، وقد تُوقف الجلسات في حال تأخر الدفع.',
        ],
      },
      {
        heading: 'رموز الخصم',
        bullets: [
          'تمنح رموز الخصم نسبة تخفيض ولا تصلح إلا بين تاريخ بدايتها وتاريخ نهايتها وطالما بقيت نشطة.',
          'يُطبَّق الرمز على طلب واحد ما لم يُذكر خلاف ذلك، ولا يُجمع مع رمز آخر، وليست له قيمة نقدية.',
          'يحق لنا تعطيل أي رمز يُستغل بشكل غير سليم.',
        ],
      },
      {
        heading: 'الإلغاء والتأجيل وعدم الحضور',
        bullets: [
          'يمكنك إلغاء الحجز أو طلب تأجيله من التطبيق أو بالاتصال بنا. ويُرجى القيام بذلك في أقرب وقت — وعلى الأكثر بساعات قبل الموعد — حتى نتمكن من إعادة توزيع العامل.',
          'إذا لم يكن أحد موجوداً في العنوان في الوقت المحدد، أو لم يستطع العامل الدخول إلى المكان، يُعدّ التدخل غير مُنفَّذ بسببك ويمكن تحصيل كامل المبلغ أو جزء منه لتغطية التنقل والموعد المحجوز.',
          'يحق لنا إلغاء أو تأجيل تدخل لأسباب قوة قاهرة أو أمنية أو لمرض العامل أو لظروف استثنائية، ونقترح عليك في هذه الحالة موعداً جديداً دون أي تكلفة إضافية.',
        ],
      },
      {
        heading: 'الاشتراكات',
        bullets: [
          'يصف طلب الاشتراك عقارك (النوع، المساحة، الغرف) والباقة المختارة وعدد الزيارات في الأسبوع.',
          'يقترح فريقنا أيام الجلسات حسب توفر العمال، ويصبح البرنامج نهائياً بعد التأكيد.',
          'الجلسة الفائتة التي لم تُلغَ مسبقاً تُحسب كجلسة مستهلكة.',
          'يمكنك إنهاء الاشتراك بالاتصال بنا، وتبقى الجلسات المنفذة مستحقة الدفع.',
        ],
      },
      {
        heading: 'التزاماتك أثناء التدخل',
        bullets: [
          'توفير وصول آمن إلى المكان وإلى الماء والكهرباء عندما تتطلبهما الخدمة.',
          'حفظ النقود والحلي والأشياء الثمينة والأغراض القابلة للكسر والوثائق الحساسة قبل وصول العامل.',
          'تأمين الحيوانات المنزلية وإبلاغنا بأي خطر أو سطح هش أو غرض يتطلب عناية خاصة.',
          'التعامل باحترام مع عمالنا. وأي مضايقة أو تهديد أو سلوك تمييزي ينهي التدخل فوراً وقد يؤدي إلى إغلاق حسابك.',
        ],
      },
      {
        heading: 'الجودة والشكاوى والمسؤولية',
        bullets: [
          'إذا لم تطابق النتيجة الخدمة المحجوزة، اتصل بنا في غضون 48 ساعة من التدخل مع رقم طلبك وصور. وإذا كانت الشكوى مؤسسة، نعيد تنفيذ الجزء المعني من الخدمة أو نقدم تسوية تجارية منصفة.',
          'نتحمل مسؤولية الأضرار الناتجة مباشرة وبشكل ثابت عن عمالنا أثناء التدخل، في حدود قيمة الغرض المتضرر، بناءً على إثبات وبشرط الإبلاغ في غضون 48 ساعة.',
          'لا نتحمل مسؤولية التلف أو العيوب السابقة للتدخل، ولا الأضرار التي تصيب أغراضاً لم يُبلَّغ عن هشاشتها الخاصة، ولا تغيّرات اللون أو الملمس الملازمة لمعالجة مادة حسّاسة، ولا الأضرار غير المباشرة.',
          'لا نتحمل مسؤولية الانقطاعات الناتجة عن قوة قاهرة أو خلل في الشبكة أو تعطل خدمة تابعة لجهة خارجية.',
        ],
      },
      {
        heading: 'استخدام التطبيق والموقع',
        bullets: [
          'تتعهد بعدم تعطيل الخدمة، وعدم محاولة الوصول إلى حسابات أو بيانات لا تخصك، وعدم الهندسة العكسية للتطبيق، وعدم استخدام وسائل آلية لإجراء الحجوزات.',
          'اسم نظيف وشعاره وواجهته ونصوصه وصوره ملك لنا أو مستخدمة بترخيص، ولا يجوز نسخها دون موافقتنا الكتابية.',
        ],
      },
      {
        heading: 'البيانات الشخصية',
        paragraphs: [
          `تُوضَّح معالجة بياناتك الشخصية في سياسة الخصوصية: ${SITE_INFO.siteUrl}/privacy-policy. ويمكنك حذف حسابك وبياناتك في أي وقت: ${SITE_INFO.siteUrl}/delete-account.`,
        ],
      },
      {
        heading: 'التعليق والإنهاء',
        paragraphs: [
          'يمكنك التوقف عن استخدام الخدمة وحذف حسابك في أي وقت. ويحق لنا تعليق الوصول أو إنهاؤه في حال الإخلال الجسيم أو المتكرر بهذه الشروط، أو عدم الدفع، أو أي سلوك يعرّض عمالنا للخطر. وتبقى المبالغ المستحقة عن الخدمات المنجزة واجبة الدفع.',
        ],
      },
      {
        heading: 'تعديل الشروط',
        paragraphs: [
          'يحق لنا تعديل هذه الشروط لتعكس تغييرات في الخدمة أو في القانون. ويشير التاريخ في أعلى الصفحة إلى النسخة السارية. ويُعدّ استمرارك في استخدام الخدمة بعد التعديل قبولاً للشروط الجديدة.',
        ],
      },
      {
        heading: 'القانون المطبق والاتصال',
        paragraphs: [
          'تخضع هذه الشروط للقانون الجزائري. وتُعالج أي منازعة أولاً بالتسوية الودية مع فريق الدعم، وفي حال عدم الاتفاق تختص بها الجهات القضائية الجزائرية.',
          `للاتصال: ${SITE_INFO.supportEmail} — ${SITE_INFO.phoneDisplay} — ${SITE_INFO.legalName}، ${SITE_INFO.address.AR}.`,
        ],
      },
    ],
  },
};

export default function TermsPage() {
  return <LegalDoc doc={doc} defaultLang="FR" />;
}
