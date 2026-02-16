// @ts-nocheck
"use client";

import { AnimatePresence, cubicBezier, motion } from "motion/react";
import { useEffect } from "react";

import { useHeaderContext } from "@/components/shared/header/HeaderContext";
import { lockBody } from "@/components/shared/lockBody";
import AnimatedHeight from "@/components/shared/layout/animated-height";
import { WorkflowsDropdown } from "@/components/shared/header/Nav/Nav";
export default function HeaderDropdownWrapper() {
  const {
    activeDropdownId,
    resetDropdownTimeout,
    clearDropdown,
    dropdownKey,
    headerHeight,
    headerTop,
  } = useHeaderContext();

  // Get dropdown content based on activeDropdownId
  const getDropdownContent = () => {
    if (activeDropdownId === 'Workflows') {
      return <WorkflowsDropdown />;
    }
    return null;
  };

  const dropdownContent = getDropdownContent();

  useEffect(() => {
    // Disabled body lock to prevent interference with app navigation
    // lockBody("header-dropdown", !!dropdownContent);
  }, [dropdownContent]);

  return (
    <AnimatePresence>
      {dropdownContent && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed left-0 right-0 h-screen z-[102] bg-black/10"
          exit={{
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
          initial={{ opacity: 0 }}
          style={{
            top: headerTop.current + headerHeight.current,
          }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            className="overlay"
            onClick={() => {
              clearDropdown(true);
            }}
            onMouseEnter={() => {
              // Removed aggressive auto-close on mouse enter to allow dropdown interaction
            }}
          />

          <AnimatedHeight
            animate={{
              transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }}
            className="overflow-clip relative"
            exit={{
              height: 0,
              transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
            }}
            initial={{ height: 0 }}
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                className="bg-white hide-scrollbar relative overflow-x-clip overflow-y-auto mx-auto max-w-md rounded-12 shadow-lg shadow-black/5 border border-neutral-200 pt-4"
                key={dropdownKey}
                style={{
                  maxHeight: `calc(100vh - ${headerTop.current + headerHeight.current}px)`,
                }}
                onMouseEnter={resetDropdownTimeout}
                onMouseLeave={() => {
                  if (window.innerWidth < 996) return;
                  clearDropdown();
                }}
              >
                <motion.div
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95, pointerEvents: "none" }}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  {dropdownContent}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </AnimatedHeight>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
