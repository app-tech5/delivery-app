import i18n from '../i18n';
import { colors } from '../global';

export function getBugCategories() {
  return [
    { key: 'general', label: i18n.t('support.general') },
    { key: 'technical', label: i18n.t('support.technical') },
    { key: 'payment', label: i18n.t('support.payment') },
    { key: 'account', label: i18n.t('support.account') },
  ];
}

export function getBugPriorities() {
  return [
    { key: 'low', label: i18n.t('support.low'), color: colors.success },
    { key: 'normal', label: i18n.t('support.normal'), color: colors.warning },
    { key: 'urgent', label: i18n.t('support.urgent'), color: colors.error },
  ];
}

const PRIORITY_MAP = {
  low: 'low',
  normal: 'medium',
  urgent: 'high',
};

export function mapSupportPriority(priority) {
  return PRIORITY_MAP[priority] || 'medium';
}

export function buildSupportTicketSubject(category) {
  const labelKey = ['general', 'technical', 'payment', 'account'].includes(category)
    ? `support.${category}`
    : 'support.general';

  return `[${i18n.t(labelKey)}] ${i18n.t('support.bugReport')}`;
}

export function getI18nSupportFaqs() {
  return ['q1', 'q2', 'q3', 'q4', 'q5']
    .map((key) => ({
      id: key,
      question: i18n.t(`support.faqs.${key}`),
      answer: i18n.t(`support.faqs.a${key.slice(1)}`),
    }))
    .filter((faq) => faq.question && !faq.question.startsWith('[missing'));
}

export function mapSupportFaqs(items = []) {
  return items
    .filter((item) => item.type === 'faq' && item.question && item.answer)
    .map((item) => ({
      id: String(item._id || item.id),
      question: item.question,
      answer: item.answer,
      category: item.faq_category,
    }));
}

export function buildContactActions(appConfig) {
  const supportEmail = appConfig?.supportEmail?.trim();

  if (!supportEmail) {
    return [];
  }

  return [
    {
      id: 'email',
      title: i18n.t('support.emailSupport'),
      subtitle: supportEmail,
      icon: 'email',
      color: colors.primary,
      actionType: 'email',
      value: supportEmail,
    },
  ];
}

export function getPlatformLabel(platform) {
  if (platform === 'ios') {
    return i18n.t('support.platformIos');
  }
  if (platform === 'android') {
    return i18n.t('support.platformAndroid');
  }
  return platform;
}
