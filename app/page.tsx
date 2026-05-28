"use client";

import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Zap, Users, BookOpen, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b15]">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(148deg,#0c0e1a 0%,#0f1729 25%,#1a1f3a 50%,#0f1729 75%,#0c0e1a 100%)",
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-[40px]"
          style={{
            background: "rgba(6,182,212,0.10)",
            left: "25%",
            top: 0,
            opacity: 0.83,
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-[40px]"
          style={{
            background: "rgba(59,130,246,0.10)",
            right: "25%",
            top: "696px",
            opacity: 0.51,
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-[40px]"
          style={{
            background: "rgba(99,102,241,0.10)",
            left: "51.54%",
            top: "505px",
            opacity: 0.93,
          }}
        />
      </div>

      <Header />
      <section className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden">
        <motion.div
          className="container mx-auto max-w-7xl relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center space-y-6 md:space-y-8">
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 h-[37px] bg-[rgba(6,182,212,0.10)] border border-[rgba(6,182,212,0.3)] rounded-full text-[#06b6d4] text-[14px]"
            >
              <Zap size={16} />
              RPG Textuel Interactif
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              style={{
                background:
                  "linear-gradient(90deg,#06b6d4 0%,#3b82f6 50%,#6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Vivez Votre Propre Aventure
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed px-4"
            >
              Créez votre personnage unique, explorez des mondes fantastiques et
              prenez des décisions qui façonneront votre destin. Chaque choix
              compte dans DreamQuest.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            >
              <Link
                href="/create-character"
                prefetch
                className="h-[58px] w-[250px] rounded-[10px] bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white text-[18px] font-semibold flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(6,182,212,0.5)] hover:opacity-90 transition-opacity"
              >
                Créer un Personnage
              </Link>

              <Link
                href="/adventure"
                prefetch
                className="h-[58px] w-[222px] rounded-[10px] border border-[rgba(6,182,212,0.2)] text-[#e5e7eb] text-[18px] font-semibold flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                Explorer les Quêtes
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="grid md:grid-cols-3 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group p-6 md:p-8 backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-cyan-500/20 rounded-xl hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] rounded-[12px] flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Personnages Uniques
                </h3>
                <p className="text-[16px] leading-[25.6px] text-gray-400">
                  Créez des héros avec 10 classes différentes, chacune avec ses
                  capacités et son histoire.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group p-6 md:p-8 backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-cyan-500/20 rounded-xl hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] rounded-[12px] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Histoires Immersives
                </h3>
                <p className="text-[16px] leading-[25.6px] text-gray-400">
                  Plongez dans des récits à embranchements multiples où chaque
                  décision compte.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group p-6 md:p-8 backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-cyan-500/20 rounded-xl hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] rounded-[12px] flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Classements</h3>
                <p className="text-[16px] leading-[25.6px] text-gray-400">
                  Comparez vos exploits avec d&apos;autres aventuriers et
                  grimpez dans les rangs.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
