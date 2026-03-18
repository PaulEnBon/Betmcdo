import { supabase } from "@/lib/supabase";

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

type DbUser = {
  id: string;
  username: string;
  avatar_url?: string | null;
  nuggets_balance: number;
  created_at: string;
};

type DbBetOption = {
  id: string;
  bet_id: string;
  title: string;
  odds: number;
};

type DbBet = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  status: "open" | "closed" | "resolved";
  winning_option_id: string | null;
  created_at: string;
  resolved_at: string | null;
  bet_options?: DbBetOption[];
};

type DbWager = {
  id: string;
  user_id: string;
  bet_id: string;
  option_id: string;
  amount: number;
  potential_payout: number;
  status: "pending" | "won" | "lost";
  created_at: string;
  bets?: DbBet | null;
  bet_options?: DbBetOption | null;
};

function mapUser(data: DbUser) {
  return {
    ...data,
    avatar_url: data.avatar_url ?? undefined,
    name: data.username,
    nuggets: data.nuggets_balance,
  };
}

function mapBetOption(option: DbBetOption) {
  return {
    ...option,
    betId: option.bet_id,
  };
}

function mapBet(bet: DbBet) {
  return {
    ...bet,
    creatorId: bet.creator_id,
    winningOptionId: bet.winning_option_id,
    options: (bet.bet_options ?? []).map(mapBetOption),
  };
}

// ==========================================
// 1. UTILISATEURS
// ==========================================

export async function getCurrentUser() {
  const { data, error } = await supabase.from('users').select('*').limit(1).single();
  if (error) return null;
  
  // Traduction SQL vers React
  return {
    ...data,
    name: data.username,
    nuggets: data.nuggets_balance
  };
}

export async function fetchUsers() {
  const { data, error } = await supabase.from('users').select('*').order('nuggets_balance', { ascending: false });
  if (error) throw error;
  
  return data.map((user: any) => ({
    ...user,
    name: user.username,
    nuggets: user.nuggets_balance
  }));
}

// ==========================================
// 2. PARIS (BETS)
// ==========================================

export async function fetchBets() {
  const { data, error } = await supabase
    .from('bets')
    .select('*, bet_options (*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // TRADUCTION SQL vers React : On transforme "bet_options" en "options"
  return data.map((bet: any) => ({
    ...bet,
    creatorId: bet.creator_id,
    winningOptionId: bet.winning_option_id,
    options: bet.bet_options || [] // C'est cette ligne qui répare ton crash !
  }));
}
export async function createBet(input: CreateBetInput) {
  const { data: bet, error: betError } = await supabase
    .from("bets")
    .insert([
      {
        title: input.title,
        description: input.description,
        creator_id: input.creator_id,
        status: "open",
        winning_option_id: null,
      },
    ])
    .select("id")
    .single();

  if (betError) {
    throw new Error(betError.message || "Impossible de créer le pari.");
  }

  const { error: optionsError } = await supabase.from("bet_options").insert([
    {
      bet_id: bet.id,
      title: input.option_1_title,
      odds: input.option_1_odds,
    },
    {
      bet_id: bet.id,
      title: input.option_2_title,
      odds: input.option_2_odds,
    },
  ]);

  if (optionsError) {
    throw new Error(optionsError.message || "Impossible de créer les options.");
  }

  return bet;
}

export async function closeBet(betId: string) {
  const { error } = await supabase.from("bets").update({ status: "closed" }).eq("id", betId);
  if (error) {
    throw new Error(error.message || "Impossible de fermer le pari.");
  }
}

export async function resolveBet(betId: string, winningOptionId: string) {
  const { error: betError } = await supabase
    .from("bets")
    .update({ status: "resolved", winning_option_id: winningOptionId, resolved_at: new Date().toISOString() })
    .eq("id", betId);

  if (betError) {
    throw new Error(betError.message || "Impossible de résoudre le pari.");
  }

  const { data: wagers, error: wagersError } = await supabase
    .from("wagers")
    .select("id, user_id, option_id, potential_payout")
    .eq("bet_id", betId)
    .eq("status", "pending");

  if (wagersError) {
    throw new Error(wagersError.message || "Impossible de récupérer les mises du pari.");
  }

  const pendingWagers = (wagers ?? []) as Array<{
    id: string;
    user_id: string;
    option_id: string;
    potential_payout: number;
  }>;

  const winners = pendingWagers.filter((wager) => wager.option_id === winningOptionId);
  const losers = pendingWagers.filter((wager) => wager.option_id !== winningOptionId);

  if (winners.length > 0) {
    const { error: winnerUpdateError } = await supabase
      .from("wagers")
      .update({ status: "won" })
      .in(
        "id",
        winners.map((w) => w.id),
      );

    if (winnerUpdateError) {
      throw new Error(winnerUpdateError.message || "Impossible de marquer les gagnants.");
    }
  }

  if (losers.length > 0) {
    const { error: loserUpdateError } = await supabase
      .from("wagers")
      .update({ status: "lost" })
      .in(
        "id",
        losers.map((w) => w.id),
      );

    if (loserUpdateError) {
      throw new Error(loserUpdateError.message || "Impossible de marquer les perdants.");
    }
  }

  const payoutByUser = new Map<string, number>();
  for (const winner of winners) {
    payoutByUser.set(winner.user_id, (payoutByUser.get(winner.user_id) ?? 0) + winner.potential_payout);
  }

  for (const [userId, payout] of payoutByUser) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("nuggets_balance")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new Error(userError?.message || "Utilisateur gagnant introuvable.");
    }

    const { error: creditError } = await supabase
      .from("users")
      .update({ nuggets_balance: (user.nuggets_balance as number) + payout })
      .eq("id", userId);

    if (creditError) {
      throw new Error(creditError.message || "Impossible de créditer les gains.");
    }
  }

  return winners.reduce((sum, wager) => sum + wager.potential_payout, 0);
}

