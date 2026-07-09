'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/components/providers/NavigationProvider';

export default function PageTransition({ children }) {
  const { isAnimating } = useNavigation();

  return (
    <>
      <AnimatePresence mode="wait">
        {isAnimating && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 1, 0] }}
            transition={{
              duration: 2,
              times: [0, 0.25, 0.75, 1],
              ease: "easeInOut"
            }}
            className="fixed inset-0 z-[100] bg-gold origin-top flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center"
            >
              <motion.h1
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{
    duration: 0.6,
    delay: 0.5
  }}
>
  MAKHSOOS
</motion.h1>
              <motion.div
                className="mt-4 flex justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-obsidian"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
