import { Analysis } from '@/types/analysis';
import { motion } from 'framer-motion';
import { Clock, Boxes, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentAnalysesProps {
  analyses: Analysis[];
}

export const RecentAnalyses = ({ analyses }: RecentAnalysesProps) => {
  const navigate = useNavigate();

  if (analyses.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Análises recentes
      </h3>
      <div className="space-y-2">
        {analyses.slice(0, 5).map((analysis, i) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(`/analysis/${analysis.id}`)}
            className="glass-card rounded-lg p-3 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="w-12 h-12 rounded bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src={analysis.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {analysis.result?.metadata.provider.toUpperCase()} — {analysis.result?.metadata.diagramType}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(analysis.createdAt), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
              <span className="flex items-center gap-1">
                <Boxes className="w-3 h-3" /> {analysis.result?.metadata.totalComponents}
              </span>
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> {analysis.result?.metadata.totalThreats}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
