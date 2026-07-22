"use client";

import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import PageBackground from "@/components/shared/PageBackground";
import { useLanguage } from "@/context/LanguageContext";
import { Zap, Users, BookOpen, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo — sensation premium
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-deep">
      <PageBackground />

      <Header />
      <main>
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
              className="inline-flex items-center gap-2 px-4 h-[37px] bg-cyan-500/10 border border-cyan-500/30 rounded-full text-primary text-[14px]"
            >
              <Zap size={16} />
              {t("home.rpgTag")}
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              style={{
                background:
                  "linear-gradient(90deg,#00d4ff 0%,#3b82f6 50%,#6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("home.heroTitle")}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed px-4"
            >
              {t("home.heroSubtitle")}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            >
              <Link
                href="/create-character"
                prefetch
                className="h-[58px] w-full sm:w-[250px] rounded-card bg-gradient-to-r from-primary to-blue-500 text-white text-[18px] font-semibold flex items-center justify-center shadow-glow hover:opacity-90 hover:scale-102 active:scale-98 transition-all duration-300 ease-out hover:shadow-glow-lg touch-manipulation"
              >
                {t("home.createCharacter")}
              </Link>

              <Link
                href="/adventure"
                prefetch
                className="h-[58px] w-full sm:w-[222px] rounded-card border border-cyan-500/20 text-[#e5e7eb] text-[18px] font-semibold flex items-center justify-center hover:bg-white/5 hover:scale-102 active:scale-98 transition-all duration-300 ease-out touch-manipulation"
              >
                {t("home.exploreQuests")}
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
              whileHover={{
                y: -6,
                transition: {
                  duration: 0.35,
                  ease: [0.25, 1, 0.5, 1] as const, // easeOutQuart — plus doux
                },
              }}
              className="group p-6 md:p-8 backdrop-blur-card bg-slate-900/60 border border-cyan-500/20 rounded-xl hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-[12px] flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {t("home.features.characters.title")}
                </h3>
                <p className="text-[16px] leading-[25.6px] text-gray-400">
                  {t("home.features.characters.description")}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{
                y: -6,
                transition: {
                  duration: 0.35,
                  ease: [0.25, 1, 0.5, 1] as const, // easeOutQuart — plus doux
                },
              }}
              className="group p-6 md:p-8 backdrop-blur-card bg-slate-900/60 border border-cyan-500/20 rounded-xl hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-[12px] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {t("home.features.stories.title")}
                </h3>
                <p className="text-[16px] leading-[25.6px] text-gray-400">
                  {t("home.features.stories.description")}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{
                y: -6,
                transition: {
                  duration: 0.35,
                  ease: [0.25, 1, 0.5, 1] as const, // easeOutQuart — plus doux
                },
              }}
              className="group p-6 md:p-8 backdrop-blur-card bg-slate-900/60 border border-cyan-500/20 rounded-xl hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-[12px] flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {t("home.features.ranking.title")}
                </h3>
                <p className="text-[16px] leading-[25.6px] text-gray-400">
                  {t("home.features.ranking.description")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}







