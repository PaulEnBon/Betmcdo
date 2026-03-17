"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  closeBet as closeBetService,
  createBet,
  deleteBet as deleteBetService,
  fetchBets,
  fetchCurrentUser,
  fetchUserWagers,
  fetchUsers,
  placeWager,
  resolveBet as resolveBetService,
} from "@/services/db-simulation";
import { BetFilter, BetWithOptions, UserRow, WagerWithContext } from "@/types/bet";

type BetSlipSelection = {
  bet_id: string;
  option_id: string;
  option_title: string;
  odds: number;
};

type NewBetInput = {
  title: string;
  description: string;
  option1: string;
  option2: string;
  odds1: number;
  odds2: number;
};

type PlaceBetResult = {
  ok: boolean;
  reason?: "INSUFFICIENT_FUNDS" | "NO_SELECTION";
};

type ResolveBetResult = {
  ok: boolean;
  payout: number;
  reason?: "ALREADY_RESOLVED";
};

type NuggetContextValue = {
  currentUser: UserRow;
  bets: BetWithOptions[];
  wagers: WagerWithContext[];
  users: UserRow[];
  isLoading: boolean;
  isBetting: boolean;
  activeFilter: BetFilter;
  setActiveFilter: (filter: BetFilter) => void;
  betSlipSelections: BetSlipSelection[];
  selectedOptions: Record<string, string | undefined>;
  addToBetSlip: (betId: string, optionId: string) => "added" | "replaced" | "removed" | "ignored";
  removeFromBetSlip: (betId: string) => void;
  clearBetSlip: () => void;
  placeBet: (amount: number) => Promise<PlaceBetResult>;
  addBet: (newBet: NewBetInput) => Promise<void>;
  closeBet: (betId: string) => Promise<boolean>;
  resolveBet: (betId: string, winningOptionId: string) => Promise<ResolveBetResult>;
  deleteBet: (betId: string) => Promise<boolean>;
  refreshAll: () => Promise<void>;
};

const NuggetContext = createContext<NuggetContextValue | null>(null);

const initialUser: UserRow = {
  id: "user-1",
  username: "Moi",
  nuggets_balance: 500,
  created_at: new Date().toISOString(),
};

