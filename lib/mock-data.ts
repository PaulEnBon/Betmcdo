import { Bet } from "@/types/bet";

export const mockBets: Bet[] = [
  {
    id: "bet-1",
    creatorId: "user-1",
    title: "Est-ce que Thomas va renverser son verre avant minuit ?",
    participants: ["Thomas", "Lina", "Max", "Inès"],
    options: [
      { id: "yes", label: "Oui, évidemment", pot: 120, odds: 1.5 },
      { id: "no", label: "Non, il est prudent", pot: 80, odds: 2.1 },
    ],
    status: "active",
  },
  {
    id: "bet-2",
    creatorId: "user-2",
    title: "Qui arrivera en retard au brunch de dimanche ?",
    participants: ["Sarah", "Noé", "Clara", "Amine", "Léo"],
    options: [
      { id: "sarah", label: "Team Sarah", pot: 65, odds: 1.9 },
      { id: "noe", label: "Team Noé", pot: 95, odds: 1.7 },
    ],
    status: "active",
  },
];
