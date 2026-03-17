export type BetStatus = "active" | "resolved";

export type BetOption = {
  id: string;
  label: string;
  pot: number;
  odds: number;
};

export type Bet = {
  id: number;
  title: string;
  participants: string[];
  options: [BetOption, BetOption];
  status: BetStatus;
  winningOptionId?: string;
};

export type BetFilter = "all" | "active" | "resolved";
