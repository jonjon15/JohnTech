"use client"
import React from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import CustomCursor from "@/components/CustomCursor"
import ParticlesBg from "@/components/ParticlesBg"

const LayoutWithTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="relative min-h-screen"
      >
        <ParticlesBg />
        <CustomCursor />
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default LayoutWithTransition
