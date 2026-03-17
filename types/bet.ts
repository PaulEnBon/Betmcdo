export type Bet = {
  id: number;
  title: string;
  participants: string[];
  optionA: {
    label: string;
    pot: number;
  };
  optionB: {
    label: string;
    pot: number;
  };
};
