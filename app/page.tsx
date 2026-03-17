"use client";

import { useState } from "react";
import { AddBetModal } from "@/components/add-bet-modal";
import { AppHeader } from "@/components/app-header";
import { BetCard } from "@/components/bet-card";
import { FloatingAddButton } from "@/components/floating-add-button";
import { mockBets } from "@/lib/mock-data";

export default function HomePage() {
  const [nuggets] = useState(500);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white text-zinc-900">
      <div className="mx-auto w-full max-w-md px-4 pb-24 pt-6 sm:max-w-xl lg:max-w-2xl">
        <AppHeader nuggets={nuggets} />

        <section className="space-y-4">
          {mockBets.map((bet) => (
            <BetCard key={bet.id} bet={bet} />
          ))}
        </section>
      </div>

      <FloatingAddButton onClick={() => setIsModalOpen(true)} />
      <AddBetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
