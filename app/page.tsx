"use client";

import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Star, Users, BookOpen, Trophy, Shield, FileText, Cookie, Scale } from "lucide-react";
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
  <div className="min-h-screen flex flex-col bg-[#070b15] ">
  <Header />
  <section className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent pointer-events-none"></div>
  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl opacity-20 animate-pulse"></div>
  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
  
  <motion.div
    className="container mx-auto max-w-7xl relative z-10"
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
  >
  <div className="text-center space-y-6 md:space-y-8">
  <motion.div
    variants={fadeInUp}
    className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500/15 border border-cyan-300/40 rounded-full text-cyan-300 text-sm font-medium backdrop-blur-sm"
  >
  <Star className="w-4 h-4" />
  RPG Textuel Interactif
  </motion.div>

  <motion.h1
    variants={fadeInUp}
    className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white "
  >
  Vivez Votre Propre
  <span className="block mt-2 text-cyan-300">
  Aventure
  </span>
  </motion.h1>

  <motion.p
    variants={fadeInUp}
    className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed px-4"
  >
  Créez votre personnage unique, explorez des mondes fantastiques et prenez des décisions qui façonneront votre destin. Chaque choix compte dans DreamQuest.
  </motion.p>

  <motion.div
    variants={fadeInUp}
    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
  >
  <Link
  href="/create-character"
  prefetch
  className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-all duration-200 w-full sm:w-auto text-center shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
  >
  Créer un Personnage
  </Link>
  
  <Link
  href="/adventure"
  prefetch
  className="px-8 py-3.5 bg-transparent border border-cyan-500/30 hover:border-cyan-400/60 text-gray-200 hover:text-white font-semibold rounded-lg transition-all duration-200 w-full sm:w-auto text-center"
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
    className="group p-6 md:p-8 bg-[#0c1322]/50 border border-cyan-500/20 rounded-xl hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
  >
  <div className="space-y-4">
  <div className="w-12 h-12 bg-cyan-500/20 group-hover:bg-cyan-500/30 rounded-lg flex items-center justify-center transition-colors">
  <Users className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" />
  </div>
  <h3 className="text-xl font-bold text-white">
  Personnages Uniques
  </h3>
  <p className="text-gray-400 text-sm leading-relaxed">
  Créez des héros avec 10 classes différentes, chacune avec ses capacités et son histoire.
  </p>
  </div>
  </motion.div>

  <motion.div
    variants={fadeInUp}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="group p-6 md:p-8 bg-[#0c1322]/50 border border-cyan-500/20 rounded-xl hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
  >
  <div className="space-y-4">
  <div className="w-12 h-12 bg-cyan-500/20 group-hover:bg-cyan-500/30 rounded-lg flex items-center justify-center transition-colors">
  <BookOpen className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" />
  </div>
  <h3 className="text-xl font-bold text-white">
  Histoires Immersives
  </h3>
  <p className="text-gray-400 text-sm leading-relaxed">
  Plongez dans des récits à embranchements multiples où chaque décision compte.
  </p>
  </div>
  </motion.div>

  <motion.div
    variants={fadeInUp}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="group p-6 md:p-8 bg-[#0c1322]/50 border border-cyan-500/20 rounded-xl hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
  >
  <div className="space-y-4">
  <div className="w-12 h-12 bg-cyan-500/20 group-hover:bg-cyan-500/30 rounded-lg flex items-center justify-center transition-colors">
  <Trophy className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" />
  </div>
  <h3 className="text-xl font-bold text-white">
  Classements
  </h3>
  <p className="text-gray-400 text-sm leading-relaxed">
  Comparez vos exploits avec d&apos;autres aventuriers et grimpez dans les rangs.
  </p>
  </div>
  </motion.div>
  </motion.div>
  </div>
  </section>

  {/* Section légale */}
  <section className="border-t border-gray-800/50 bg-[#070b15]/80">
  <div className="container mx-auto px-4 md:px-6 py-8">
  <div className="max-w-4xl mx-auto">
  <h2 className="text-lg font-semibold text-white mb-4 text-center">Informations légales</h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <Link href="/privacy" className="flex items-center gap-2 p-3 bg-[#0c1322]/50 border border-gray-800 rounded-lg hover:border-cyan-500/30 transition-colors group">
  <Shield className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
  <span className="text-gray-400 text-sm group-hover:text-white transition-colors">Confidentialité</span>
  </Link>
  <Link href="/terms" className="flex items-center gap-2 p-3 bg-[#0c1322]/50 border border-gray-800 rounded-lg hover:border-cyan-500/30 transition-colors group">
  <FileText className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
  <span className="text-gray-400 text-sm group-hover:text-white transition-colors">CGU</span>
  </Link>
  <Link href="/cookies" className="flex items-center gap-2 p-3 bg-[#0c1322]/50 border border-gray-800 rounded-lg hover:border-cyan-500/30 transition-colors group">
  <Cookie className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
  <span className="text-gray-400 text-sm group-hover:text-white transition-colors">Cookies</span>
  </Link>
  <Link href="/licenses" className="flex items-center gap-2 p-3 bg-[#0c1322]/50 border border-gray-800 rounded-lg hover:border-cyan-500/30 transition-colors group">
  <Scale className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
  <span className="text-gray-400 text-sm group-hover:text-white transition-colors">Licences</span>
  </Link>
  </div>
  </div>
  </div>
  </section>

  <Footer />
  </div>
  );
}
