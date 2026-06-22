import { updateDemoState } from './localStore';

export async function submitDemoSupportTicketLocally(ticket) {
  const entry = {
    _id: `demo_support_${Date.now()}`,
    ...ticket,
    created_at: new Date().toISOString(),
  };

  await updateDemoState((state) => ({
    ...state,
    supportTickets: [...(state.supportTickets || []), entry],
  }));

  return entry;
}
