import { motion } from 'framer-motion';

export const GridBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-background" />
    <motion.div
      className="absolute inset-0 grid-dots"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    />
    <div className="absolute inset-0 grid-pattern opacity-30" />
    {/* Radial gradient overlay */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]" />
  </div>
);
