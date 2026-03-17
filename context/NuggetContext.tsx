"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { mockBets } from "@/lib/mock-data";
import { Bet } from "@/types/bet";

type OptionId = "optionA" | "optionB";

type NewBetInput = {
  title: string;
  option1: string;
  option2: string;
};

type PlaceBetResult = {
  ok: boolean;
  reason?: "INSUFFICIENT_FUNDS";
};

type NuggetContextValue = {
  nuggets: number;
  bets: Bet[];
  selectedOptions: Record<number, OptionId | undefined>;
  placeBet: (betId: number, optionId: OptionId, amount?: number) => PlaceBetResult;
  addBet: (newBet: NewBetInput) => void;
};

const NuggetContext = createContext<NuggetContextValue | null>(null);

export function NuggetProvider({ children }: { children: React.ReactNode }) {
  const [nuggets, setNuggets] = useState(500);
  const [bets, setBets] = useState<Bet[]>(mockBets);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, OptionId | undefined>>({});

  const placeBet = useCallback((betId: number, optionId: OptionId, amount = 50): PlaceBetResult => {
    if (nuggets < amount) {
      return { ok: false, reason: "INSUFFICIENT_FUNDS" };
    }

    setNuggets((prev) => prev - amount);
    setSelectedOptions((prev) => ({ ...prev, [betId]: optionId }));

    setBets((prev) =>
      prev.map((bet) => {
        if (bet.id !== betId) return bet;

        if (optionId === "optionA") {
          return {
            ...bet,
            optionA: {
              ...bet.optionA,
              pot: bet.optionA.pot + amount,
            },
          };
        }

        return {
          ...bet,
          optionB: {
            ...bet.optionB,
            pot: bet.optionB.pot + amount,
          },
        };
      }),
    );

    return { ok: true };
  }, [nuggets]);

  const addBet = useCallback((newBet: NewBetInput) => {
    setBets((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((bet) => bet.id)) + 1 : 1;

      const createdBet: Bet = {
        id: nextId,
        title: newBet.title,
        participants: ["Vous", "Lina", "Max"],
        optionA: {
          label: newBet.option1,
          pot: 0,
        },
        optionB: {
          label: newBet.option2,
          pot: 0,
        },
      };

      return [createdBet, ...prev];
    });
  }, []);

  const value = useMemo(
    () => ({
      nuggets,
      bets,
      selectedOptions,
      placeBet,
      addBet,
    }),
    [nuggets, bets, selectedOptions, placeBet, addBet],
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

export type { OptionId, NewBetInput };
