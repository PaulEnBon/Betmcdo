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
import { ProfileView } from "@/components/profile-view";
import { SideMenu, SideMenuSection } from "@/components/side-menu";
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
  const { currentUser, isLoading, bets, users, wagers, activeFilter, setActiveFilter } = useNuggetContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("bets");
  const [activeSection, setActiveSection] = useState<SideMenuSection>("home");

  const filteredBets = useMemo(() => {
    if (activeFilter === "all") return bets;
    return bets.filter((bet) => bet.status === activeFilter);
  }, [bets, activeFilter]);

  const filterPills: Array<{ key: BetFilter; label: string }> = [
    { key: "all", label: "Tous" },
    { key: "open", label: "Ouverts" },
    { key: "closed", label: "Fermés" },
    { key: "resolved", label: "Résolus" },
  ];

  const showHome = activeSection === "home";
  const showHistory = activeSection === "history";
  const showRules = activeSection === "rules";

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-6 sm:max-w-xl lg:max-w-2xl">
        <AppHeader user={currentUser} isLoading={isLoading} onOpenMenu={() => setIsSideMenuOpen(true)} />

        {showHistory ? (
          <ProfileView wagers={wagers} />
        ) : showRules ? (
          <section className="rounded-2xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">
            <h2 className="mb-2 text-lg font-extrabold text-slate-100">Règles du jeu</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Les paris sont en Nuggets virtuels uniquement.</li>
              <li>Un pari ouvert accepte des mises; fermé bloque les mises.</li>
              <li>À la résolution, les wagers gagnants sont crédités automatiquement.</li>
            </ul>
          </section>
        ) : activeTab === "bets" && showHome ? (
          <>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {filterPills.map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setActiveFilter(pill.key)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                    activeFilter === pill.key
                      ? "bg-green-500 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <motion.section className="space-y-4" variants={listVariants} initial="hidden" animate="show">
              {filteredBets.map((bet) => (
                <motion.div key={bet.id} variants={cardVariants}>
                  <BetCard bet={bet} />
                </motion.div>
              ))}
            </motion.section>
          </>
        ) : (
          <Leaderboard users={users} />
        )}
      </div>

      {activeTab === "bets" && showHome && <FloatingAddButton onClick={() => setIsModalOpen(true)} />}
      <AddBetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {activeTab === "bets" && showHome && <BetSlip />}
      <BottomTabBar
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          if (tab === "leaderboard") {
            setActiveSection("leaderboard");
          } else {
            setActiveSection("home");
          }
        }}
      />
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        user={currentUser}
        activeSection={activeSection}
        onNavigate={(section) => {
          setActiveSection(section);
          setActiveTab(section === "leaderboard" ? "leaderboard" : "bets");
        }}
      />
    </main>
  );
}
