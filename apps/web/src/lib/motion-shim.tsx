import React from 'react';

// Minimal motion shim to avoid depending on motion/react during build.
// Exports `motion` proxy and `AnimatePresence` passthrough.

function createElementFactory(tag: string) {
  return function MotionElement(props: any) {
    const { children, ...rest } = props || {};
    // Strip motion-related props so they are not passed to DOM elements
    const {
      initial,
      animate,
      exit,
      transition,
      variants,
      whileHover,
      whileTap,
      ...domProps
    } = rest || {};
    return React.createElement(tag, domProps, children);
  };
}

// Cache created factories to ensure stable component identity across renders
const motionCache: Map<string, React.ComponentType<any>> = new Map();
const motion = new Proxy(
  {},
  {
    get: (_target, prop: string) => {
      const key = String(prop);
      if (motionCache.has(key)) return motionCache.get(key) as any;
      const factory = createElementFactory(key);
      // set a displayName for easier debugging
      (factory as any).displayName = `Motion.${key}`;
      motionCache.set(key, factory);
      return factory;
    },
    apply: () => {
      return null;
    },
  }
);

export const AnimatePresence = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export { motion };

export default motion;
