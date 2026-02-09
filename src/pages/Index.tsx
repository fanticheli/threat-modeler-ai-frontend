import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GridBackground } from '@/components/GridBackground';
import { UploadZone } from '@/components/UploadZone';
import { RecentAnalyses } from '@/components/RecentAnalyses';
import { api } from '@/services/api';
import { Analysis } from '@/types/analysis';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState('pt-br');
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    api.listAnalyses().then(setRecentAnalyses).catch(() => {});
  }, []);

  const handleFileAccepted = useCallback(async (f: File) => {
    setFile(f);
    setIsValidating(true);
    setQualityScore(null);
    try {
      const validation = await api.validateImage(f);
      setQualityScore(validation.quality_score);
    } catch {
      toast.error('Erro ao validar imagem');
      setQualityScore(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleClear = () => {
    setFile(null);
    setQualityScore(null);
  };

  const handleStartAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const { analysis_id } = await api.startAnalysis(file, language);
      navigate(`/analysis/${analysis_id}`);
    } catch {
      toast.error('Erro ao iniciar análise');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = qualityScore !== null && qualityScore >= 50 && !isValidating;

  return (
    <div className="min-h-screen relative">
      <GridBackground />

      <div className="relative z-10 flex flex-col items-center px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-mono font-bold text-gradient mb-4">
            Threat Modeler AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Análise automatizada de ameaças STRIDE a partir de diagramas de arquitetura
          </p>
        </motion.div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl"
        >
          <UploadZone
            onFileAccepted={handleFileAccepted}
            qualityScore={qualityScore}
            isValidating={isValidating}
            file={file}
            onClear={handleClear}
          />
        </motion.div>

        {/* Language toggle + Analyze button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <ToggleGroup
              type="single"
              value={language}
              onValueChange={(v) => v && setLanguage(v)}
              className="glass-card rounded-lg p-1"
            >
              <ToggleGroupItem value="pt-br" className="text-xs font-mono px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                PT-BR
              </ToggleGroupItem>
              <ToggleGroupItem value="en-us" className="text-xs font-mono px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                EN-US
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Button
            size="lg"
            disabled={!canAnalyze || isAnalyzing}
            onClick={handleStartAnalysis}
            className="glow-btn bg-primary text-primary-foreground font-mono text-base px-8 py-6"
          >
            <Search className="w-5 h-5 mr-2" />
            {isAnalyzing ? 'Iniciando análise...' : 'Iniciar Análise'}
          </Button>
        </motion.div>

        {/* Recent analyses */}
        <RecentAnalyses analyses={recentAnalyses} />
      </div>
    </div>
  );
};

export default Index;
