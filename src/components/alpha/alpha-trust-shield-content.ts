import type { AlphaConnectSettingsState } from "@/components/alpha/AlphaConnectSettings";
import { buildShieldCenterSnapshot } from "@/components/alpha/connect-shield-center";
import {
  getChannelState,
  talkPermissionLabel,
  type ChannelInvitePolicy,
} from "@/components/alpha/connect-channel-state";
import {
  getConnectChannel,
  getConnectChannelStatus,
  getConnectChannels,
  type ConnectChannel,
  type ConnectChannelIcon,
} from "@/components/alpha/connect-channels-registry";
import { conversations } from "@/components/alpha/messaging-data";
import type { AlphaTrustShieldContext } from "@/features/alpha-connect/alpha-trust-shield-context";
import type { AlphaConnectStatusSnapshot } from "@/features/alpha-connect/status/types";

const DEFAULT_CHURCH_NAME = "كنيسة مارجرجس — مصر الجديدة";

/** Unified title prefix for every Alpha Connect shield panel */
export const TRUST_CENTER_TITLE_PREFIX = "مركز الثقة والأمان";

const CHANNEL_TYPE_LABELS: Record<ConnectChannelIcon, string> = {
  shield: "قناة رسمية",
  users: "قناة خدمة",
  book: "قناة دراسية",
  family: "قناة أسر",
  music: "قناة تسبيح",
  video: "قناة إعلام",
  handshake: "قناة علاقات",
};

const CHANNEL_CREATED_LABELS: Record<string, string> = {
  main: "١ يناير ٢٠٢٦",
  servants: "٣ مارس ٢٠٢٦",
  bible: "١٠ فبراير ٢٠٢٦",
  family: "٢٠ يناير ٢٠٢٦",
  worship: "٥ أبريل ٢٠٢٦",
  media: "١٢ مايو ٢٠٢٦",
  youth: "١٥ يونيو ٢٠٢٦",
  relations: "٨ يونيو ٢٠٢٦",
};

const EPHEMERAL_LABELS: Record<AlphaConnectSettingsState["ephemeralDelete"], string> = {
  on_read: "فوراً بعد القراءة/الاستماع",
  "1h": "بعد ساعة",
  "6h": "بعد 6 ساعات",
  "12h": "بعد 12 ساعة",
  "24h": "بعد 24 ساعة",
  "3d": "بعد 3 أيام",
  "7d": "بعد 7 أيام",
};

const WHO_CAN_CALL_LABELS: Record<AlphaConnectSettingsState["whoCanCall"], string> = {
  all: "الجميع",
  friends: "الأصدقاء فقط",
  church: "أعضاء الكنيسة فقط",
  none: "لا أحد",
};

const QUALITY_LABELS: Record<AlphaConnectSettingsState["callQuality"], string> = {
  auto: "تلقائي",
  economy: "اقتصادي",
  high: "عالي الجودة",
};

export type TrustShieldRow = { label: string; value: string };

export type TrustShieldSection = {
  title: string;
  rows?: TrustShieldRow[];
  bullets?: string[];
  paragraph?: string;
  showIdentity?: boolean;
};

export type TrustShieldContent = {
  title: string;
  subtitle: string;
  sections: TrustShieldSection[];
  identityUserId?: string;
};

function joinPolicyLabel(joinApproval: boolean, invitePolicy: ChannelInvitePolicy): string {
  if (joinApproval) return "بموافقة الإدارة";
  return invitePolicy === "everyone" ? "مفتوح للأعضاء" : "بدعوة المسؤولين";
}

function privacyLevelLabel(joinApproval: boolean, invitePolicy: ChannelInvitePolicy): string {
  if (joinApproval) return "خصوصية مرتفعة · موافقة مطلوبة";
  if (invitePolicy === "admins_only") return "خصوصية متوسطة · دعوة المسؤولين";
  return "خصوصية قياسية · أعضاء الكنيسة";
}

