import { BetOptionRow, BetRow, UserRow, WagerRow } from "@/types/bet";

const now = new Date().toISOString();

export const mockUsers: UserRow[] = [
  {
    id: "user-1",
    username: "Moi",
    nuggets_balance: 500,
    created_at: now,
  },
  {
    id: "user-2",
    username: "Lina",
    nuggets_balance: 820,
    created_at: now,
  },
  {
    id: "user-3",
    username: "Thomas",
    nuggets_balance: 760,
    created_at: now,
  },
];

export const mockBets: BetRow[] = [
  {
    id: "bet-1",
    creator_id: "user-1",
    title: "Est-ce que Thomas va renverser son verre avant minuit ?",
    description: "Soirée entre amis au rooftop",
    status: "open",
    winning_option_id: null,
    created_at: now,
    resolved_at: null,
  },
  {
    id: "bet-2",
    creator_id: "user-2",
    title: "Qui arrivera en retard au brunch de dimanche ?",
    description: "Match amical des retardataires",
    status: "closed",
    winning_option_id: null,
    created_at: now,
    resolved_at: null,
  },
];

export const mockBetOptions: BetOptionRow[] = [
  { id: "opt-1", bet_id: "bet-1", title: "Oui, évidemment", odds: 1.5 },
  { id: "opt-2", bet_id: "bet-1", title: "Non, il est prudent", odds: 2.1 },
  { id: "opt-3", bet_id: "bet-2", title: "Team Sarah", odds: 1.9 },
  { id: "opt-4", bet_id: "bet-2", title: "Team Noé", odds: 1.7 },
];

export const mockWagers: WagerRow[] = [
  {
    id: "wager-1",
    user_id: "user-1",
    bet_id: "bet-1",
    option_id: "opt-1",
    amount: 50,
    potential_payout: 75,
    status: "pending",
    created_at: now,
  },
];
