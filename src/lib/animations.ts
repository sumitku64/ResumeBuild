// Animation configuration and utilities
export const animations = {
  // Timing functions
  spring: {
    type: "spring",
    damping: 25,
    stiffness: 300,
  },
  smooth: {
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1],
  },
  quick: {
    duration: 0.15,
    ease: "easeOut",
  },
  slow: {
    duration: 0.5,
    ease: "easeInOut",
  },

  // Common animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },

  slideInFromLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.3 },
  },

  slideInFromRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: 0.3 },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },

  // Hover animations
  buttonHover: {
    whileHover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    },
  },

  cardHover: {
    whileHover: { 
      y: -2,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2 }
    },
  },

  iconHover: {
    whileHover: { 
      rotate: 5,
      scale: 1.1,
      transition: { duration: 0.2 }
    },
  },

  // List animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },

  // Tab animations
  tabContent: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 },
  },

  // Loading animations
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Success/Error animations
  success: {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.2, 1], 
      opacity: 1,
      transition: {
        duration: 0.5,
        times: [0, 0.6, 1],
        ease: "easeOut",
      }
    },
  },

  error: {
    animate: {
      x: [-10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  },

  // Progress animations
  progressBar: {
    initial: { width: "0%" },
    animate: { width: "100%" },
    transition: { duration: 1, ease: "easeOut" },
  },

  // Badge animations
  badgeAppear: {
    initial: { opacity: 0, scale: 0, rotate: -180 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "backOut",
      }
    },
  },

  // Section-specific animations
  sectionSlide: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

// Animation variants for different states
export const buttonStates = {
  idle: { scale: 1, backgroundColor: "var(--primary)" },
  hover: { scale: 1.02, backgroundColor: "var(--primary-hover)" },
  active: { scale: 0.98 },
  disabled: { scale: 1, opacity: 0.5 },
};

export const inputStates = {
  idle: { borderColor: "var(--border)", scale: 1 },
  focus: { 
    borderColor: "var(--primary)", 
    scale: 1.01,
    boxShadow: "0 0 0 2px rgba(var(--primary-rgb), 0.2)",
  },
  error: { 
    borderColor: "var(--destructive)",
    boxShadow: "0 0 0 2px rgba(var(--destructive-rgb), 0.2)",
  },
  success: { 
    borderColor: "var(--success)",
    boxShadow: "0 0 0 2px rgba(var(--success-rgb), 0.2)",
  },
};

// Utility function to get animation based on conditions
export const getConditionalAnimation = (condition: string, type: 'button' | 'card' | 'icon' = 'button') => {
  const baseAnimations = {
    button: animations.buttonHover,
    card: animations.cardHover,
    icon: animations.iconHover,
  };

  const conditionalColors = {
    success: { backgroundColor: "#10b981" },
    warning: { backgroundColor: "#f59e0b" },
    error: { backgroundColor: "#ef4444" },
    info: { backgroundColor: "#3b82f6" },
  };

  return {
    ...baseAnimations[type],
    whileHover: {
      ...baseAnimations[type].whileHover,
      ...(conditionalColors[condition as keyof typeof conditionalColors] || {}),
    },
  };
};

// Animation types
export type AnimationVariant = {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
  whileHover?: object;
  whileTap?: object;
};

// Accessibility: Respect user's motion preferences
export const getReducedMotionAnimation = (animation: AnimationVariant): AnimationVariant => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      ...animation,
      transition: { duration: 0 },
      animate: { ...animation.animate, transition: { duration: 0 } },
    };
  }
  return animation;
};