function channelTrustContent(channelId: string, channel: ConnectChannel): TrustShieldContent {
  const state = getChannelState(channelId);
  const members = state.members.filter((member) => !member.blocked);
  const status = getConnectChannelStatus(channelId);

  return {
    title: "مركز الثقة والأمان للقناة",
    subtitle: "قناة · حماية · خصوصية",
    sections: [
      {
        title: "معلومات القناة",
        showIdentity: false,
        rows: [
          { label: "اسم القناة", value: channel.name },
          { label: "نوع القناة", value: CHANNEL_TYPE_LABELS[channel.icon] ?? "قناة صوتية" },
          { label: "الكنيسة التابعة", value: DEFAULT_CHURCH_NAME },
          { label: "المسؤول", value: channel.adminName },
          { label: "عدد الأعضاء", value: String(members.length) },
          { label: "تاريخ الإنشاء", value: CHANNEL_CREATED_LABELS[channelId] ?? "١٥ يونيو ٢٠٢٦" },
          { label: "سياسة الانضمام", value: joinPolicyLabel(state.settings.joinApproval, state.settings.invitePolicy) },
          { label: "مستوى الخصوصية", value: privacyLevelLabel(state.settings.joinApproval, state.settings.invitePolicy) },
          { label: "حالة القناة", value: status === "suspended" ? "غير مفعلة" : "نشطة" },
          { label: "صلاحية التحدث", value: talkPermissionLabel(state.settings.talkPermission) },
        ],
      },
      {
        title: "الحماية",
        bullets: [
          "القناة محمية بواسطة Alpha Connect",
          "جميع الرسائل تخضع لسياسات الحذف",
          "التسجيلات الصوتية محمية",
          "إمكانية الإبلاغ متاحة",
          "القناة مراقبة ضد الإساءة",
        ],
      },
    ],
  };
}

function userTrustContent(
  channelId: string,
  channel: ConnectChannel,
  currentUserId: string,
  targetUserId?: string,
): TrustShieldContent {
  const userId = targetUserId ?? currentUserId;
  const identity = buildShieldCenterSnapshot(channelId, channel, userId);

  return {
    title: "مركز الثقة والأمان للمستخدم",
    subtitle: "هوية · ثقة · حماية",
    identityUserId: userId,
    sections: [
      {
        title: "الهوية",
        rows: [
          { label: "تاريخ الانضمام", value: identity.joinedOn },
          { label: "حالة التحقق", value: "موثّق" },
          { label: "الحالة الحالية", value: identity.connectionStatus },
          { label: "الكنيسة", value: identity.churchName },
        ],
      },
      {
        title: "الثقة",
        bullets: [
          "عضو موثّق",
          "تم التحقق من العضوية الكنسية",
          "يمكن الإبلاغ عن أي إساءة",
          "لا تشارك بياناتك الشخصية",
        ],
      },
    ],
  };
}

function messagesTrustContent(
  settings: AlphaConnectSettingsState,
  status?: AlphaConnectStatusSnapshot,
): TrustShieldContent {
  const encryptionLabel = status?.security.label ?? "—";
  return {
    title: "مركز الثقة والأمان للرسائل",
    subtitle: "حماية · خصوصية · تخزين",
    sections: [
      {
        title: "الحماية",
        rows: [
          { label: "نوع الحماية", value: "Alpha Messages Secure" },
          { label: "سياسة الحذف", value: EPHEMERAL_LABELS[settings.ephemeralDelete] },
          { label: "طريقة التخزين", value: "تخزين مشفر داخل Alpha" },
          { label: "حالة التشفير", value: encryptionLabel },
        ],
      },
      {
        title: "الخصوصية",
        bullets: [
          "لا يتم بيع بياناتك",
          "لا يتم مشاركة الرسائل مع أطراف خارجية",
          "تتم حماية البيانات داخل Alpha",
          "الرسائل تخضع لسياسات الحذف المفعلة",
        ],
      },
    ],
  };
}

