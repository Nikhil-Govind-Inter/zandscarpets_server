// English / Arabic messages for the contact enquiry endpoint. The language comes from `?lang=`
// (the query string is available even for multipart bodies, which are parsed after multer runs).
const MESSAGES = {
  en: {
    nameRequired: "Name is required",
    nameMin: "Name must be at least 4 characters",
    nameMax: "Name must be at most 100 characters",
    emailRequired: "Email is required",
    emailInvalid: "Enter a valid email address",
    phoneRequired: "Phone number is required",
    phoneInvalid: "Enter a valid phone number (7-20 digits; + - ( ) and spaces allowed)",
    requirementsRequired: "Requirements are required",
    requirementsMax: "Requirements must be at most 2000 characters",
    fileTooLarge: "The file is too large. The maximum size is 5MB",
    fileInvalid: "Only PDF, DOC or DOCX files are allowed",
    alreadySubmitted: "We have already received an enquiry from this email. Our team will get back to you soon",
    created: "Thank you for contacting us. We will get back to you as soon as possible",
    validationFailed: "Please correct the highlighted fields",
    recaptchaRequired: "reCAPTCHA verification is required",
    recaptchaFailed: "We couldn't verify your request. Please try again",
    uploadFailed: "The file could not be uploaded",
  },
  ar: {
    nameRequired: "الاسم مطلوب",
    nameMin: "يجب أن يتكون الاسم من 4 أحرف على الأقل",
    nameMax: "يجب ألا يزيد الاسم عن 100 حرف",
    emailRequired: "البريد الإلكتروني مطلوب",
    emailInvalid: "أدخل بريدًا إلكترونيًا صحيحًا",
    phoneRequired: "رقم الهاتف مطلوب",
    phoneInvalid: "أدخل رقم هاتف صحيحًا (من 7 إلى 20 رقمًا، ويُسمح بالرموز + - ( ) والمسافات)",
    requirementsRequired: "المتطلبات مطلوبة",
    requirementsMax: "يجب ألا تزيد المتطلبات عن 2000 حرف",
    fileTooLarge: "حجم الملف كبير جدًا. الحد الأقصى 5 ميجابايت",
    fileInvalid: "يُسمح فقط بملفات PDF أو DOC أو DOCX",
    alreadySubmitted: "لقد استلمنا استفسارًا سابقًا من هذا البريد الإلكتروني. سيتواصل معك فريقنا قريبًا",
    created: "شكرًا لتواصلك معنا. سنعاود التواصل معك في أقرب وقت ممكن",
    validationFailed: "يرجى تصحيح الحقول المحددة",
    recaptchaRequired: "التحقق من reCAPTCHA مطلوب",
    recaptchaFailed: "تعذّر التحقق من طلبك. يرجى المحاولة مرة أخرى",
    uploadFailed: "تعذّر رفع الملف",
  },
};

const getLang = (req) => (req?.query?.lang === "ar" ? "ar" : "en");

// message by language code or by request
const message = (langOrReq, key) => {
  const lang = typeof langOrReq === "string" ? langOrReq : getLang(langOrReq);
  return MESSAGES[lang]?.[key] ?? MESSAGES.en[key];
};

module.exports = { getLang, message };
