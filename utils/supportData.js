import i18n from '../i18n';
import { colors } from '../global';

/**
 * Données FAQ pour le support
 */
export const FAQ_DATA = [
  {
    id: 'q1',
    question: i18n.t('support.faqs.q1'),
    answer: i18n.t('support.faqs.a1')
  },
  {
    id: 'q2',
    question: i18n.t('support.faqs.q2'),
    answer: i18n.t('support.faqs.a2')
  },
  {
    id: 'q3',
    question: i18n.t('support.faqs.q3'),
    answer: i18n.t('support.faqs.a3')
  },
  {
    id: 'q4',
    question: i18n.t('support.faqs.q4'),
    answer: i18n.t('support.faqs.a4')
  },
  {
    id: 'q5',
    question: i18n.t('support.faqs.q5'),
    answer: i18n.t('support.faqs.a5')
  }
];

/**
 * Catégories pour les rapports de bug
 */
export const BUG_CATEGORIES = [
  { key: 'general', label: i18n.t('support.general') },
  { key: 'technical', label: i18n.t('support.technical') },
  { key: 'payment', label: i18n.t('support.payment') },
  { key: 'account', label: i18n.t('support.account') }
];

/**
 * Priorités pour les rapports de bug
 */
export const BUG_PRIORITIES = [
  { key: 'low', label: i18n.t('support.low'), color: colors.success },
  { key: 'normal', label: i18n.t('support.normal'), color: colors.warning },
  { key: 'urgent', label: i18n.t('support.urgent'), color: colors.error }
];

/**
 * Actions de contact disponibles
 */
export const CONTACT_ACTIONS = [
  {
    id: 'call',
    title: i18n.t('support.callSupport'),
    subtitle: '+1 (555) 123-4567',
    icon: 'phone',
    color: colors.success,
    actionType: 'call'
  },
  {
    id: 'email',
    title: i18n.t('support.emailSupport'),
    subtitle: 'support@goodfood.com',
    icon: 'email',
    color: colors.primary,
    actionType: 'email'
  },
  {
    id: 'chat',
    title: i18n.t('support.liveChat'),
    subtitle: i18n.t('support.workingHours'),
    icon: 'chat',
    color: colors.info,
    actionType: 'chat'
  }
];


