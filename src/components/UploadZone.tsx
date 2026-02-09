import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Shield, Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileAccepted: (file: File) => void;
  qualityScore: number | null;
  isValidating: boolean;
  file: File | null;
  onClear: () => void;
}

export const UploadZone = ({ onFileAccepted, qualityScore, isValidating, file, onClear }: UploadZoneProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      const f = accepted[0];
      setPreview(URL.createObjectURL(f));
      onFileAccepted(f);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/webp': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleClear = () => {
    setPreview(null);
    onClear();
  };

  const qualityColor = qualityScore !== null
    ? qualityScore >= 80 ? 'text-severity-low' : qualityScore >= 50 ? 'text-severity-medium' : 'text-severity-critical'
    : '';

  const qualityLabel = qualityScore !== null
    ? qualityScore >= 80 ? 'Excelente qualidade' : qualityScore >= 50 ? 'Qualidade aceitável' : 'Qualidade insuficiente — considere uma imagem com maior resolução'
    : '';

  const progressColor = qualityScore !== null
    ? qualityScore >= 80 ? '[&>div]:bg-severity-low' : qualityScore >= 50 ? '[&>div]:bg-severity-medium' : '[&>div]:bg-severity-critical'
    : '';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                'glass-card rounded-xl p-12 cursor-pointer transition-all duration-300 flex flex-col items-center gap-4',
                'border-2 border-dashed',
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <div className="relative">
                <Shield className="w-12 h-12 text-primary" />
                <Upload className="w-5 h-5 text-secondary absolute -bottom-1 -right-1" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium">
                  {isDragActive ? 'Solte o arquivo aqui...' : 'Arraste seu diagrama de arquitetura aqui'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar • PNG, JPG, WEBP (max 10MB)</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <div className="relative">
              <img src={preview} alt="Diagram preview" className="w-full h-64 object-contain bg-background/50 p-4" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 hover:bg-destructive/20"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{file?.name}</span>
              </div>
            </div>

            {/* Quality Score */}
            <div className="p-4 space-y-2">
              {isValidating ? (
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <Progress value={0} className="h-2 bg-muted" />
                </div>
              ) : qualityScore !== null ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Qualidade da imagem</span>
                    <span className={cn('font-mono font-bold', qualityColor)}>{qualityScore}%</span>
                  </div>
                  <Progress value={qualityScore} className={cn('h-2', progressColor)} />
                  <p className={cn('text-xs', qualityColor)}>{qualityLabel}</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
