"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { mockBets } from "@/lib/mock-data";
import { Bet, User } from "@/types/bet";

type BetSlipSelection = {
  betId: string;
  optionId: string;
  optionLabel: string;
  odds: number;
};

type PlacedBet = {
  id: string;
  legs: BetSlipSelection[];
  amount: number;
  combinedOdds: number;
  settled: boolean;
  outcome?: "won" | "lost";
};

type NewBetInput = {
  title: string;
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
  currentUser: User;
  isLoading: boolean;
  bets: Bet[];
  betSlipSelections: BetSlipSelection[];
  selectedOptions: Record<string, string | undefined>;
  addToBetSlip: (betId: string, optionId: string) => "added" | "replaced" | "removed" | "ignored";
  removeFromBetSlip: (betId: string) => void;
  clearBetSlip: () => void;
  placeBet: (amount: number) => Promise<PlaceBetResult>;
  addBet: (newBet: NewBetInput) => Promise<void>;
  resolveBet: (betId: string, winningOptionId: string) => Promise<ResolveBetResult>;
  deleteBet: (betId: string) => Promise<boolean>;
};

const NuggetContext = createContext<NuggetContextValue | null>(null);
const fakeLatency = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export function NuggetProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>({
    id: "user-1",
    name: "Moi",
    nuggets: 500,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [bets, setBets] = useState<Bet[]>(mockBets);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | undefined>>({});
  const [betSlipSelections, setBetSlipSelections] = useState<BetSlipSelection[]>([]);
  const [, setPlacedBets] = useState<PlacedBet[]>([]);

  const addToBetSlip = useCallback((betId: string, optionId: string) => {
    const bet = bets.find((item) => item.id === betId);
    if (!bet || bet.status !== "active") return "ignored" as const;

    const selected = bet.options.find((option) => option.id === optionId);
    if (!selected) return "ignored" as const;

    let action: "added" | "replaced" | "removed" = "added";

    setBetSlipSelections((prev) => {
      const existingForBet = prev.find((item) => item.betId === betId);

      if (existingForBet?.optionId === optionId) {
        action = "removed";
        return prev.filter((item) => item.betId !== betId);
      }

      if (existingForBet) {
        action = "replaced";
      }

      const nextSelection: BetSlipSelection = {
        betId,
        optionId,
        optionLabel: selected.label,
        odds: selected.odds,
      };

      return [...prev.filter((item) => item.betId !== betId), nextSelection];
    });

    return action;
  }, [bets]);

  const removeFromBetSlip = useCallback((betId: string) => {
    setBetSlipSelections((prev) => prev.filter((item) => item.betId !== betId));
  }, []);

  const clearBetSlip = useCallback(() => {
    setBetSlipSelections([]);
  }, []);

  const placeBet = useCallback(async (amount: number): Promise<PlaceBetResult> => {
    setIsLoading(true);
    await fakeLatency();

    if (betSlipSelections.length === 0) {
      setIsLoading(false);
      return { ok: false, reason: "NO_SELECTION" };
    }

    if (currentUser.nuggets < amount) {
      setIsLoading(false);
      return { ok: false, reason: "INSUFFICIENT_FUNDS" };
    }

    const combinedOdds = betSlipSelections.reduce((acc, leg) => acc * leg.odds, 1);
    const amountPerSelection = amount / betSlipSelections.length;

    setCurrentUser((prev) => ({ ...prev, nuggets: prev.nuggets - amount }));

    setSelectedOptions((prev) => {
      const next = { ...prev };
      betSlipSelections.forEach((leg) => {
        next[leg.betId] = leg.optionId;
      });
      return next;
    });

    setPlacedBets((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        legs: betSlipSelections,
        amount,
        combinedOdds,
        settled: false,
      },
    ]);

    setBets((prev) =>
      prev.map((bet) => {
        const selectedLeg = betSlipSelections.find((leg) => leg.betId === bet.id);
        if (!selectedLeg) return bet;

        return {
          ...bet,
          options: bet.options.map((option) =>
            option.id === selectedLeg.optionId
              ? { ...option, pot: option.pot + amountPerSelection }
              : option,
          ) as Bet["options"],
        };
      }),
    );

    setBetSlipSelections([]);
    setIsLoading(false);

    return { ok: true };
  }, [betSlipSelections, currentUser.nuggets]);

  const resolveBet = useCallback(async (betId: string, winningOptionId: string): Promise<ResolveBetResult> => {
    setIsLoading(true);
    await fakeLatency();

    const targetBet = bets.find((bet) => bet.id === betId);
    if (!targetBet) {
      setIsLoading(false);
      return { ok: false, payout: 0 };
    }

    if (targetBet.status === "resolved") {
      setIsLoading(false);
      return { ok: false, payout: 0, reason: "ALREADY_RESOLVED" };
    }

    let payout = 0;

    const nextBets = bets.map((bet) =>
      bet.id === betId
        ? {
            ...bet,
            status: "resolved" as const,
            winningOptionId,
          }
        : bet,
    );

    const resolvedBetMap = new Map(nextBets.map((bet) => [bet.id, bet]));

    setPlacedBets((prev) =>
      prev.map((ticket) => {
        if (ticket.settled) return ticket;

        const legsResult = ticket.legs.map((leg) => {
          const legBet = resolvedBetMap.get(leg.betId);

          if (!legBet || legBet.status !== "resolved") {
            return "pending" as const;
          }

          return legBet.winningOptionId === leg.optionId ? "won" as const : "lost" as const;
        });

        if (legsResult.includes("lost")) {
          return {
            ...ticket,
            settled: true,
            outcome: "lost",
          };
        }

        if (legsResult.every((result) => result === "won")) {
          payout += ticket.amount * ticket.combinedOdds;

          return {
            ...ticket,
            settled: true,
            outcome: "won",
          };
        }

        return ticket;
      }),
    );

    if (payout > 0) {
      setCurrentUser((prev) => ({ ...prev, nuggets: prev.nuggets + payout }));
    }

    setBets(nextBets);
    setIsLoading(false);

    return { ok: true, payout };
  }, [bets]);

  const addBet = useCallback(async (newBet: NewBetInput) => {
    setIsLoading(true);
    await fakeLatency();

    setBets((prev) => {
      const nextId = `bet-${Date.now()}`;

      const createdBet: Bet = {
        id: nextId,
        creatorId: currentUser.id,
        title: newBet.title,
        participants: [currentUser.name, "Lina", "Max"],
        options: [
          {
            id: `o1-${nextId}`,
            label: newBet.option1,
            pot: 0,
            odds: newBet.odds1,
          },
          {
            id: `o2-${nextId}`,
            label: newBet.option2,
            pot: 0,
            odds: newBet.odds2,
          },
        ],
        status: "active",
      };

      return [createdBet, ...prev];
    });

    setIsLoading(false);
  }, [currentUser.id, currentUser.name]);

  const deleteBet = useCallback(async (betId: string) => {
    setIsLoading(true);
    await fakeLatency();

    const bet = bets.find((item) => item.id === betId);
    if (!bet || bet.creatorId !== currentUser.id) {
      setIsLoading(false);
      return false;
    }

    setBets((prev) => prev.filter((item) => item.id !== betId));
    setBetSlipSelections((prev) => prev.filter((item) => item.betId !== betId));
    setSelectedOptions((prev) => {
      const next = { ...prev };
      delete next[betId];
      return next;
    });
    setPlacedBets((prev) => prev.filter((ticket) => !ticket.legs.some((leg) => leg.betId === betId)));
    setIsLoading(false);
    return true;
  }, [bets, currentUser.id]);

  const value = useMemo(
    () => ({
      currentUser,
      isLoading,
      bets,
      betSlipSelections,
      selectedOptions,
      addToBetSlip,
      removeFromBetSlip,
      clearBetSlip,
      placeBet,
      addBet,
      resolveBet,
      deleteBet,
    }),
    [
      currentUser,
      isLoading,
      bets,
      betSlipSelections,
      selectedOptions,
      addToBetSlip,
      removeFromBetSlip,
      clearBetSlip,
      placeBet,
      addBet,
      resolveBet,
      deleteBet,
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

export type { NewBetInput };
