import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShieldAlert, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { GridBackground } from '@/components/GridBackground';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import { Analysis } from '@/types/analysis';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const providerColors: Record<string, string> = {
  aws: 'text-severity-medium',
  azure: 'text-primary',
  gcp: 'text-severity-low',
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.listAnalyses()
      .then(setAnalyses)
      .catch(() => toast.error('Erro ao carregar histórico'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
      toast.success('Análise removida');
    } catch {
      toast.error('Erro ao remover análise');
    }
  };

  const filtered = analyses.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.result?.metadata.provider.toLowerCase().includes(q) ||
      a.result?.metadata.diagramType.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen relative">
      <GridBackground />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-mono font-bold text-gradient">Histórico de Análises</h1>
            <p className="text-sm text-muted-foreground">{analyses.length} análises realizadas</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por provider, tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 glass-card border-muted"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-xl p-12 text-center"
          >
            <ShieldAlert className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {analyses.length === 0
                ? 'Nenhuma análise realizada ainda'
                : 'Nenhuma análise corresponde à busca'}
            </p>
            {analyses.length === 0 && (
              <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
                Fazer primeira análise
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((analysis, i) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/20 transition-colors group"
                onClick={() => navigate(`/analysis/${analysis.id}`)}
              >
                <div className="w-16 h-16 rounded-lg bg-muted/30 flex-shrink-0 overflow-hidden">
                  <img src={analysis.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono font-bold uppercase ${providerColors[analysis.result?.metadata.provider || ''] || 'text-foreground'}`}>
                      {analysis.result?.metadata.provider.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(analysis.createdAt), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{analysis.result?.metadata.diagramType}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{analysis.result?.metadata.totalComponents} componentes</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{analysis.result?.metadata.totalThreats} ameaças</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <SeverityBadge severity="critical" count={analysis.result?.metadata.criticalThreats || 0} />
                  <SeverityBadge severity="high" count={analysis.result?.metadata.highThreats || 0} />
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-center mr-2">
                    <p className="text-lg font-mono font-bold">{analysis.result?.metadata.overallRiskScore}</p>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Risk</p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover análise?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A análise será permanentemente removida.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => { e.stopPropagation(); handleDelete(analysis.id); }}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
