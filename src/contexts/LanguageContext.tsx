import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fa';

export interface Translations {
  nav: {
    dashboard: string;
    nodes: string;
    servers: string;
    tunnels: string;
    coreHealth: string;
    logs: string;
    guide: string;
    settings: string;
    logout: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    totalNodes: string;
    activeNodes: string;
    totalTunnels: string;
    activeTunnels: string;
    cpuUsage: string;
    memoryUsage: string;
    trafficIn: string;
    trafficOut: string;
    currentSpeed: string;
    quickActions: string;
    createTunnel: string;
    addNode: string;
    viewCerts: string;
    reapplyAll: string;
    reapplySuccess: string;
    activeCores: string;
    serverUptime: string;
    networkTopology: string;
    iranNode: string;
    foreignNode: string;
  };
  nodes: {
    title: string;
    subtitle: string;
    addIranNode: string;
    addForeignServer: string;
    installScript: string;
    downloadCa: string;
    viewCa: string;
    filterAll: string;
    filterIran: string;
    filterForeign: string;
    fingerprint: string;
    status: string;
    lastSeen: string;
    hardware: string;
    tunnels: string;
    traffic: string;
    actions: string;
    deleteConfirm: string;
    copyCommand: string;
    copied: string;
    emptyNodes: string;
  };
  tunnels: {
    title: string;
    subtitle: string;
    createTunnel: string;
    coreType: string;
    transport: string;
    publicPort: string;
    targetPort: string;
    iranNode: string;
    foreignNode: string;
    status: string;
    trafficUsed: string;
    actions: string;
    applyConfig: string;
    viewConfig: string;
    editTunnel: string;
    deleteTunnel: string;
    deleteConfirm: string;
    statusActive: string;
    statusPending: string;
    statusStopped: string;
    statusError: string;
    modalTitleCreate: string;
    modalTitleEdit: string;
    namePlaceholder: string;
    tokenPlaceholder: string;
    tlsEnable: string;
    udpEnable: string;
    save: string;
    cancel: string;
    configPreview: string;
    downloadConfig: string;
  };
  coreHealth: {
    title: string;
    subtitle: string;
    status: string;
    version: string;
    uptime: string;
    instances: string;
    cpu: string;
    memory: string;
    autoReset: string;
    resetInterval: string;
    restartNow: string;
    restarting: string;
    healthy: string;
    degraded: string;
    down: string;
  };
  logs: {
    title: string;
    subtitle: string;
    filterLevel: string;
    filterSource: string;
    allLevels: string;
    allSources: string;
    clear: string;
    autoScroll: string;
    exportLogs: string;
    noLogs: string;
  };
  settings: {
    title: string;
    subtitle: string;
    telegramBot: string;
    telegramDesc: string;
    botToken: string;
    chatId: string;
    testTelegram: string;
    testSending: string;
    telegramSuccess: string;
    autoBackup: string;
    autoBackupDesc: string;
    downloadBackup: string;
    certificates: string;
    regenerateCert: string;
    language: string;
    theme: string;
    saveSettings: string;
    saveSuccess: string;
  };
  login: {
    title: string;
    subtitle: string;
    username: string;
    password: string;
    submit: string;
    demoNote: string;
    demoHint: string;
    errorEmpty: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      nodes: 'Iran Nodes',
      servers: 'Foreign Servers',
      tunnels: 'Tunnels',
      coreHealth: 'Core Health',
      logs: 'Logs',
      guide: 'Installation & Guide',
      settings: 'Settings',
      logout: 'Logout',
    },
    dashboard: {
      title: 'Control Center',
      subtitle: 'Real-time overview of your dual-node tunneling network',
      totalNodes: 'Total Nodes',
      activeNodes: 'Online Nodes',
      totalTunnels: 'Total Tunnels',
      activeTunnels: 'Active Tunnels',
      cpuUsage: 'Panel CPU',
      memoryUsage: 'Panel Memory',
      trafficIn: 'Total Inbound',
      trafficOut: 'Total Outbound',
      currentSpeed: 'Current Bandwidth',
      quickActions: 'Quick Actions',
      createTunnel: 'New Tunnel',
      addNode: 'Add Node',
      viewCerts: 'CA Certificates',
      reapplyAll: 'Reapply All Tunnels',
      reapplySuccess: 'All tunnel rules reapplied successfully!',
      activeCores: 'Active Cores',
      serverUptime: 'Panel Uptime',
      networkTopology: 'Tunnel Architecture Overview',
      iranNode: 'Iran Edge Node',
      foreignNode: 'Foreign Exit Node',
    },
    nodes: {
      title: 'Node Management',
      subtitle: 'Manage and coordinate Iran relay nodes and Foreign server endpoints',
      addIranNode: 'Deploy Iran Node',
      addForeignServer: 'Deploy Foreign Server',
      installScript: 'Installation Script',
      downloadCa: 'Download CA Certificate',
      viewCa: 'View CA Certificate',
      filterAll: 'All Nodes',
      filterIran: 'Iran Nodes',
      filterForeign: 'Foreign Servers',
      fingerprint: 'Fingerprint',
      status: 'Status',
      lastSeen: 'Last Heartbeat',
      hardware: 'System / Specs',
      tunnels: 'Tunnels',
      traffic: 'Data Transferred',
      actions: 'Actions',
      deleteConfirm: 'Are you sure you want to remove this node?',
      copyCommand: 'Copy Install Command',
      copied: 'Copied to clipboard!',
      emptyNodes: 'No nodes registered yet. Run the install script on your server.',
    },
    tunnels: {
      title: 'Tunnel Management',
      subtitle: 'Configure reverse and forward tunnels across Backhaul, Rathole, GOST, Chisel, and FRP',
      createTunnel: 'Create Tunnel',
      coreType: 'Core Engine',
      transport: 'Transport Protocol',
      publicPort: 'Public Port',
      targetPort: 'Target Port',
      iranNode: 'Iran Relay',
      foreignNode: 'Foreign Target',
      status: 'Status',
      trafficUsed: 'Quota & Usage',
      actions: 'Actions',
      applyConfig: 'Apply to Nodes',
      viewConfig: 'Inspect Config',
      editTunnel: 'Edit',
      deleteTunnel: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this tunnel?',
      statusActive: 'Active',
      statusPending: 'Pending',
      statusStopped: 'Stopped',
      statusError: 'Error',
      modalTitleCreate: 'Deploy New Tunnel',
      modalTitleEdit: 'Edit Tunnel Configuration',
      namePlaceholder: 'e.g. Backhaul-Tehran-FRA-443',
      tokenPlaceholder: 'Secret connection token',
      tlsEnable: 'Enable TLS / SNI Encryption',
      udpEnable: 'Forward UDP Traffic',
      save: 'Save Tunnel',
      cancel: 'Cancel',
      configPreview: 'Generated Core Configuration',
      downloadConfig: 'Download Config',
    },
    coreHealth: {
      title: 'Core Engine Health',
      subtitle: 'Monitor uptime, CPU/memory consumption, and auto-reset timers for tunnel cores',
      status: 'Status',
      version: 'Version',
      uptime: 'Uptime',
      instances: 'Active Instances',
      cpu: 'CPU Usage',
      memory: 'RAM Usage',
      autoReset: 'Auto Reset Watchdog',
      resetInterval: 'Interval (minutes)',
      restartNow: 'Restart Core',
      restarting: 'Restarting...',
      healthy: 'Operational',
      degraded: 'Degraded',
      down: 'Service Down',
    },
    logs: {
      title: 'Real-time System Logs',
      subtitle: 'Live connection logs, core events, and diagnostics',
      filterLevel: 'Filter Level',
      filterSource: 'Filter Source',
      allLevels: 'All Levels',
      allSources: 'All Engines',
      clear: 'Clear Logs',
      autoScroll: 'Auto-scroll',
      exportLogs: 'Export Log File',
      noLogs: 'No logs recorded matching current filter.',
    },
    settings: {
      title: 'Panel Settings',
      subtitle: 'Configure notifications, automatic backups, certificates, and appearance',
      telegramBot: 'Telegram Bot Alerts',
      telegramDesc: 'Receive status notifications, node disconnection alerts, and daily backups in Telegram.',
      botToken: 'Telegram Bot Token',
      chatId: 'Admin Chat ID',
      testTelegram: 'Send Test Notification',
      testSending: 'Sending test message...',
      telegramSuccess: 'Test message sent successfully to your Telegram chat!',
      autoBackup: 'Automated Database Backups',
      autoBackupDesc: 'Scheduled JSON backups of all nodes, tunnels, and panel parameters.',
      downloadBackup: 'Download Backup Now',
      certificates: 'PKI & TLS Authority',
      regenerateCert: 'Generate New CA Keypair',
      language: 'Interface Language',
      theme: 'Theme Mode',
      saveSettings: 'Save Settings',
      saveSuccess: 'Settings saved successfully!',
    },
    login: {
      title: 'Sign in to Smite',
      subtitle: 'Secure Tunnel Management & Control Panel',
      username: 'Username',
      password: 'Password',
      submit: 'Access Panel',
      demoNote: 'Default credentials:',
      demoHint: 'admin / admin (or any demo username)',
      errorEmpty: 'Please enter username and password',
    },
  },
  fa: {
    nav: {
      dashboard: 'داشبورد',
      nodes: 'نودهای ایران',
      servers: 'سرورهای خارج',
      tunnels: 'تونل‌ها',
      coreHealth: 'سلامت هسته‌ها',
      logs: 'گزارش‌ها و لاگ‌ها',
      guide: 'آموزش نصب و راهنما',
      settings: 'تنظیمات پنل',
      logout: 'خروج',
    },
    dashboard: {
      title: 'مرکز کنترل Smite',
      subtitle: 'نمای زنده و جامع وضعیت شبکه تانل دوطرفه ایران و خارج',
      totalNodes: 'کل سرورها و نودها',
      activeNodes: 'نودهای آنلاین',
      totalTunnels: 'تعداد کل تانل‌ها',
      activeTunnels: 'تانل‌های فعال',
      cpuUsage: 'مصرف پردازنده پنل',
      memoryUsage: 'مصرف حافظه پنل',
      trafficIn: 'کل ترافیک ورودی',
      trafficOut: 'کل ترافیک خروجی',
      currentSpeed: 'سرعت و پهنای باند جاری',
      quickActions: 'دسترسی سریع',
      createTunnel: 'ساخت تانل جدید',
      addNode: 'افزودن نود جدید',
      viewCerts: 'گواهینامه‌های CA',
      reapplyAll: 'اعمال مجدد همه تانل‌ها',
      reapplySuccess: 'تمام تنظیمات تانل‌ها با موفقیت بازاعمال و همگام‌سازی شد!',
      activeCores: 'هسته‌های فعال',
      serverUptime: 'مدت زمان روشن بودن پنل',
      networkTopology: 'نمای شماتیک معماری تانل',
      iranNode: 'نود واسط ایران',
      foreignNode: 'سرور مقصد خارج',
    },
    nodes: {
      title: 'مدیریت نودها و سرورها',
      subtitle: 'پیکربندی و مشاهده نودهای داخل ایران و سرورهای خارج از کشور',
      addIranNode: 'راه‌اندازی نود ایران',
      addForeignServer: 'راه‌اندازی سرور خارج',
      installScript: 'اسکریپت نصب خودکار',
      downloadCa: 'دانلود گواهی CA',
      viewCa: 'مشاهده گواهی CA',
      filterAll: 'همه نودها',
      filterIran: 'نودهای ایران',
      filterForeign: 'سرورهای خارج',
      fingerprint: 'اثر انگشت (Fingerprint)',
      status: 'وضعیت',
      lastSeen: 'آخرین پالس (Heartbeat)',
      hardware: 'مشخصات سخت‌افزاری',
      tunnels: 'تانل‌ها',
      traffic: 'ترافیک رد و بدل شده',
      actions: 'عملیات',
      deleteConfirm: 'آیا از حذف این نود اطمینان دارید؟',
      copyCommand: 'کپی دستور نصب',
      copied: 'در حافظه کپی شد!',
      emptyNodes: 'هنوز نودی ثبت نشده است. با اجرای اسکریپت روی سرور خود نود اضافه کنید.',
    },
    tunnels: {
      title: 'مدیریت و پیکربندی تانل‌ها',
      subtitle: 'ساخت و کنترل انواع تانل معکوس و مستقیم با Backhaul, Rathole, GOST, Chisel, FRP',
      createTunnel: 'ساخت تانل جدید',
      coreType: 'هسته تانل',
      transport: 'پروتکل انتقال',
      publicPort: 'پورت عمومی (Public)',
      targetPort: 'پورت مقصد (Target)',
      iranNode: 'نود ایران',
      foreignNode: 'سرور خارج',
      status: 'وضعیت',
      trafficUsed: 'سهمیه و مصرف ترافیک',
      actions: 'عملیات',
      applyConfig: 'اعمال روی نودها',
      viewConfig: 'مشاهده کانفیگ',
      editTunnel: 'ویرایش',
      deleteTunnel: 'حذف',
      deleteConfirm: 'آیا از حذف این تانل اطمینان دارید؟',
      statusActive: 'فعال',
      statusPending: 'در حال انتظار',
      statusStopped: 'متوقف شده',
      statusError: 'خطا',
      modalTitleCreate: 'تعریف و راه‌اندازی تانل جدید',
      modalTitleEdit: 'ویرایش پیکربندی تانل',
      namePlaceholder: 'مثلا: Backhaul-Tehran-FRA-443',
      tokenPlaceholder: 'توکن امنیتی اتصال',
      tlsEnable: 'فعال‌سازی رمزنگاری TLS / SNI',
      udpEnable: 'عبور ترافیک UDP',
      save: 'ذخیره و ایجاد تانل',
      cancel: 'انصراف',
      configPreview: 'کانفیگ تولید شده هسته',
      downloadConfig: 'دانلود فایل کانفیگ',
    },
    coreHealth: {
      title: 'سلامت هسته‌های تانل',
      subtitle: 'نظارت بر مصرف منابع، پایداری، نسخه و ریست دوره‌ای هسته‌ها',
      status: 'وضعیت کارکرد',
      version: 'نسخه نصب شده',
      uptime: 'مدت آپ‌تایم',
      instances: 'تعداد پردازش فعال',
      cpu: 'درصد پردازنده',
      memory: 'مصرف حافظه',
      autoReset: 'سیستم ریست خودکار (Watchdog)',
      resetInterval: 'فاصله زمانی (دقیقه)',
      restartNow: 'ریستارت هسته',
      restarting: 'در حال راه‌اندازی مجدد...',
      healthy: 'کاملاً سالم و پایدار',
      degraded: 'کارکرد با افت سرعت',
      down: 'متوقف شده',
    },
    logs: {
      title: 'لاگ‌ها و رویدادهای زنده',
      subtitle: 'مشاهده رویدادهای اتصال، فعالیت هسته‌ها و رخدادهای سیستمی',
      filterLevel: 'فیلتر سطح لاگ',
      filterSource: 'فیلتر هسته / منبع',
      allLevels: 'همه سطوح',
      allSources: 'همه هسته‌ها',
      clear: 'پاک کردن لاگ‌ها',
      autoScroll: 'اسکرول خودکار به انتهای صفحه',
      exportLogs: 'خروجی گرفتن از لاگ‌ها',
      noLogs: 'هیچ رویدادی مطابق با فیلتر انتخابی یافت نشد.',
    },
    settings: {
      title: 'تنظیمات کلی پنل Smite',
      subtitle: 'مدیریت اعلان‌های تلگرام، بکاپ‌گیری خودکار، گواهی‌ها و شخصی‌سازی',
      telegramBot: 'ربات تلگرام اعلان‌ها',
      telegramDesc: 'دریافت آمار روزانه، اعلان قطعی نودها و فایل‌های بکاپ در چت یا کانال تلگرام شما.',
      botToken: 'توکن ربات تلگرام (Bot Token)',
      chatId: 'شناسه چت مدیر (Chat ID)',
      testTelegram: 'ارسال پیام تست به تلگرام',
      testSending: 'در حال ارسال پیام تست...',
      telegramSuccess: 'پیام تست با موفقیت به چت تلگرام شما ارسال شد!',
      autoBackup: 'پشتیبان‌گیری خودکار از دیتابیس',
      autoBackupDesc: 'تهیه نسخه پشتیبان دوره‌ای از تمام نودها، تانل‌ها و تنظیمات پنل در قالب JSON.',
      downloadBackup: 'دانلود آنی فایل بکاپ',
      certificates: 'مرجع گواهی امنیتی CA',
      regenerateCert: 'تولید مجدد کلیدهای CA',
      language: 'زبان رابط کاربری',
      theme: 'حالت پوسته (Theme)',
      saveSettings: 'ذخیره تغییرات',
      saveSuccess: 'تنظیمات با موفقیت ذخیره شد!',
    },
    login: {
      title: 'ورود به پنل مدیریت Smite',
      subtitle: 'سامانه یکپارچه مدیریت تانل و ارتباط دوطرفه سرورها',
      username: 'نام کاربری',
      password: 'رمز عبور',
      submit: 'ورود به داشبورد',
      demoNote: 'مشخصات پیش‌فرض ورود:',
      demoHint: 'admin / admin (یا هر نام کاربری آزمایشی)',
      errorEmpty: 'لطفاً نام کاربری و رمز عبور را وارد کنید',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('smite_lang') as Language) || 'fa';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('smite_lang', lang);
  };

  const isRTL = language === 'fa';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        isRTL,
      }}
    >
      <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen ${isRTL ? 'font-["Vazirmatn",sans-serif]' : 'font-["Inter",sans-serif]'}`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
