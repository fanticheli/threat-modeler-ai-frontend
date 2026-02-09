import { Threat } from '@/types/analysis';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ThreatCardProps {
  threat: Threat;
  componentName: string;
  index: number;
}

export const ThreatCard = ({ threat, componentName, index }: ThreatCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheck = (i: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn('glass-card rounded-lg overflow-hidden', `severity-${threat.severity}`)}
    >
      <div
        className="p-4 cursor-pointer flex items-start gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <SeverityBadge severity={threat.severity} />
            <Badge variant="outline" className="text-[10px]">{componentName}</Badge>
          </div>
          <h4 className="text-sm font-medium mt-2">{threat.title}</h4>
        </div>
        <button className="text-muted-foreground flex-shrink-0 mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-4 space-y-3"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">{threat.description}</p>

          {threat.countermeasures.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Contramedidas</p>
              {threat.countermeasures.map((cm, i) => (
                <div
                  key={i}
                  onClick={(e) => { e.stopPropagation(); toggleCheck(i); }}
                  className={cn(
                    'flex items-start gap-2 text-sm p-2 rounded cursor-pointer transition-colors',
                    checkedItems.has(i) ? 'bg-severity-low/10 text-severity-low line-through opacity-70' : 'hover:bg-muted/30'
                  )}
                >
                  {checkedItems.has(i)
                    ? <CheckCircle2 className="w-4 h-4 text-severity-low flex-shrink-0 mt-0.5" />
                    : <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  }
                  <span>{cm}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
