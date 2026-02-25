import React from 'react';

// Minimal motion shim to avoid depending on motion/react during build.
// Exports `motion` proxy and `AnimatePresence` passthrough.

function createElementFactory(tag: string) {
  return (props: any) => {
    const { children, ...rest } = props || {};
    return React.createElement(tag, rest, children);
  };
}

const motion = new Proxy(
  {},
  {
    get: (_target, prop: string) => {
      // allow `motion.div`, `motion.button`, etc.
      return createElementFactory(prop as string);
    },
    apply: () => {
      return null;
    },
  }
);

export const AnimatePresence = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export { motion };

export default motion;
