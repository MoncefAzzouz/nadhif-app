import type { Metadata } from 'next';
import LegalDoc, { type LegalDocContent } from '../components/legal/LegalDoc';
import { SITE_INFO, type LegalLang } from '../lib/site-info';

export const metadata: Metadata = {
  title: 'Delete your account — Nadif',
  description:
    'How to permanently delete your Nadif account and all associated data, either from inside the app or by written request, and what exactly is erased.',
  alternates: { canonical: `${SITE_INFO.siteUrl}/delete-account` },
};

const doc: Record<LegalLang, LegalDocContent> = {
  EN: {
    title: 'Delete your account',
    subtitle:
      'You can permanently delete your Nadif account and all the data attached to it, directly from the app or by written request. This page explains both routes and exactly what is erased.',
    intro: `This page concerns the ${SITE_INFO.appName} mobile application (Android package ${SITE_INFO.androidPackage}), published by ${SITE_INFO.legalName}. Deleting your account is free, does not require you to contact us first, and takes effect immediately.`,
    sections: [
      {
        heading: 'Delete from the app (immediate)',
        paragraphs: ['The fastest route. Your account is erased the moment you confirm — no waiting period, no manual review.'],
        steps: [
          'Open the Nadif app and make sure you are signed in.',
          'Go to the Profile tab (bottom navigation bar).',
          'Scroll to the bottom of the page, below the "Log out" button.',
          'Tap "Delete Account".',
          'Read the warning and confirm by tapping "Delete".',
          'You are signed out immediately and your account no longer exists.',
        ],
        callout: 'This action is irreversible. Once confirmed, your account, your orders and your subscriptions cannot be restored — you would have to create a new account from scratch.',
      },
      {
        heading: 'Request deletion by email',
        paragraphs: [
          `If you can no longer access the app or your account (lost phone, changed number, uninstalled app), send us a deletion request at ${SITE_INFO.supportEmail} with the subject "Account deletion".`,
          'To let us identify your account without asking for extra personal data, please send the request from the email address registered on your account, or include the mobile phone number used to sign up.',
          'We confirm the deletion by reply and complete it within 30 days at the latest — in practice within a few working days.',
        ],
        bullets: [
          `Email: ${SITE_INFO.supportEmail}`,
          `Phone: ${SITE_INFO.phoneDisplay}`,
          'Subject: Account deletion',
          'To include: full name, and the phone number or email address of the account',
        ],
      },
      {
        heading: 'What is deleted',
        paragraphs: ['Confirming the deletion permanently erases the following from our production database:'],
        bullets: [
          'Your account: name, mobile phone number, email address and password hash.',
          'Your entire order history: services booked, addresses, GPS coordinates, surfaces, notes, prices and statuses.',
          'The photos you uploaded with your orders or subscription requests.',
          'Your subscriptions, together with their scheduled sessions and the payment records attached to them.',
          'Your device notification tokens, so you stop receiving push notifications.',
        ],
      },
      {
        heading: 'What happens to backups',
        paragraphs: [
          'Our database backups are encrypted and rotated. Residual copies of deleted data can remain in those backups for up to 30 days, after which they are purged automatically. Backups are never used to restore a deleted account, only to recover from a technical incident.',
        ],
      },
      {
        heading: 'Before you delete — please check',
        bullets: [
          'Pending or confirmed orders: deleting your account cancels our ability to reach you about them. Complete or cancel any upcoming intervention first.',
          'Active subscription: contact us before deleting so we can close the plan properly. Sessions already performed remain due.',
          'Unpaid amounts: deletion does not cancel sums owed for services already carried out.',
          'Your history: once deleted, you can no longer consult your past orders or their prices. Note down anything you need beforehand.',
        ],
      },
      {
        heading: 'Deleting the app is not deleting your account',
        paragraphs: [
          'Uninstalling the Nadif app from your phone removes it from your device but leaves your account and data on our servers. Use one of the two routes above to have them erased.',
        ],
      },
      {
        heading: 'Questions',
        paragraphs: [
          `If anything is unclear, or if you want a confirmation that your data has been erased, write to ${SITE_INFO.privacyEmail} or call ${SITE_INFO.phoneDisplay}. Our full privacy policy is available at ${SITE_INFO.siteUrl}/privacy-policy.`,
        ],
      },
    ],
  },

  FR: {
    title: 'Supprimer votre compte',
    subtitle:
      "Vous pouvez supprimer définitivement votre compte Nadif et toutes les données qui y sont rattachées, directement depuis l'application ou sur demande écrite. Cette page détaille les deux méthodes et ce qui est exactement effacé.",
    intro: `Cette page concerne l'application mobile ${SITE_INFO.appName} (package Android ${SITE_INFO.androidPackage}), éditée par ${SITE_INFO.legalName}. La suppression du compte est gratuite, ne nécessite aucune démarche préalable auprès de nous et prend effet immédiatement.`,
    sections: [
      {
        heading: "Suppression depuis l'application (immédiate)",
        paragraphs: ["La méthode la plus rapide. Votre compte est effacé dès la confirmation : aucun délai d'attente, aucune validation manuelle."],
        steps: [
          "Ouvrez l'application Nadif et assurez-vous d'être connecté.",
          'Allez dans l\'onglet « Profil » (barre de navigation en bas).',
          'Faites défiler jusqu\'en bas de la page, sous le bouton « Déconnexion ».',
          'Appuyez sur « Supprimer le compte ».',
          'Lisez l\'avertissement puis confirmez en appuyant sur « Supprimer ».',
          'Vous êtes déconnecté immédiatement et votre compte n\'existe plus.',
        ],
        callout: "Cette action est irréversible. Une fois confirmée, votre compte, vos commandes et vos abonnements ne peuvent pas être restaurés : vous devriez créer un nouveau compte depuis le début.",
      },
      {
        heading: 'Demande de suppression par e-mail',
        paragraphs: [
          `Si vous n'avez plus accès à l'application ou à votre compte (téléphone perdu, numéro changé, application désinstallée), envoyez-nous une demande de suppression à ${SITE_INFO.supportEmail} avec pour objet « Suppression de compte ».`,
          "Afin que nous puissions identifier votre compte sans vous demander de données supplémentaires, envoyez la demande depuis l'adresse e-mail enregistrée sur votre compte, ou indiquez le numéro de téléphone mobile utilisé lors de l'inscription.",
          'Nous confirmons la suppression par retour de message et la réalisons dans un délai maximum de 30 jours — en pratique en quelques jours ouvrés.',
        ],
        bullets: [
          `E-mail : ${SITE_INFO.supportEmail}`,
          `Téléphone : ${SITE_INFO.phoneDisplay}`,
          'Objet : Suppression de compte',
          "À indiquer : nom complet, et le numéro de téléphone ou l'adresse e-mail du compte",
        ],
      },
      {
        heading: 'Ce qui est supprimé',
        paragraphs: ['La confirmation de la suppression efface définitivement les éléments suivants de notre base de production :'],
        bullets: [
          'Votre compte : nom, numéro de téléphone mobile, adresse e-mail et empreinte du mot de passe.',
          'La totalité de votre historique de commandes : services réservés, adresses, coordonnées GPS, surfaces, notes, prix et statuts.',
          "Les photos que vous avez téléchargées avec vos commandes ou vos demandes d'abonnement.",
          'Vos abonnements, ainsi que leurs séances planifiées et les paiements qui y sont rattachés.',
          'Les jetons de notification de vos appareils, afin que vous ne receviez plus de notifications push.',
        ],
      },
      {
        heading: 'Cas des sauvegardes',
        paragraphs: [
          "Nos sauvegardes de base de données sont chiffrées et renouvelées régulièrement. Des copies résiduelles des données supprimées peuvent y subsister pendant 30 jours au maximum, avant d'être purgées automatiquement. Les sauvegardes ne servent jamais à restaurer un compte supprimé, uniquement à répondre à un incident technique.",
        ],
      },
      {
        heading: 'Avant de supprimer — à vérifier',
        bullets: [
          "Commandes en attente ou confirmées : la suppression nous empêche de vous joindre à leur sujet. Terminez ou annulez d'abord toute intervention à venir.",
          "Abonnement actif : contactez-nous avant la suppression afin de clôturer correctement la formule. Les séances déjà réalisées restent dues.",
          "Sommes impayées : la suppression n'annule pas les montants dus pour des prestations déjà effectuées.",
          "Votre historique : après suppression, vous ne pouvez plus consulter vos anciennes commandes ni leurs prix. Notez au préalable ce dont vous avez besoin.",
        ],
      },
      {
        heading: "Désinstaller l'application ne supprime pas le compte",
        paragraphs: [
          "Désinstaller l'application Nadif la retire de votre téléphone mais laisse votre compte et vos données sur nos serveurs. Utilisez l'une des deux méthodes ci-dessus pour les faire effacer.",
        ],
      },
      {
        heading: 'Questions',
        paragraphs: [
          `Si un point reste flou, ou si vous souhaitez une confirmation de l'effacement de vos données, écrivez à ${SITE_INFO.privacyEmail} ou appelez le ${SITE_INFO.phoneDisplay}. Notre politique de confidentialité complète est disponible sur ${SITE_INFO.siteUrl}/privacy-policy.`,
        ],
      },
    ],
  },

  AR: {
    title: 'حذف حسابك',
    subtitle:
      'يمكنك حذف حسابك في نظيف وكل البيانات المرتبطة به حذفاً نهائياً، إما من داخل التطبيق أو بطلب مكتوب. توضح هذه الصفحة الطريقتين وما يُمحى بالتحديد.',
    intro: `تتعلق هذه الصفحة بتطبيق ${SITE_INFO.appName} للهواتف (حزمة أندرويد ${SITE_INFO.androidPackage})، الصادر عن ${SITE_INFO.legalName}. حذف الحساب مجاني ولا يتطلب التواصل معنا مسبقاً ويسري مفعوله فوراً.`,
    sections: [
      {
        heading: 'الحذف من داخل التطبيق (فوري)',
        paragraphs: ['الطريقة الأسرع. يُمحى حسابك لحظة التأكيد: بدون مدة انتظار وبدون مراجعة يدوية.'],
        steps: [
          'افتح تطبيق نظيف وتأكد من أنك مسجّل الدخول.',
          'انتقل إلى تبويب «الملف الشخصي» في شريط التنقل السفلي.',
          'انزل إلى أسفل الصفحة، تحت زر «تسجيل الخروج».',
          'اضغط على «حذف الحساب».',
          'اقرأ التحذير ثم أكّد بالضغط على «حذف».',
          'يتم تسجيل خروجك فوراً ولا يبقى لحسابك أي وجود.',
        ],
        callout: 'هذا الإجراء لا يمكن الرجوع عنه. بعد التأكيد لا يمكن استعادة حسابك ولا طلباتك ولا اشتراكاتك، وسيتعيّن عليك إنشاء حساب جديد من الصفر.',
      },
      {
        heading: 'طلب الحذف بالبريد الإلكتروني',
        paragraphs: [
          `إذا لم يعد بإمكانك الوصول إلى التطبيق أو إلى حسابك (فقدان الهاتف، تغيير الرقم، إلغاء تثبيت التطبيق)، أرسل إلينا طلب حذف على ${SITE_INFO.supportEmail} بعنوان «حذف الحساب».`,
          'ولكي نتعرّف على حسابك دون أن نطلب منك بيانات إضافية، أرسل الطلب من البريد الإلكتروني المسجّل في حسابك، أو اذكر رقم الهاتف المحمول الذي استخدمته عند التسجيل.',
          'نؤكد لك الحذف برسالة جواب، وننفّذه في مدة أقصاها 30 يوماً — وعملياً في غضون أيام عمل قليلة.',
        ],
        bullets: [
          `البريد الإلكتروني: ${SITE_INFO.supportEmail}`,
          `الهاتف: ${SITE_INFO.phoneDisplay}`,
          'العنوان: حذف الحساب',
          'ما يجب ذكره: الاسم الكامل، ورقم الهاتف أو البريد الإلكتروني الخاص بالحساب',
        ],
      },
      {
        heading: 'ما يتم حذفه',
        paragraphs: ['يؤدي تأكيد الحذف إلى محو ما يلي نهائياً من قاعدة بياناتنا التشغيلية:'],
        bullets: [
          'حسابك: الاسم، رقم الهاتف المحمول، البريد الإلكتروني، وبصمة كلمة المرور.',
          'كامل سجل طلباتك: الخدمات المحجوزة، العناوين، إحداثيات GPS، المساحات، الملاحظات، الأسعار والحالات.',
          'الصور التي رفعتها مع طلباتك أو مع طلبات الاشتراك.',
          'اشتراكاتك، مع جلساتها المبرمجة والمدفوعات المرتبطة بها.',
          'رموز الإشعارات الخاصة بأجهزتك، فلا تصلك بعدها أي إشعارات.',
        ],
      },
      {
        heading: 'النسخ الاحتياطية',
        paragraphs: [
          'نسخنا الاحتياطية لقاعدة البيانات مشفّرة ويتم تجديدها دورياً. وقد تبقى نسخ متبقية من البيانات المحذوفة فيها لمدة 30 يوماً كأقصى حد قبل إزالتها تلقائياً. ولا تُستخدم النسخ الاحتياطية أبداً لاستعادة حساب محذوف، بل فقط لمعالجة حادث تقني.',
        ],
      },
      {
        heading: 'قبل الحذف — تحقّق من',
        bullets: [
          'الطلبات المعلّقة أو المؤكدة: الحذف يمنعنا من التواصل معك بشأنها. أنجز أو ألغِ أي تدخل قادم أولاً.',
          'الاشتراك النشط: اتصل بنا قبل الحذف حتى نغلق الباقة بشكل سليم. وتبقى الجلسات المنفذة مستحقة.',
          'المبالغ غير المدفوعة: الحذف لا يُلغي المبالغ المستحقة عن خدمات أُنجزت فعلاً.',
          'سجلك: بعد الحذف لن تستطيع مراجعة طلباتك السابقة ولا أسعارها. سجّل ما تحتاجه قبل ذلك.',
        ],
      },
      {
        heading: 'إلغاء تثبيت التطبيق ليس حذفاً للحساب',
        paragraphs: [
          'إلغاء تثبيت تطبيق نظيف يزيله من هاتفك لكنه يترك حسابك وبياناتك على خدماتنا. استخدم إحدى الطريقتين أعلاه لمحوها.',
        ],
      },
      {
        heading: 'أسئلة',
        paragraphs: [
          `إن كان أي أمر غير واضح، أو أردت تأكيداً بمحو بياناتك، راسلنا على ${SITE_INFO.privacyEmail} أو اتصل على ${SITE_INFO.phoneDisplay}. وسياسة الخصوصية الكاملة متوفرة على ${SITE_INFO.siteUrl}/privacy-policy.`,
        ],
      },
    ],
  },
};

export default function DeleteAccountPage() {
  return <LegalDoc doc={doc} defaultLang="FR" tone="danger" />;
}