function voiceMessagesTrustContent(settings: AlphaConnectSettingsState): TrustShieldContent {
  return {
    title: "مركز الثقة والأمان للتسجيلات الصوتية",
    subtitle: "تخزين · تشفير · احتفاظ",
    sections: [
      {
        title: "الحماية",
        rows: [
          { label: "نوع التخزين", value: "Alpha Connect Storage" },
          { label: "نوع التشفير", value: "AES-256 · Alpha Connect" },
          { label: "سياسة الاحتفاظ", value: EPHEMERAL_LABELS[settings.ephemeralDelete] },
          { label: "حالة الحذف", value: settings.ephemeralDelete === "on_read" ? "فوري بعد الاستماع" : "مجدول تلقائياً" },
        ],
      },
      {
        title: "معلومات",
        paragraph:
          "هذه التسجيلات الصوتية محمية. يتم حذف التسجيلات وفق السياسة المحددة للقناة أو المحادثة. يتم حذف البيانات من قاعدة البيانات والتخزين والفهارس المرتبطة بعد انتهاء مدة الاحتفاظ.",
      },
    ],
  };
}

function callTrustContent(
  settings: AlphaConnectSettingsState,
  status?: AlphaConnectStatusSnapshot,
): TrustShieldContent {
  const connection = status?.connection;
  const security = status?.security;
  const rttLabel = connection?.rttMs != null ? `${connection.rttMs} ms` : "—";
  const qualityLabel = connection?.qualityLabel ?? QUALITY_LABELS[settings.callQuality];
  const connectionStateLabel = connection?.online
    ? security?.state === "encrypted"
      ? "جاهز للاتصال"
      : security?.label ?? "تحذير"
    : "غير متصل";

  return {
    title: "مركز الثقة والأمان للاتصال",
    subtitle: "جودة · أمان · حماية",
    sections: [
      {
        title: "حالة الاتصال",
        rows: [
          { label: "جودة الاتصال", value: qualityLabel },
          { label: "زمن الاستجابة", value: rttLabel },
          { label: "مستوى الحماية", value: security?.label ?? "—" },
          { label: "حالة الاتصال", value: connectionStateLabel },
          { label: "من يمكنه الاتصال", value: WHO_CAN_CALL_LABELS[settings.whoCanCall] },
        ],
      },
      {
        title: "الأمان",
        bullets: [
          "الاتصال محمي بواسطة Alpha Connect",
          "لا يتم مشاركة الصوت مع أطراف خارجية",
          "لا يتم استخدام البيانات للإعلانات",
          "يتم تأمين الجلسة أثناء الاتصال",
        ],
      },
    ],
  };
}

function churchTrustContent(): TrustShieldContent {
  const channels = getConnectChannels();
  return {
    title: "مركز الثقة والأمان للكنيسة",
    subtitle: "كنيسة · توثيق · مجتمع",
    sections: [
      {
        title: "معلومات الكنيسة",
        rows: [
          { label: "اسم الكنيسة", value: DEFAULT_CHURCH_NAME },
          { label: "الكاهن المسؤول", value: "أبونا بولس" },
          { label: "عدد الأعضاء", value: "248" },
          { label: "عدد الخدام", value: "32" },
          { label: "عدد القنوات", value: String(channels.length) },
          { label: "تاريخ الانضمام", value: "١ يناير ٢٠٢٦" },
          { label: "حالة التوثيق", value: "موثّقة داخل Alpha" },
        ],
      },
      {
        title: "الثقة",
        bullets: [
          "هذه الكنيسة موثقة داخل Alpha",
          "إدارة الكنيسة مسؤولة عن المحتوى المنشور داخل مجتمعها",
        ],
      },
    ],
  };
}

function settingsTrustContent(
  settings: AlphaConnectSettingsState,
  status?: AlphaConnectStatusSnapshot,
): TrustShieldContent {
  return {
    title: "مركز الثقة والأمان للإعدادات",
    subtitle: "خصوصية · إشعارات · حماية",
    sections: [
      {
        title: "حالة الحساب",
        rows: [
          { label: "إعدادات الخصوصية", value: WHO_CAN_CALL_LABELS[settings.whoCanCall] },
          { label: "إعدادات الإشعارات", value: settings.groupNotifications ? "مفعّلة" : "مخفّفة" },
          { label: "إعدادات الحماية", value: settings.securityPin.length === 4 ? "رمز أمان مفعّل" : "قياسية" },
          { label: "حالة الاتصال", value: status?.connection.qualityLabel ?? "—" },
          { label: "حالة التشفير", value: status?.security.label ?? "—" },
          { label: "حالة الحساب", value: status?.security.authenticated ? "نشط · موثّق" : "غير مصادق" },
          { label: "سياسة الحذف", value: EPHEMERAL_LABELS[settings.ephemeralDelete] },
        ],
      },
      {
        title: "الخصوصية",
        bullets: [
          "بياناتك محمية داخل Alpha",
          "لا يتم مشاركة إعداداتك مع أطراف خارجية",
          "يمكنك تعديل سياسات الحذف في أي وقت",
        ],
      },
    ],
  };
}

