// English / Arabic messages for the quote request endpoint. The language comes from `?lang=`.
const MESSAGES = {
  en: {
    nameRequired: "Name is required",
    nameMin: "Name must be at least 4 characters",
    nameMax: "Name must be at most 100 characters",
    emailRequired: "Email is required",
    emailInvalid: "Enter a valid email address",
    phoneRequired: "Phone number is required",
    phoneInvalid: "Enter a valid phone number (7-20 digits; + - ( ) and spaces allowed)",
    companyMax: "Company name must be at most 100 characters",
    messageMax: "Message must be at most 2000 characters",
    recaptchaRequired: "reCAPTCHA verification is required",
    itemsRequired: "Add at least one product before submitting",
    itemsMax: "Too many items in this quote request",
    itemProductTitleRequired: "Each item needs a product",
    itemQuantityInvalid: "Quantity must be between 1 and 999",
    created: "Thank you. We have received your quote request and will get back to you soon",
    validationFailed: "Please correct the highlighted fields",
    recaptchaFailed: "We couldn't verify your request. Please try again",
  },
  ar: {
    nameRequired: "الاسم مطلوب",
    nameMin: "يجب أن يتكون الاسم من 4 أحرف على الأقل",
    nameMax: "يجب ألا يزيد الاسم عن 100 حرف",
    emailRequired: "البريد الإلكتروني مطلوب",
    emailInvalid: "أدخل بريدًا إلكترونيًا صحيحًا",
    phoneRequired: "رقم الهاتف مطلوب",
    phoneInvalid: "أدخل رقم هاتف صحيحًا (من 7 إلى 20 رقمًا، ويُسمح بالرموز + - ( ) والمسافات)",
    companyMax: "يجب ألا يزيد اسم الشركة عن 100 حرف",
    messageMax: "يجب ألا تزيد الرسالة عن 2000 حرف",
    recaptchaRequired: "التحقق من reCAPTCHA مطلوب",
    itemsRequired: "أضف منتجًا واحدًا على الأقل قبل الإرسال",
    itemsMax: "عدد المنتجات في هذا الطلب كبير جدًا",
    itemProductTitleRequired: "كل عنصر يحتاج إلى منتج",
    itemQuantityInvalid: "يجب أن تكون الكمية بين 1 و 999",
    created: "شكرًا لك. لقد استلمنا طلب عرض السعر وسنتواصل معك قريبًا",
    validationFailed: "يرجى تصحيح الحقول المحددة",
    recaptchaFailed: "تعذّر التحقق من طلبك. يرجى المحاولة مرة أخرى",
  },
};

const getLang = (req) => (req?.query?.lang === "ar" ? "ar" : "en");

const message = (langOrReq, key) => {
  const lang = typeof langOrReq === "string" ? langOrReq : getLang(langOrReq);
  return MESSAGES[lang]?.[key] ?? MESSAGES.en[key];
};

module.exports = { getLang, message };
