// English / Arabic messages for the download request endpoint. The language comes from `?lang=`.
const MESSAGES = {
  en: {
    nameRequired: "Name is required",
    nameMin: "Name must be at least 4 characters",
    nameMax: "Name must be at most 100 characters",
    phoneRequired: "Phone number is required",
    phoneInvalid: "Enter a valid phone number (7-20 digits; + - ( ) and spaces allowed)",
    emailRequired: "Email is required",
    emailInvalid: "Enter a valid email address",
    companyMax: "Company name must be at most 100 characters",
    downloadRequired: "Select a file to request",
    downloadInvalid: "The selected file is not available",
    productInvalid: "The selected product is not available",
    created: "Thank you. We have received your request and will send you the file soon",
    validationFailed: "Please correct the highlighted fields",
  },
  ar: {
    nameRequired: "الاسم مطلوب",
    nameMin: "يجب أن يتكون الاسم من 4 أحرف على الأقل",
    nameMax: "يجب ألا يزيد الاسم عن 100 حرف",
    phoneRequired: "رقم الهاتف مطلوب",
    phoneInvalid: "أدخل رقم هاتف صحيحًا (من 7 إلى 20 رقمًا، ويُسمح بالرموز + - ( ) والمسافات)",
    emailRequired: "البريد الإلكتروني مطلوب",
    emailInvalid: "أدخل بريدًا إلكترونيًا صحيحًا",
    companyMax: "يجب ألا يزيد اسم الشركة عن 100 حرف",
    downloadRequired: "اختر ملفًا لطلبه",
    downloadInvalid: "الملف المحدد غير متاح",
    productInvalid: "المنتج المحدد غير متاح",
    created: "شكرًا لك. لقد استلمنا طلبك وسنرسل لك الملف قريبًا",
    validationFailed: "يرجى تصحيح الحقول المحددة",
  },
};

const getLang = (req) => (req?.query?.lang === "ar" ? "ar" : "en");

const message = (langOrReq, key) => {
  const lang = typeof langOrReq === "string" ? langOrReq : getLang(langOrReq);
  return MESSAGES[lang]?.[key] ?? MESSAGES.en[key];
};

module.exports = { getLang, message };
