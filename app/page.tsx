"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AddBetModal } from "@/components/add-bet-modal";
import { AppHeader } from "@/components/app-header";
import { BetCard } from "@/components/bet-card";
import { BottomTabBar, Tab } from "@/components/bottom-tab-bar";
import { FloatingAddButton } from "@/components/floating-add-button";
import { Leaderboard } from "@/components/leaderboard";
import { useNuggetContext } from "@/context/NuggetContext";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" as const },
  },
};

export default function HomePage() {
  const { nuggets, bets } = useNuggetContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("bets");

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white text-zinc-900">
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-6 sm:max-w-xl lg:max-w-2xl">
        <AppHeader nuggets={nuggets} />

        {activeTab === "bets" ? (
          <motion.section
            className="space-y-4"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {bets.map((bet) => (
              <motion.div key={bet.id} variants={cardVariants}>
                <BetCard bet={bet} />
              </motion.div>
            ))}
          </motion.section>
        ) : (
          <Leaderboard />
        )}
      </div>

      {activeTab === "bets" && <FloatingAddButton onClick={() => setIsModalOpen(true)} />}
      <AddBetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}
