import { AnalysisPhase } from '@/types/analysis';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const phases: { key: AnalysisPhase; label: string }[] = [
  { key: 'validating', label: 'Validando imagem' },
  { key: 'detecting_components', label: 'Detectando componentes' },
  { key: 'analyzing_connections', label: 'Mapeando conexões' },
  { key: 'stride_analysis', label: 'Análise STRIDE' },
  { key: 'generating_report', label: 'Gerando relatório' },
  { key: 'completed', label: 'Análise completa' },
];

interface AnalysisProgressProps {
  currentPhase: AnalysisPhase;
  progress: number;
  message: string;
  imageUrl?: string;
}

export const AnalysisProgress = ({ currentPhase, progress, message, imageUrl }: AnalysisProgressProps) => {
  const currentIndex = phases.findIndex(p => p.key === currentPhase);

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Global progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progresso geral</span>
          <span className="font-mono text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 [&>div]:bg-primary" />
      </div>

      <div className="flex gap-8">
        {/* Stepper */}
        <div className="flex-1 space-y-1">
          {phases.map((phase, i) => {
            const isCompleted = i < currentIndex;
            const isActive = i === currentIndex;
            const isPending = i > currentIndex;

            return (
              <motion.div
                key={phase.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-all',
                  isActive && 'glass-card pulse-glow',
                  isPending && 'opacity-40'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0',
                  isCompleted && 'bg-severity-low/20 text-severity-low',
                  isActive && 'bg-primary/20 text-primary',
                  isPending && 'bg-muted text-muted-foreground'
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : i + 1}
                </div>
                <span className={cn(
                  'text-sm font-medium',
                  isActive && 'text-primary',
                  isCompleted && 'text-severity-low',
                  isPending && 'text-muted-foreground'
                )}>
                  {phase.label}
                </span>
              </motion.div>
            );
          })}

          {message && (
            <motion.p
              key={message}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground mt-4 pl-3"
            >
              {message}
            </motion.p>
          )}
        </div>

        {/* Diagram preview */}
        {imageUrl && (
          <div className="hidden md:block w-80 flex-shrink-0">
            <div className="glass-card rounded-xl overflow-hidden opacity-60">
              <img src={imageUrl} alt="Diagram" className="w-full h-auto object-contain p-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
