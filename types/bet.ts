export type BetStatus = "active" | "resolved";

export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  nuggets: number;
};

export type BetOption = {
  id: string;
  label: string;
  pot: number;
  odds: number;
};

export type Bet = {
  id: string;
  creatorId: string;
  title: string;
  participants: string[];
  options: [BetOption, BetOption];
  status: BetStatus;
  winningOptionId?: string;
};

export type BetFilter = "all" | "active" | "resolved";
