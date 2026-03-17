"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AddBetModal } from "@/components/add-bet-modal";
import { AppHeader } from "@/components/app-header";
import { BetCard } from "@/components/bet-card";
import { BetSlip } from "@/components/bet-slip";
import { BottomTabBar, Tab } from "@/components/bottom-tab-bar";
import { FloatingAddButton } from "@/components/floating-add-button";
import { Leaderboard } from "@/components/leaderboard";
import { SideMenu } from "@/components/side-menu";
import { useNuggetContext } from "@/context/NuggetContext";
import { BetFilter } from "@/types/bet";

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
  const { currentUser, isLoading, bets } = useNuggetContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("bets");
  const [filter, setFilter] = useState<BetFilter>("all");

  const filteredBets = useMemo(() => {
    if (filter === "all") return bets;
    return bets.filter((bet) => bet.status === filter);
  }, [bets, filter]);

  const filterPills: Array<{ key: BetFilter; label: string }> = [
    { key: "all", label: "Tous" },
    { key: "active", label: "En cours" },
    { key: "resolved", label: "Terminés" },
  ];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-6 sm:max-w-xl lg:max-w-2xl">
        <AppHeader user={currentUser} isLoading={isLoading} onOpenMenu={() => setIsSideMenuOpen(true)} />

        {activeTab === "bets" ? (
          <>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {filterPills.map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setFilter(pill.key)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                    filter === pill.key
                      ? "bg-green-500 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <motion.section
              className="space-y-4"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              {filteredBets.map((bet) => (
                <motion.div key={bet.id} variants={cardVariants}>
                  <BetCard bet={bet} />
                </motion.div>
              ))}
            </motion.section>
          </>
        ) : (
          <Leaderboard />
        )}
      </div>

      {activeTab === "bets" && <FloatingAddButton onClick={() => setIsModalOpen(true)} />}
      <AddBetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {activeTab === "bets" && <BetSlip />}
      <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} user={currentUser} />
    </main>
  );
}
