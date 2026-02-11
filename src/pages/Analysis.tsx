import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Boxes, Network, ShieldAlert, Download, FileJson, FileText, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GridBackground } from '@/components/GridBackground';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { RiskScoreGauge } from '@/components/RiskScoreGauge';
import { SeverityBadge } from '@/components/SeverityBadge';
import { ComponentCard } from '@/components/ComponentCard';
import { ThreatCard } from '@/components/ThreatCard';
import { api, mapBackendProgressToFrontend } from '@/services/api';
import { Analysis, AnalysisPhase, BackendProgressEvent, StrideCategory, Threat } from '@/types/analysis';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const strideCategories: { key: StrideCategory; emoji: string; short: string }[] = [
  { key: 'Spoofing', emoji: '🎭', short: 'Spoofing' },
  { key: 'Tampering', emoji: '🔧', short: 'Tampering' },
  { key: 'Repudiation', emoji: '🚫', short: 'Repudiation' },
  { key: 'Information Disclosure', emoji: '🔓', short: 'Info Disclosure' },
  { key: 'Denial of Service', emoji: '⚡', short: 'DoS' },
  { key: 'Elevation of Privilege', emoji: '👑', short: 'Elevation' },
];

const providerLabels: Record<string, string> = {
  aws: 'Amazon Web Services',
  azure: 'Microsoft Azure',
  gcp: 'Google Cloud Platform',
};

const AnalysisPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<AnalysisPhase>('validating');
  const [progress, setProgress] = useState(0);
  const [phaseMessage, setPhaseMessage] = useState('Preparando análise...');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!id) return;

    let sse: EventSource | null = null;

    // First, fetch the analysis to check if it's already done
    api.getAnalysis(id).then(data => {
      if (data.status === 'completed') {
        // Already complete — show result immediately
        setAnalysis(data);
        setPhase('completed');
        setProgress(100);
        setLoading(false);
        return;
      }

      if (data.status === 'failed') {
        setAnalysis(data);
        setPhase('failed');
        setPhaseMessage('Análise falhou');
        setLoading(false);
        return;
      }

      // Still processing — open SSE to follow progress
      sse = api.streamProgress(id);

      sse.onmessage = (event) => {
        try {
          const raw: BackendProgressEvent = JSON.parse(event.data);
          const mapped = mapBackendProgressToFrontend(raw);

          setPhase(mapped.phase);
          setProgress(mapped.progress);
          setPhaseMessage(mapped.message);

          if (raw.status === 'completed') {
            sse?.close();
            api.getAnalysis(id).then(result => {
              setAnalysis(result);
              setLoading(false);
            }).catch(() => {
              toast.error('Erro ao carregar análise');
              setLoading(false);
            });
          }

          if (raw.status === 'failed') {
            sse?.close();
            setPhase('failed');
            setPhaseMessage(raw.progress.message || 'Análise falhou');
            toast.error('A análise falhou');
            setLoading(false);
          }
        } catch {
          // ignore parse errors
        }
      };

      sse.onerror = () => {
        sse?.close();
        api.getAnalysis(id).then(result => {
          setAnalysis(result);
          if (result.status === 'completed') {
            setPhase('completed');
            setProgress(100);
          }
          setLoading(false);
        }).catch(() => {
          toast.error('Erro ao conectar com o servidor');
          setLoading(false);
        });
      };
    }).catch(() => {
      toast.error('Erro ao carregar análise');
      setLoading(false);
    });

    return () => { sse?.close(); };
  }, [id]);

  const handleExport = async (format: 'pdf' | 'json' | 'markdown') => {
    if (!id) return;
    try {
      const blob = await api.exportReport(id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `threat-report-${id}.${format === 'markdown' ? 'md' : format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Relatório ${format.toUpperCase()} exportado`);
    } catch {
      toast.error('Erro ao exportar relatório');
    }
  };

  // Get threats by component & category
  const allThreats = useMemo(() => {
    if (!analysis?.result) return [];
    return analysis.result.strideAnalysis.flatMap(entry =>
      entry.threats.map(t => ({ ...t, componentId: entry.componentId, componentName: entry.componentName }))
    );
  }, [analysis]);

  const filteredThreats = useMemo(() => {
    let threats = allThreats;
    if (selectedComponent) threats = threats.filter(t => t.componentId === selectedComponent);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      threats = threats.filter(t =>
        t.title.toLowerCase().includes(q) || t.componentName.toLowerCase().includes(q)
      );
    }
    return threats;
  }, [allThreats, selectedComponent, searchQuery]);

  const getComponentThreats = (componentId: string) => {
    return allThreats.filter(t => t.componentId === componentId);
  };

  const getMaxSeverity = (threats: (Threat & { componentId: string; componentName: string })[]) => {
    const order = ['critical', 'high', 'medium', 'low'];
    for (const s of order) {
      if (threats.some(t => t.severity === s)) return s;
    }
    return 'low';
  };

  const pageHeader = (
    <div className="relative z-10 flex items-center gap-4 p-4 md:px-6">
      <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-lg font-mono font-bold text-gradient">Threat Modeler AI</span>
      </button>
    </div>
  );

  // Loading/Progress phase
  if (loading) {
    return (
      <div className="min-h-screen relative">
        <GridBackground />
        {pageHeader}
        <div className="relative z-10 py-12">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-mono text-center text-gradient mb-8"
          >
            Analisando diagrama...
          </motion.h2>
          <AnalysisProgress
            currentPhase={phase}
            progress={progress}
            message={phaseMessage}
            imageUrl={analysis?.imageUrl}
          />
        </div>
      </div>
    );
  }

  if (!analysis?.result) {
    return (
      <div className="min-h-screen relative">
        <GridBackground />
        {pageHeader}
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Análise não encontrada</p>
        </div>
      </div>
    );
  }

  const { metadata, components } = analysis.result;

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      {pageHeader}

      <div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header / Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex flex-wrap items-center gap-6">
            <RiskScoreGauge score={metadata.overallRiskScore} />

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-mono font-bold text-gradient">Resultado da Análise</h2>
                <span className="text-xs font-mono uppercase tracking-wider px-2 py-1 rounded bg-primary/10 text-primary">
                  {providerLabels[metadata.provider] || metadata.provider.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Boxes className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-mono font-bold">{metadata.totalComponents}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Componentes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center">
                    <Network className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-lg font-mono font-bold">{metadata.totalConnections}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Conexões</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-destructive/10 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-lg font-mono font-bold">{metadata.totalThreats}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ameaças</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <SeverityBadge severity="critical" count={metadata.criticalThreats} />
                <SeverityBadge severity="high" count={metadata.highThreats} />
                <SeverityBadge severity="medium" count={metadata.mediumThreats} />
                <SeverityBadge severity="low" count={metadata.lowThreats} />
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="gap-2">
                <Download className="w-3 h-3" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('json')} className="gap-2">
                <FileJson className="w-3 h-3" /> JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('markdown')} className="gap-2">
                <FileText className="w-3 h-3" /> Markdown
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Executive Summary */}
        {analysis.executiveSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
              Resumo Executivo
            </h3>
            <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
              {analysis.executiveSummary.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main content: Components + STRIDE */}
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left: Components */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-[35%] space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                Componentes Detectados
              </h3>
              {selectedComponent && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedComponent(null)} className="text-xs gap-1">
                  <X className="w-3 h-3" /> Limpar filtro
                </Button>
              )}
            </div>
            <Input
              placeholder="Buscar componentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-card border-muted"
            />
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {components.map((comp, i) => {
                const threats = getComponentThreats(comp.id);
                return (
                  <ComponentCard
                    key={comp.id}
                    component={comp}
                    threatCount={threats.length}
                    maxSeverity={getMaxSeverity(threats)}
                    isSelected={selectedComponent === comp.id}
                    onClick={() => setSelectedComponent(selectedComponent === comp.id ? null : comp.id)}
                    index={i}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Right: STRIDE Report */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-[65%]"
          >
            <Tabs defaultValue="Spoofing" className="w-full">
              <TabsList className="w-full flex bg-card/50 border border-border h-auto flex-wrap">
                {strideCategories.map(cat => {
                  const count = filteredThreats.filter(t => t.category === cat.key).length;
                  return (
                    <TabsTrigger
                      key={cat.key}
                      value={cat.key}
                      className="flex-1 text-xs font-mono gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                    >
                      <span>{cat.emoji}</span>
                      <span className="hidden sm:inline">{cat.short}</span>
                      {count > 0 && <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{count}</span>}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {strideCategories.map(cat => (
                <TabsContent key={cat.key} value={cat.key} className="space-y-3 mt-4">
                  {filteredThreats.filter(t => t.category === cat.key).length === 0 ? (
                    <div className="glass-card rounded-lg p-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        Nenhuma ameaça de {cat.short} encontrada
                        {selectedComponent ? ' para este componente' : ''}
                      </p>
                    </div>
                  ) : (
                    filteredThreats
                      .filter(t => t.category === cat.key)
                      .map((threat, i) => (
                        <ThreatCard
                          key={threat.id}
                          threat={threat}
                          componentName={threat.componentName}
                          index={i}
                        />
                      ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>

        {/* Floating diagram button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 glow-btn bg-primary text-primary-foreground gap-2 shadow-lg"
              size="lg"
            >
              <ImageIcon className="w-4 h-4" /> Ver Diagrama Original
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] glass-card border-border p-2">
            <DialogTitle className="sr-only">Diagrama de arquitetura original</DialogTitle>
            <div className="overflow-auto max-h-[85vh]">
              <img
                src={analysis.imageUrl}
                alt="Diagrama de arquitetura"
                className="w-full h-auto"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AnalysisPage;
