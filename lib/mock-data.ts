import { Bet } from "@/types/bet";

export const mockBets: Bet[] = [
  {
    id: 1,
    title: "Est-ce que Thomas va renverser son verre avant minuit ?",
    participants: ["Thomas", "Lina", "Max", "Inès"],
    optionA: { label: "Oui, évidemment", pot: 120 },
    optionB: { label: "Non, il est prudent", pot: 80 },
  },
  {
    id: 2,
    title: "Qui arrivera en retard au brunch de dimanche ?",
    participants: ["Sarah", "Noé", "Clara", "Amine", "Léo"],
    optionA: { label: "Team Sarah", pot: 65 },
    optionB: { label: "Team Noé", pot: 95 },
  },
];
