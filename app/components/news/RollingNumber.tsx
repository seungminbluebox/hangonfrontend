"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RollingNumberProps {
  value: number;
  className?: string;
}

function Digit({ digit }: { digit: string }) {
  const num = parseInt(digit);

  if (isNaN(num)) {
    return <span className="inline-block">{digit}</span>;
  }

  return (
    <div className="relative inline-block w-[1ch] h-[1.2em] overflow-hidden vertical-bottom">
      <motion.div
        animate={{ y: `-${num * 10}%` }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="absolute top-0 left-0 w-full flex flex-col items-center"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div key={n} className="h-[1.2em] flex items-center justify-center">
            {n}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function RollingNumber({ value, className = "" }: RollingNumberProps) {
  const digits = value.toString().split("");

  return (
    <div
      className={`inline-flex items-center tabular-nums leading-none ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {digits.map((digit, idx) => (
          <Digit key={`${digits.length - idx}`} digit={digit} />
        ))}
      </AnimatePresence>
    </div>
  );
}
