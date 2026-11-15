import type { Locale } from "./config";

// "My account" page + the initial-password warning (all three languages).
export type AdminAccountText = {
  nav: string;
  title: string;
  intro: string;
  warning: string;
  warningCta: string;
  usernameTitle: string;
  usernameHelp: string;
  username: string;
  passwordTitle: string;
  passwordHelp: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  saveUsername: string;
  savePassword: string;
  saving: string;
  savedUsername: string;
  savedPassword: string;
  settingsCard: string;
  settingsCardHelp: string;
  errors: Record<"invalid" | "wrongPassword" | "taken" | "rate" | "mismatch" | "same" | "failed", string>;
  login: { identifier: string; rate: string };
};

export const adminAccountText: Record<Locale, AdminAccountText> = {
  ar: {
    nav: "حسابي",
    title: "حسابي",
    intro: "غيّر اسم المستخدم وكلمة المرور الخاصين بدخولك إلى لوحة التحكم.",
    warning: "أنت تستعمل كلمة المرور الأولية. غيّرها الآن لحماية متجرك.",
    warningCta: "تغيير كلمة المرور",
    usernameTitle: "اسم المستخدم",
    usernameHelp: "من 3 إلى 32 حرفًا: أحرف لاتينية صغيرة، أرقام، نقطة، شرطة أو شرطة سفلية.",
    username: "اسم المستخدم الجديد",
    passwordTitle: "كلمة المرور",
    passwordHelp: "8 أحرف على الأقل. استعمل كلمة مرور قوية لا تستعملها في مكان آخر.",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    saveUsername: "حفظ اسم المستخدم",
    savePassword: "تغيير كلمة المرور",
    saving: "جارٍ الحفظ…",
    savedUsername: "تم تغيير اسم المستخدم.",
    savedPassword: "تم تغيير كلمة المرور.",
    settingsCard: "اسم المستخدم وكلمة المرور",
    settingsCardHelp: "غيّر بيانات دخولك إلى لوحة التحكم من صفحة «حسابي».",
    errors: {
      invalid: "تحقّق من القيم المُدخلة.",
      wrongPassword: "كلمة المرور الحالية غير صحيحة.",
      taken: "اسم المستخدم هذا مستعمل.",
      rate: "محاولات كثيرة. أعد المحاولة بعد قليل.",
      mismatch: "كلمتا المرور غير متطابقتين.",
      same: "كلمة المرور الجديدة مطابقة للحالية.",
      failed: "تعذّر الحفظ. أعد المحاولة.",
    },
    login: { identifier: "اسم المستخدم أو البريد الإلكتروني", rate: "محاولات كثيرة. أعد المحاولة بعد 15 دقيقة." },
  },
  fr: {
    nav: "Mon compte",
    title: "Mon compte",
    intro: "Modifiez le nom d'utilisateur et le mot de passe de votre accès à l'administration.",
    warning: "Vous utilisez le mot de passe initial. Changez-le maintenant pour protéger votre boutique.",
    warningCta: "Changer le mot de passe",
    usernameTitle: "Nom d'utilisateur",
    usernameHelp: "3 à 32 caractères : lettres minuscules, chiffres, point, tiret ou tiret bas.",
    username: "Nouveau nom d'utilisateur",
    passwordTitle: "Mot de passe",
    passwordHelp: "8 caractères minimum. Utilisez un mot de passe solide que vous n'utilisez nulle part ailleurs.",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le nouveau mot de passe",
    saveUsername: "Enregistrer le nom d'utilisateur",
    savePassword: "Changer le mot de passe",
    saving: "Enregistrement…",
    savedUsername: "Nom d'utilisateur modifié.",
    savedPassword: "Mot de passe modifié.",
    settingsCard: "Nom d'utilisateur et mot de passe",
    settingsCardHelp: "Modifiez vos identifiants d'administration depuis « Mon compte ».",
    errors: {
      invalid: "Vérifiez les valeurs saisies.",
      wrongPassword: "Le mot de passe actuel est incorrect.",
      taken: "Ce nom d'utilisateur est déjà pris.",
      rate: "Trop de tentatives. Réessayez dans un moment.",
      mismatch: "Les mots de passe ne correspondent pas.",
      same: "Le nouveau mot de passe est identique à l'actuel.",
      failed: "Enregistrement impossible. Réessayez.",
    },
    login: { identifier: "Nom d'utilisateur ou e-mail", rate: "Trop de tentatives. Réessayez dans 15 minutes." },
  },
  en: {
    nav: "My account",
    title: "My account",
    intro: "Change the username and password you use to sign in to the admin.",
    warning: "You're using the initial password. Change it now to protect your store.",
    warningCta: "Change password",
    usernameTitle: "Username",
    usernameHelp: "3–32 characters: lowercase letters, digits, dot, dash or underscore.",
    username: "New username",
    passwordTitle: "Password",
    passwordHelp: "At least 8 characters. Use a strong password you don't use anywhere else.",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    saveUsername: "Save username",
    savePassword: "Change password",
    saving: "Saving…",
    savedUsername: "Username changed.",
    savedPassword: "Password changed.",
    settingsCard: "Username and password",
    settingsCardHelp: "Change your admin sign-in details on the “My account” page.",
    errors: {
      invalid: "Check the values you entered.",
      wrongPassword: "The current password is incorrect.",
      taken: "This username is already taken.",
      rate: "Too many attempts. Try again in a moment.",
      mismatch: "The passwords don't match.",
      same: "The new password is the same as the current one.",
      failed: "Couldn't save. Please try again.",
    },
    login: { identifier: "Username or email", rate: "Too many attempts. Try again in 15 minutes." },
  },
};
