import {
  BetOptionRow,
  BetRow,
  BetStatus,
  BetWithOptions,
  UserRow,
  WagerRow,
  WagerWithContext,
} from "@/types/bet";
import { mockBetOptions, mockBets, mockUsers, mockWagers } from "@/lib/mock-data";

type PlaceWagerInput = {
  user_id: string;
  selections: Array<{ bet_id: string; option_id: string }>;
  amount: number;
};

type CreateBetInput = {
  creator_id: string;
  title: string;
  description: string;
  option_1_title: string;
  option_1_odds: number;
  option_2_title: string;
  option_2_odds: number;
};

const db = {
  users: [...mockUsers] as UserRow[],
  bets: [...mockBets] as BetRow[],
  bet_options: [...mockBetOptions] as BetOptionRow[],
  wagers: [...mockWagers] as WagerRow[],
};

const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

function withOptions(bets: BetRow[]): BetWithOptions[] {
  return bets
    .map((bet) => ({
      ...bet,
      options: db.bet_options.filter((opt) => opt.bet_id === bet.id),
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function fetchCurrentUser(userId: string): Promise<UserRow> {
  await wait();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("Utilisateur introuvable.");
  return { ...user };
}

export async function fetchUsers(): Promise<UserRow[]> {
  await wait();
  return db.users.map((u) => ({ ...u }));
}

export async function fetchBets(): Promise<BetWithOptions[]> {
  await wait();
  return withOptions(db.bets);
}

export async function fetchUserWagers(userId: string): Promise<WagerWithContext[]> {
  await wait();
  return db.wagers
    .filter((w) => w.user_id === userId)
    .map((w) => {
      const bet = db.bets.find((b) => b.id === w.bet_id);
      const option = db.bet_options.find((o) => o.id === w.option_id);
      return {
        ...w,
        bet_title: bet?.title ?? "Pari supprimé",
        option_title: option?.title ?? "Option supprimée",
      };
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function placeWager(input: PlaceWagerInput): Promise<void> {
  await wait();

  const user = db.users.find((u) => u.id === input.user_id);
  if (!user) throw new Error("Utilisateur introuvable.");

  if (input.selections.length === 0) {
    throw new Error("Aucune sélection.");
  }

  if (input.amount <= 0) {
    throw new Error("Montant invalide.");
  }

  if (user.nuggets_balance < input.amount) {
    throw new Error("Solde insuffisant.");
  }

  const amountPerSelection = input.amount / input.selections.length;

  for (const selection of input.selections) {
    const bet = db.bets.find((b) => b.id === selection.bet_id);
    const option = db.bet_options.find((o) => o.id === selection.option_id && o.bet_id === selection.bet_id);

    if (!bet || !option) {
      throw new Error("Sélection invalide.");
    }

    if (bet.status !== "open") {
      throw new Error("Le pari est fermé.");
    }

    db.wagers.push({
      id: `wager-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      user_id: input.user_id,
      bet_id: selection.bet_id,
      option_id: selection.option_id,
      amount: amountPerSelection,
      potential_payout: amountPerSelection * option.odds,
      status: "pending",
      created_at: new Date().toISOString(),
    });
  }

  user.nuggets_balance -= input.amount;
}

export async function createBet(input: CreateBetInput): Promise<void> {
  await wait();

  const newBetId = `bet-${Date.now()}`;
  db.bets.unshift({
    id: newBetId,
    creator_id: input.creator_id,
    title: input.title,
    description: input.description,
    status: "open",
    winning_option_id: null,
    created_at: new Date().toISOString(),
    resolved_at: null,
  });

  db.bet_options.push(
    {
      id: `opt-${Date.now()}-1`,
      bet_id: newBetId,
      title: input.option_1_title,
      odds: input.option_1_odds,
    },
    {
      id: `opt-${Date.now()}-2`,
      bet_id: newBetId,
      title: input.option_2_title,
      odds: input.option_2_odds,
    },
  );
}

export async function closeBet(betId: string): Promise<void> {
  await wait();
  const bet = db.bets.find((b) => b.id === betId);
  if (!bet) throw new Error("Pari introuvable.");
  if (bet.status !== "open") throw new Error("Pari déjà bloqué ou résolu.");
  bet.status = "closed";
}

export async function resolveBet(betId: string, optionId: string): Promise<number> {
  await wait();
  const bet = db.bets.find((b) => b.id === betId);
  if (!bet) throw new Error("Pari introuvable.");
  if (bet.status === "resolved") throw new Error("Pari déjà résolu.");

  const option = db.bet_options.find((o) => o.id === optionId && o.bet_id === betId);
  if (!option) throw new Error("Option gagnante invalide.");

  bet.status = "resolved";
  bet.winning_option_id = optionId;
  bet.resolved_at = new Date().toISOString();

  let totalPayout = 0;
  db.wagers = db.wagers.map((wager) => {
    if (wager.bet_id !== betId || wager.status !== "pending") return wager;

    if (wager.option_id === optionId) {
      const winner = db.users.find((u) => u.id === wager.user_id);
      if (winner) {
        winner.nuggets_balance += wager.potential_payout;
        totalPayout += wager.potential_payout;
      }
      return { ...wager, status: "won" };
    }

    return { ...wager, status: "lost" };
  });

  return totalPayout;
}

export async function deleteBet(betId: string): Promise<void> {
  await wait();
  db.bets = db.bets.filter((b) => b.id !== betId);
  db.bet_options = db.bet_options.filter((o) => o.bet_id !== betId);
  db.wagers = db.wagers.filter((w) => w.bet_id !== betId);
}

export async function getOptionTitle(optionId: string): Promise<string> {
  await wait(100);
  return db.bet_options.find((o) => o.id === optionId)?.title ?? "Option";
}

export type { PlaceWagerInput, CreateBetInput, BetStatus };