export function NuggetProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserRow>(initialUser);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [bets, setBets] = useState<BetWithOptions[]>([]);
  const [wagers, setWagers] = useState<WagerWithContext[]>([]);
  const [activeFilter, setActiveFilter] = useState<BetFilter>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isBetting, setIsBetting] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | undefined>>({});
  const [betSlipSelections, setBetSlipSelections] = useState<BetSlipSelection[]>([]);

  const refreshAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [userData, betsData, wagersData, usersData] = await Promise.all([
        fetchCurrentUser(currentUser.id),
        fetchBets(),
        fetchUserWagers(currentUser.id),
        fetchUsers(),
      ]);

      setCurrentUser(userData);
      setBets(betsData);
      setWagers(wagersData);
      setUsers(usersData);
    } catch (error) {
      toast.error("Impossible de charger les données.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const addToBetSlip = useCallback(
    (betId: string, optionId: string) => {
      const bet = bets.find((item) => item.id === betId);
      if (!bet || bet.status !== "open") return "ignored" as const;

      const selected = bet.options.find((option) => option.id === optionId);
      if (!selected) return "ignored" as const;

      let action: "added" | "replaced" | "removed" = "added";

      setBetSlipSelections((prev) => {
        const existingForBet = prev.find((item) => item.bet_id === betId);

        if (existingForBet?.option_id === optionId) {
          action = "removed";
          return prev.filter((item) => item.bet_id !== betId);
        }

        if (existingForBet) {
          action = "replaced";
        }

        return [
          ...prev.filter((item) => item.bet_id !== betId),
          {
            bet_id: betId,
            option_id: optionId,
            option_title: selected.title,
            odds: selected.odds,
          },
        ];
      });

      return action;
    },
    [bets],
  );

  const removeFromBetSlip = useCallback((betId: string) => {
    setBetSlipSelections((prev) => prev.filter((item) => item.bet_id !== betId));
  }, []);

  const clearBetSlip = useCallback(() => {
    setBetSlipSelections([]);
  }, []);

  const placeBet = useCallback(
    async (amount: number): Promise<PlaceBetResult> => {
      if (betSlipSelections.length === 0) {
        return { ok: false, reason: "NO_SELECTION" };
      }

      if (currentUser.nuggets_balance < amount) {
        return { ok: false, reason: "INSUFFICIENT_FUNDS" };
      }

      try {
        setIsBetting(true);

        await placeWager({
          user_id: currentUser.id,
          selections: betSlipSelections.map((s) => ({ bet_id: s.bet_id, option_id: s.option_id })),
          amount,
        });

        setSelectedOptions((prev) => {
          const next = { ...prev };
          betSlipSelections.forEach((s) => {
            next[s.bet_id] = s.option_id;
          });
          return next;
        });

        setBetSlipSelections([]);
        await refreshAll();
        return { ok: true };
      } catch (error) {
        toast.error("Échec de placement du pari.");
        console.error(error);
        return { ok: false, reason: "INSUFFICIENT_FUNDS" };
      } finally {
        setIsBetting(false);
      }
    },
    [betSlipSelections, currentUser.id, currentUser.nuggets_balance, refreshAll],
  );

  const addBet = useCallback(
    async (newBet: NewBetInput) => {
      try {
        setIsLoading(true);
        await createBet({
          creator_id: currentUser.id,
          title: newBet.title,
          description: newBet.description,
          option_1_title: newBet.option1,
          option_1_odds: newBet.odds1,
          option_2_title: newBet.option2,
          option_2_odds: newBet.odds2,
        });
        await refreshAll();
      } catch (error) {
        toast.error("Échec de création du pari.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser.id, refreshAll],
  );

  const closeBet = useCallback(
    async (betId: string) => {
      try {
        setIsLoading(true);
        await closeBetService(betId);
        await refreshAll();
        return true;
      } catch (error) {
        toast.error("Impossible de bloquer les mises.");
        console.error(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshAll],
  );

  const resolveBet = useCallback(
    async (betId: string, winningOptionId: string): Promise<ResolveBetResult> => {
      try {
        setIsLoading(true);
        const payout = await resolveBetService(betId, winningOptionId);
        await refreshAll();
        return { ok: true, payout };
      } catch (error) {
        console.error(error);
        if (error instanceof Error && error.message.includes("déjà")) {
          return { ok: false, payout: 0, reason: "ALREADY_RESOLVED" };
        }
        toast.error("Impossible de résoudre ce pari.");
        return { ok: false, payout: 0 };
      } finally {
        setIsLoading(false);
      }
    },
    [refreshAll],
  );

  const deleteBet = useCallback(
    async (betId: string) => {
      const target = bets.find((b) => b.id === betId);
      if (!target || target.creator_id !== currentUser.id) {
        return false;
      }

      try {
        setIsLoading(true);
        await deleteBetService(betId);
        setBetSlipSelections((prev) => prev.filter((item) => item.bet_id !== betId));
        await refreshAll();
        return true;
      } catch (error) {
        toast.error("Suppression impossible.");
        console.error(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [bets, currentUser.id, refreshAll],
  );

  const value = useMemo(
    () => ({
      currentUser,
      bets,
      wagers,
      users,
      isLoading,
      isBetting,
      activeFilter,
      setActiveFilter,
      betSlipSelections,
      selectedOptions,
      addToBetSlip,
      removeFromBetSlip,
      clearBetSlip,
      placeBet,
      addBet,
      closeBet,
      resolveBet,
      deleteBet,
      refreshAll,
    }),
    [
      currentUser,
      bets,
      wagers,
      users,
      isLoading,
      isBetting,
      activeFilter,
      betSlipSelections,
      selectedOptions,
      addToBetSlip,
      removeFromBetSlip,
      clearBetSlip,
      placeBet,
      addBet,
      closeBet,
      resolveBet,
      deleteBet,
      refreshAll,
    ],
  );

  return <NuggetContext.Provider value={value}>{children}</NuggetContext.Provider>;
}

export function useNuggetContext() {
  const context = useContext(NuggetContext);
  if (!context) {
    throw new Error("useNuggetContext must be used within NuggetProvider");
  }
  return context;
}

export type { NewBetInput, BetSlipSelection };
