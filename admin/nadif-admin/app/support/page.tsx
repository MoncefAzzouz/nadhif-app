import type { Metadata } from 'next';
import LegalDoc, { type LegalDocContent } from '../components/legal/LegalDoc';
import { SITE_INFO, type LegalLang } from '../lib/site-info';

export const metadata: Metadata = {
  title: 'Support & Contact — Nadif',
  description:
    'Contact the Nadif support team: email, phone, opening hours and address. Help with bookings, subscriptions, complaints, account and privacy requests.',
  alternates: { canonical: `${SITE_INFO.siteUrl}/support` },
};

const doc: Record<LegalLang, LegalDocContent> = {
  EN: {
    title: 'Support & Contact',
    subtitle:
      'A question about a booking, a subscription, an invoice or your account? Our team answers by email and by phone during opening hours.',
    intro: `${SITE_INFO.legalName} publishes the ${SITE_INFO.appName} mobile application (Android package ${SITE_INFO.androidPackage}) and operates the home cleaning and laundry service of the same name. The contact details on this page are the official support channels — we have no other.`,
    sections: [
      {
        heading: 'How to reach us',
        bullets: [
          `Email — ${SITE_INFO.supportEmail}. Best channel for anything that needs a written record: complaints, invoices, account and privacy requests. We reply within one working day.`,
          `Phone — ${SITE_INFO.phoneDisplay}. Best for urgent matters: an agent who has not arrived, an access problem, a booking to change today.`,
          `Opening hours — ${SITE_INFO.hours.EN}. Messages received outside these hours are handled the next working day.`,
          `Address — ${SITE_INFO.legalName}, ${SITE_INFO.address.EN}.`,
        ],
      },
      {
        heading: 'Help us answer faster',
        paragraphs: ['When you write to us, please include:'],
        bullets: [
          'The phone number registered on your Nadif account.',
          'The order or subscription concerned (date and service booked).',
          'A short description of the problem, and photos if it concerns the quality of an intervention.',
          'The version of the app and your phone model, if the problem is technical.',
        ],
      },
      {
        heading: 'Common requests',
        bullets: [
          'Change or cancel a booking — do it from the app, or call us if the intervention is scheduled within the next few hours.',
          'The agent has not arrived — call us; we will locate the agent and give you a firm time or reschedule at no cost.',
          'Quality complaint — write to us within 48 hours of the intervention with photos. Where founded, we redo the concerned part of the service.',
          'Damage during an intervention — report it within 48 hours with photos and proof of the value of the item.',
          'Promo code refused — check its validity dates; if it is still valid, send us the code and your order number.',
          'Subscription: change the days, pause or stop — contact us; the schedule is adjusted with our planning team.',
          'Update your name, phone or email — editable directly in the app, in the Profile tab.',
          'Cannot sign in — call us with the phone number used to sign up.',
        ],
      },
      {
        heading: 'Account and privacy requests',
        paragraphs: [
          `To access, correct or delete your personal data, write to ${SITE_INFO.privacyEmail} from the email address registered on your account, or call us. Requests are processed within 30 days.`,
          `You can also delete your account yourself, immediately, from the app — the full procedure is described at ${SITE_INFO.siteUrl}/delete-account. Our privacy policy is available at ${SITE_INFO.siteUrl}/privacy-policy and our terms at ${SITE_INFO.siteUrl}/terms.`,
        ],
      },
      {
        heading: 'Report a bug or a security issue',
        paragraphs: [
          `Technical problems with the app (crash, blank screen, notification not received) can be sent to ${SITE_INFO.supportEmail} — mention your phone model and the app version.`,
          'If you believe you have found a security flaw, please report it to us privately by email before disclosing it anywhere else. We will acknowledge your report and keep you informed of the fix.',
        ],
      },
      {
        heading: 'Working with us',
        paragraphs: [
          `Cleaning professionals who want to join our team, and businesses looking for a service agreement, can write to ${SITE_INFO.supportEmail} with "Partnership" in the subject line.`,
        ],
      },
    ],
  },

  FR: {
    title: 'Support & Contact',
    subtitle:
      "Une question sur une réservation, un abonnement, une facture ou votre compte ? Notre équipe répond par e-mail et par téléphone pendant les heures d'ouverture.",
    intro: `${SITE_INFO.legalName} édite l'application mobile ${SITE_INFO.appName} (package Android ${SITE_INFO.androidPackage}) et exploite le service de nettoyage à domicile et de pressing du même nom. Les coordonnées de cette page sont nos canaux de support officiels — nous n'en avons pas d'autres.`,
    sections: [
      {
        heading: 'Nous joindre',
        bullets: [
          `E-mail — ${SITE_INFO.supportEmail}. Le meilleur canal pour tout ce qui nécessite une trace écrite : réclamations, factures, demandes relatives au compte et aux données. Nous répondons sous un jour ouvré.`,
          `Téléphone — ${SITE_INFO.phoneDisplay}. À privilégier en cas d'urgence : agent non arrivé, problème d'accès, réservation à modifier le jour même.`,
          `Heures d'ouverture — ${SITE_INFO.hours.FR}. Les messages reçus en dehors de ces horaires sont traités le jour ouvré suivant.`,
          `Adresse — ${SITE_INFO.legalName}, ${SITE_INFO.address.FR}.`,
        ],
      },
      {
        heading: 'Aidez-nous à répondre plus vite',
        paragraphs: ['Lorsque vous nous écrivez, merci d\'indiquer :'],
        bullets: [
          'Le numéro de téléphone enregistré sur votre compte Nadif.',
          "La commande ou l'abonnement concerné (date et service réservé).",
          "Une description brève du problème, et des photos s'il porte sur la qualité d'une intervention.",
          "La version de l'application et le modèle de votre téléphone, si le problème est technique.",
        ],
      },
      {
        heading: 'Demandes fréquentes',
        bullets: [
          "Modifier ou annuler une réservation — faites-le depuis l'application, ou appelez-nous si l'intervention est prévue dans les heures qui suivent.",
          "L'agent n'est pas arrivé — appelez-nous : nous localisons l'agent et vous donnons une heure ferme ou reprogrammons sans frais.",
          "Réclamation qualité — écrivez-nous dans les 48 heures suivant l'intervention avec des photos. Si elle est fondée, nous refaisons la partie concernée de la prestation.",
          "Dommage pendant une intervention — signalez-le sous 48 heures avec des photos et un justificatif de la valeur de l'objet.",
          "Code promo refusé — vérifiez ses dates de validité ; s'il est encore valable, envoyez-nous le code et votre numéro de commande.",
          "Abonnement : changer les jours, mettre en pause ou arrêter — contactez-nous, le planning est ajusté avec notre équipe.",
          "Modifier votre nom, téléphone ou e-mail — modifiable directement dans l'application, onglet « Profil ».",
          "Impossible de se connecter — appelez-nous avec le numéro de téléphone utilisé à l'inscription.",
        ],
      },
      {
        heading: 'Demandes relatives au compte et aux données',
        paragraphs: [
          `Pour accéder à vos données personnelles, les rectifier ou les supprimer, écrivez à ${SITE_INFO.privacyEmail} depuis l'adresse e-mail enregistrée sur votre compte, ou appelez-nous. Les demandes sont traitées sous 30 jours.`,
          `Vous pouvez également supprimer vous-même votre compte, immédiatement, depuis l'application — la procédure complète est décrite sur ${SITE_INFO.siteUrl}/delete-account. Notre politique de confidentialité est disponible sur ${SITE_INFO.siteUrl}/privacy-policy et nos conditions générales sur ${SITE_INFO.siteUrl}/terms.`,
        ],
      },
      {
        heading: 'Signaler un bug ou une faille',
        paragraphs: [
          `Les problèmes techniques de l'application (plantage, écran blanc, notification non reçue) peuvent être envoyés à ${SITE_INFO.supportEmail} — précisez le modèle de votre téléphone et la version de l'application.`,
          "Si vous pensez avoir découvert une faille de sécurité, signalez-la nous en privé par e-mail avant toute divulgation ailleurs. Nous accuserons réception et vous tiendrons informé du correctif.",
        ],
      },
      {
        heading: 'Travailler avec nous',
        paragraphs: [
          `Les professionnels du nettoyage souhaitant rejoindre notre équipe, ainsi que les entreprises cherchant un contrat de prestation, peuvent écrire à ${SITE_INFO.supportEmail} en indiquant « Partenariat » en objet.`,
        ],
      },
    ],
  },

  AR: {
    title: 'الدعم والاتصال',
    subtitle:
      'هل لديك سؤال عن حجز أو اشتراك أو فاتورة أو حسابك؟ فريقنا يجيب بالبريد الإلكتروني وبالهاتف خلال ساعات العمل.',
    intro: `تُصدر ${SITE_INFO.legalName} تطبيق ${SITE_INFO.appName} للهواتف (حزمة أندرويد ${SITE_INFO.androidPackage}) وتُشغّل خدمة تنظيف المنازل والغسيل بالاسم نفسه. وبيانات الاتصال في هذه الصفحة هي قنوات الدعم الرسمية، وليس لدينا غيرها.`,
    sections: [
      {
        heading: 'كيف تتصل بنا',
        bullets: [
          `البريد الإلكتروني — ${SITE_INFO.supportEmail}. أفضل قناة لكل ما يحتاج إلى أثر مكتوب: الشكاوى، الفواتير، طلبات الحساب والبيانات. نرد في غضون يوم عمل واحد.`,
          `الهاتف — ${SITE_INFO.phoneDisplay}. الأفضل للحالات المستعجلة: عامل لم يصل، مشكلة في الوصول، حجز يجب تعديله اليوم.`,
          `ساعات العمل — ${SITE_INFO.hours.AR}. والرسائل الواردة خارج هذه الأوقات تُعالج في يوم العمل الموالي.`,
          `العنوان — ${SITE_INFO.legalName}، ${SITE_INFO.address.AR}.`,
        ],
      },
      {
        heading: 'ساعدنا على الرد أسرع',
        paragraphs: ['عند مراسلتنا، يُرجى ذكر:'],
        bullets: [
          'رقم الهاتف المسجّل في حسابك على نظيف.',
          'الطلب أو الاشتراك المعني (التاريخ والخدمة المحجوزة).',
          'وصف موجز للمشكلة، وصور إن كانت تتعلق بجودة تدخل.',
          'إصدار التطبيق وطراز هاتفك إذا كانت المشكلة تقنية.',
        ],
      },
      {
        heading: 'الطلبات الشائعة',
        bullets: [
          'تعديل حجز أو إلغاؤه — من التطبيق، أو اتصل بنا إذا كان التدخل مبرمجاً في الساعات القادمة.',
          'العامل لم يصل — اتصل بنا: نحدد موقع العامل ونعطيك وقتاً نهائياً أو نعيد البرمجة دون تكلفة.',
          'شكوى جودة — راسلنا في غضون 48 ساعة من التدخل مع صور. وإذا كانت مؤسسة نعيد تنفيذ الجزء المعني.',
          'ضرر أثناء التدخل — أبلغنا في غضون 48 ساعة مع صور وما يثبت قيمة الغرض.',
          'رمز خصم مرفوض — تحقق من تواريخ صلاحيته، وإن كان سارياً أرسل لنا الرمز ورقم طلبك.',
          'الاشتراك: تغيير الأيام أو التوقيف المؤقت أو الإنهاء — اتصل بنا ويُعدّل البرنامج مع فريق التخطيط.',
          'تعديل الاسم أو الهاتف أو البريد الإلكتروني — قابل للتعديل مباشرة في التطبيق، تبويب «الملف الشخصي».',
          'تعذّر تسجيل الدخول — اتصل بنا مع رقم الهاتف المستخدم عند التسجيل.',
        ],
      },
      {
        heading: 'طلبات الحساب والخصوصية',
        paragraphs: [
          `للوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها، راسل ${SITE_INFO.privacyEmail} من البريد الإلكتروني المسجّل في حسابك، أو اتصل بنا. وتُعالج الطلبات في غضون 30 يوماً.`,
          `كما يمكنك حذف حسابك بنفسك وفوراً من التطبيق — الإجراء الكامل موضّح على ${SITE_INFO.siteUrl}/delete-account. وسياسة الخصوصية متوفرة على ${SITE_INFO.siteUrl}/privacy-policy والشروط العامة على ${SITE_INFO.siteUrl}/terms.`,
        ],
      },
      {
        heading: 'الإبلاغ عن خلل أو ثغرة',
        paragraphs: [
          `يمكن إرسال المشاكل التقنية في التطبيق (توقف، شاشة بيضاء، إشعار لم يصل) إلى ${SITE_INFO.supportEmail} مع ذكر طراز هاتفك وإصدار التطبيق.`,
          'وإذا اعتقدت أنك وجدت ثغرة أمنية، فأبلغنا بها بشكل خاص بالبريد الإلكتروني قبل نشرها في أي مكان آخر. وسنُقر باستلام تقريرك ونُبقيك على علم بالإصلاح.',
        ],
      },
      {
        heading: 'العمل معنا',
        paragraphs: [
          `يمكن لمهنيي التنظيف الراغبين في الانضمام إلى فريقنا، وللشركات التي تبحث عن عقد خدمات، مراسلتنا على ${SITE_INFO.supportEmail} مع ذكر «شراكة» في العنوان.`,
        ],
      },
    ],
  },
};

export default function SupportPage() {
  return <LegalDoc doc={doc} defaultLang="FR" showContactCards />;
}