function conversationTrustContent(
  channelId: string,
  channel: ConnectChannel,
  conversationId: string,
  currentUserId: string,
  settings: AlphaConnectSettingsState,
): TrustShieldContent {
  const contact = conversations.find((item) => item.id === conversationId);
  const base = userTrustContent(channelId, channel, currentUserId, conversationId);
  return {
    ...base,
    title: contact?.kind === "group" ? "مركز الثقة والأمان للمجموعة" : "مركز الثقة والأمان للمحادثة",
    subtitle: "محادثة · ثقة · حماية",
    sections: [
      ...base.sections,
      {
        title: "الحماية",
        rows: [
          { label: "سياسة الحذف", value: EPHEMERAL_LABELS[settings.ephemeralDelete] },
          { label: "نوع المحادثة", value: contact?.kind === "group" ? "جماعية" : "فردية" },
        ],
        bullets: ["الرسائل والتسجيلات تخضع لسياسات الحذف المفعّلة", "يمكن الإبلاغ عن أي إساءة"],
      },
    ],
  };
}

export function buildTrustShieldContent(
  context: AlphaTrustShieldContext,
  input: {
    channelId: string;
    channel: ConnectChannel;
    currentUserId: string;
    settings: AlphaConnectSettingsState;
    status?: AlphaConnectStatusSnapshot;
  },
): TrustShieldContent {
  const { channelId, channel, currentUserId, settings, status } = input;

  switch (context.type) {
    case "channel":
      return channelTrustContent(context.channelId ?? channelId, channel);
    case "user":
      return userTrustContent(channelId, channel, currentUserId, context.userId);
    case "conversation":
      return conversationTrustContent(
        channelId,
        channel,
        context.conversationId ?? context.userId ?? currentUserId,
        currentUserId,
        settings,
      );
    case "messages":
      return messagesTrustContent(settings, status);
    case "voice_messages":
      return voiceMessagesTrustContent(settings);
    case "call":
      return callTrustContent(settings, status);
    case "church":
      return churchTrustContent();
    case "service":
      return {
        title: "مركز الثقة والأمان للخدمة",
        subtitle: "خدمة · كنيسة · ثقة",
        sections: [
          {
            title: "معلومات الخدمة",
            rows: [
              { label: "اسم الخدمة", value: "خدمة الشباب" },
              { label: "الكنيسة", value: DEFAULT_CHURCH_NAME },
              { label: "المسؤول", value: "مينا جورج" },
              { label: "حالة التوثيق", value: "موثّقة" },
            ],
          },
          {
            title: "الثقة",
            bullets: ["المحتوى المنشور داخل الخدمة يخضع لإشراف الكنيسة", "يمكن الإبلاغ عن أي إساءة"],
          },
        ],
      };
    case "group":
      return conversationTrustContent(channelId, channel, context.conversationId ?? "group", currentUserId, settings);
    case "settings":
      return settingsTrustContent(settings, status);
    default:
      return userTrustContent(channelId, channel, currentUserId);
  }
}

export function getTrustShieldIdentitySnapshot(
  channelId: string,
  channel: ConnectChannel,
  userId: string,
) {
  return buildShieldCenterSnapshot(channelId, channel, userId);
}

export function resolveTrustShieldChannel(
  context: AlphaTrustShieldContext,
  fallbackChannelId: string,
): ConnectChannel {
  const id = context.channelId ?? fallbackChannelId;
  return getConnectChannel(id);
}
