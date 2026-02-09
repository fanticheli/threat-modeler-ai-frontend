import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface RiskScoreGaugeProps {
  score: number;
  size?: number;
}

export const RiskScoreGauge = ({ score, size = 160 }: RiskScoreGaugeProps) => {
  const { color, label } = useMemo(() => {
    if (score <= 25) return { color: 'hsl(var(--severity-low))', label: 'LOW RISK' };
    if (score <= 50) return { color: 'hsl(var(--severity-medium))', label: 'MODERATE' };
    if (score <= 75) return { color: 'hsl(var(--severity-high))', label: 'HIGH RISK' };
    return { color: 'hsl(var(--severity-critical))', label: 'CRITICAL' };
  }, [score]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-mono font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
    </div>
  );
};
