import { zh } from "./zh";

// Simplified Chinese locale.
// Starts from the Traditional Chinese (`zh`) copy and overrides
// selected strings with simplified characters. Any missing keys
// will gracefully fall back to `zh` via the LanguageContext.
export const zhHans: typeof zh = {
  ...zh,

  // Global
  loading: "加载中...",

  // Nav
  navExplore: "探索",
  navMarketplace: "市集",
  navEvents: "活动",
  navProfile: "我的",
  navPlay: "游玩",

  // Spinner
  spinnerExplore: "正在探索香港工艺...",
  spinnerEvents: "正在搜罗全城活动...",
  spinnerProducts: "正在读取商品...",
  spinnerOrders: "正在读取订单...",
  spinnerMessages: "正在读取消息...",

  // Profile
  profileTitle: "文化探索者",
  profileStats: "已收藏 {favorites} 件工艺・创作 {creations} 件作品",
  profileSwitchToArtisan: "切换到师傅模式",
  profileTabFavorites: "我的收藏",
  profileTabCreations: "我的 AI 创作",
  profileTabWardrobe: "试衣簿",
  profileFavoritesEmpty: "还没有收藏，快去「探索」页面发掘吧！",
  profileCreationsEmpty: "还没有创作，在工艺知识页寻找灵感吧！",
  profileLanguageSetting: "语言设置",

  // Artisan Messages
  artisanMessagesTitle: "消息中心",
  artisanMessagesUnread: "你共有 {count} 条未读消息",

  // Chatroom
  chatroomWith: "与 {name} 聊天中",
  chatroomPlaceholder: "输入消息...",
  artisanChatroomProductInquiry: "查询商品：",
  artisanChatroomShowTranslated: "显示中文翻译",
  artisanChatroomShowOriginal: "显示原文",
  artisanChatroomOriginalLabel: "原文（{language}）",
  artisanChatroomTranslatedLabel: "翻译（{language}）",
  artisanChatroomAutoTranslationFallback: "自动翻译：",
  artisanChatroomAutoTranslatedTag: "自动翻译",
  artisanChatroomAutoTranslateNotice: "系统会自动以英文发送：",
  artisanChatroomYouLabel: "我",
  artisanChatroomCustomerLabel: "顾客",
  languageEnglish: "英文",
  languageChinese: "中文",

  // Authentication
  authWelcome: "欢迎来到 CraftscapeHK",
  authWelcomeSubtitle: "探索香港传统工艺，与匠人面对面",
  authLoginTitle: "登录",
  authRegisterTitle: "创建账户",
  authEmail: "邮箱",
  authPassword: "密码",
  authPasswordConfirm: "确认密码",
  authUsername: "用户名",
  authRoleLabel: "我是...",
  authRoleUser: "工艺爱好者",
  authRoleArtisan: "工艺师傅",
  authLoginButton: "登录",
  authRegisterButton: "创建账户",
  authLoginLink: "已有账户？立即登录",
  authRegisterLink: "还没有账户？立即注册",
  authLoggingIn: "登录中...",
  authRegistering: "创建账户中...",
  authErrorInvalidCredentials: "邮箱或密码不正确",
  authErrorEmailExists: "此邮箱已被注册",
  authErrorPasswordMismatch: "两次输入的密码不一致",
  authErrorRequired: "此字段为必填项",
  authErrorEmailInvalid: "请输入有效的邮箱地址",
  authErrorPasswordShort: "密码至少需要 6 个字符",
  authLogout: "登出",
  authGuestMode: "访客浏览",
};