export async function deleteBet(betId: string) {
  const { error: wagersError } = await supabase.from("wagers").delete().eq("bet_id", betId);
  if (wagersError) {
    throw new Error(wagersError.message || "Impossible de supprimer les mises associées.");
  }

  const { error: optionsError } = await supabase.from("bet_options").delete().eq("bet_id", betId);
  if (optionsError) {
    throw new Error(optionsError.message || "Impossible de supprimer les options associées.");
  }

  const { error } = await supabase.from("bets").delete().eq("id", betId);
  if (error) {
    throw new Error(error.message || "Impossible de supprimer le pari.");
  }
}

export async function placeWager(input: PlaceWagerInput) {
  if (input.selections.length === 0) {
    throw new Error("Aucune sélection.");
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("nuggets_balance")
    .eq("id", input.user_id)
    .single();

  if (userError || !user) {
    throw new Error(userError?.message || "Utilisateur introuvable.");
  }

  if ((user.nuggets_balance as number) < input.amount) {
    throw new Error("Solde insuffisant");
  }

  const optionIds = input.selections.map((s) => s.option_id);
  const { data: options, error: optionsError } = await supabase
    .from("bet_options")
    .select("id, bet_id, odds")
    .in("id", optionIds);

  if (optionsError) {
    throw new Error(optionsError.message || "Impossible de récupérer les options.");
  }

  const optionsById = new Map((options ?? []).map((opt) => [opt.id as string, opt as { id: string; bet_id: string; odds: number }]));
  const amountPerSelection = input.amount / input.selections.length;

  const payload = input.selections.map((selection) => {
    const option = optionsById.get(selection.option_id);
    if (!option || option.bet_id !== selection.bet_id) {
      throw new Error("Sélection invalide.");
    }

    return {
      user_id: input.user_id,
      bet_id: selection.bet_id,
      option_id: selection.option_id,
      amount: amountPerSelection,
      potential_payout: amountPerSelection * option.odds,
      status: "pending",
    };
  });

  const { error: wagerError } = await supabase.from("wagers").insert(payload);
  if (wagerError) {
    throw new Error(wagerError.message || "Impossible d'enregistrer la mise.");
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ nuggets_balance: (user.nuggets_balance as number) - input.amount })
    .eq("id", input.user_id);

  if (updateError) {
    throw new Error(updateError.message || "Impossible de mettre à jour le solde.");
  }
}

export async function fetchUserWagers(userId: string) {
  const { data, error } = await supabase
    .from("wagers")
    .select("*, bets(*, bet_options(*)), bet_options(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Impossible de récupérer les mises utilisateur.");
  }

  return ((data ?? []) as DbWager[]).map((wager) => {
    const mappedBet = wager.bets ? mapBet(wager.bets) : null;
    const mappedOption = wager.bet_options ? mapBetOption(wager.bet_options) : null;

    return {
      ...wager,
      userId: wager.user_id,
      betId: wager.bet_id,
      optionId: wager.option_id,
      potentialPayout: wager.potential_payout,
      createdAt: wager.created_at,
      bet: mappedBet,
      option: mappedOption,
      creatorId: mappedBet?.creatorId,
      winningOptionId: mappedBet?.winningOptionId,
      options: mappedBet?.options ?? [],
      bet_title: mappedBet?.title ?? "Pari supprimé",
      option_title: mappedOption?.title ?? "Option supprimée",
    };
  });
}