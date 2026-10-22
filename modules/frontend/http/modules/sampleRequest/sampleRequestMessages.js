// English / Arabic messages for the sample request endpoint. The language comes from `?lang=`.
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
    categoryRequired: "Select a product category",
    categoryInvalid: "The selected category is not available",
    productRequired: "Select a product",
    productInvalid: "The selected product is not available in this category",
    created: "Thank you. We have received your sample request and will get back to you soon",
    validationFailed: "Please correct the highlighted fields",
    recaptchaRequired: "reCAPTCHA verification is required",
    recaptchaFailed: "We couldn't verify your request. Please try again",
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
    categoryRequired: "اختر فئة المنتج",
    categoryInvalid: "الفئة المحددة غير متاحة",
    productRequired: "اختر منتجًا",
    productInvalid: "المنتج المحدد غير متاح في هذه الفئة",
    created: "شكرًا لك. لقد استلمنا طلب العينة وسنتواصل معك قريبًا",
    validationFailed: "يرجى تصحيح الحقول المحددة",
    recaptchaRequired: "التحقق من reCAPTCHA مطلوب",
    recaptchaFailed: "تعذّر التحقق من طلبك. يرجى المحاولة مرة أخرى",
  },
};

const getLang = (req) => (req?.query?.lang === "ar" ? "ar" : "en");

const message = (langOrReq, key) => {
  const lang = typeof langOrReq === "string" ? langOrReq : getLang(langOrReq);
  return MESSAGES[lang]?.[key] ?? MESSAGES.en[key];
};

module.exports = { getLang, message };
