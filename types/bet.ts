export type BetStatus = "open" | "closed" | "resolved";

export type WagerStatus = "pending" | "won" | "lost";

export type UserRow = {
  id: string;
  username: string;
  avatar_url?: string;
  nuggets_balance: number;
  created_at: string;
};

export type BetRow = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  status: BetStatus;
  winning_option_id?: string | null;
  created_at: string;
  resolved_at?: string | null;
};

export type BetOptionRow = {
  id: string;
  bet_id: string;
  title: string;
  odds: number;
};

export type WagerRow = {
  id: string;
  user_id: string;
  bet_id: string;
  option_id: string;
  amount: number;
  potential_payout: number;
  status: WagerStatus;
  created_at: string;
};

export type BetWithOptions = BetRow & {
  options: BetOptionRow[];
};

export type WagerWithContext = WagerRow & {
  bet_title: string;
  option_title: string;
};

export type BetFilter = "all" | BetStatus;
