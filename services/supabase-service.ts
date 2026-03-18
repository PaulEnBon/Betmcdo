import { supabase } from '../lib/supabase';

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
  
  // TRADUCTION SQL vers React indispensable
  return data.map((bet: any) => ({
    ...bet,
    creatorId: bet.creator_id,
    winningOptionId: bet.winning_option_id,
    options: bet.bet_options || []
  }));
}

export async function createBet(title: string, description: string, creatorId: string, options: { title: string, odds: number }[]) {
  const { data: bet, error: betError } = await supabase
    .from('bets')
    .insert([{ title, description, creator_id: creatorId, status: 'open' }])
    .select()
    .single();

  if (betError) throw betError;

  const optionsToInsert = options.map(opt => ({
    bet_id: bet.id,
    title: opt.title,
    odds: opt.odds
  }));

  const { error: optionsError } = await supabase.from('bet_options').insert(optionsToInsert);
  if (optionsError) throw optionsError;

  return bet;
}

export async function closeBet(betId: string) {
  const { error } = await supabase.from('bets').update({ status: 'closed' }).eq('id', betId);
  if (error) throw error;
  return true;
}

export async function resolveBet(betId: string, winningOptionId: string) {
  const { error: betError } = await supabase
    .from('bets')
    .update({ status: 'resolved', winning_option_id: winningOptionId, resolved_at: new Date().toISOString() })
    .eq('id', betId);
    
  if (betError) throw betError;

  const { data: winningWagers } = await supabase.from('wagers').select('*').eq('bet_id', betId).eq('option_id', winningOptionId);

  if (winningWagers && winningWagers.length > 0) {
    for (const wager of winningWagers) {
      const { data: user } = await supabase.from('users').select('nuggets_balance').eq('id', wager.user_id).single();
      if (user) {
        await supabase.from('users').update({ nuggets_balance: user.nuggets_balance + wager.potential_payout }).eq('id', wager.user_id);
      }
      await supabase.from('wagers').update({ status: 'won' }).eq('id', wager.id);
    }
  }

  await supabase.from('wagers').update({ status: 'lost' }).eq('bet_id', betId).neq('option_id', winningOptionId);
  return true;
}

export async function deleteBet(betId: string) {
  const { error } = await supabase.from('bets').delete().eq('id', betId);
  if (error) throw error;
  return true;
}

// ==========================================
// 3. MISES (WAGERS)
// ==========================================

export async function placeWager(userId: string, betId: string, optionId: string, amount: number, potentialPayout: number) {
  const { data: user } = await supabase.from('users').select('nuggets_balance').eq('id', userId).single();
  if (!user || user.nuggets_balance < amount) {
    throw new Error("Solde insuffisant");
  }

  const { error: wagerError } = await supabase
    .from('wagers')
    .insert([{
      user_id: userId,
      bet_id: betId,
      option_id: optionId,
      amount,
      potential_payout: potentialPayout,
      status: 'pending'
    }]);

  if (wagerError) throw wagerError;

  const { error: updateError } = await supabase
    .from('users')
    .update({ nuggets_balance: user.nuggets_balance - amount })
    .eq('id', userId);

  if (updateError) throw updateError;

  return true;
}

export async function fetchUserWagers(userId: string) {
  const { data, error } = await supabase
    .from('wagers')
    .select('*, bets(*), bet_options(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}