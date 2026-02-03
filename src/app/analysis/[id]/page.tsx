'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Analysis, Progress, ProgressResponse } from '@/types';
import { api } from '@/services/api';
import ComponentList from '@/components/ComponentList';
import StrideReport from '@/components/StrideReport';
import AnalysisSummary from '@/components/AnalysisSummary';
import ImageModal from '@/components/ImageModal';
import ProgressTracker from '@/components/ProgressTracker';

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const loadAnalysis = useCallback(async () => {
    try {
      const data = await api.getAnalysis(id);
      setAnalysis(data);

      if (data.status === 'processing') {
        const currentProgress = data.progress || {
          step: 'waiting',
          message: 'Iniciando analise...',
          percentage: 0,
        };
        setProgress(currentProgress);

        // Se está em waiting, precisamos chamar o processAnalysis para garantir que o job foi criado
        if (currentProgress.step === 'waiting') {
          try {
            await api.processAnalysis(id);
          } catch (err) {
            // Ignora erro se já estiver processando (job já existe)
            console.log('Process already started or error:', err);
          }
        }

        startProgressStream();
      } else if (data.status === 'completed') {
        setProgress(null);
      } else if (data.status === 'failed') {
        setProgress({
          step: 'failed',
          message: data.error || 'Erro desconhecido',
          percentage: 0,
        });
      }
    } catch (err) {
      setError('Falha ao carregar analise');
    }
  }, [id]);

  const startProgressStream = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(api.getProgressStreamUrl(id));
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressResponse = JSON.parse(event.data);
        setProgress(data.progress);

        if (data.status === 'completed') {
          eventSource.close();
          loadAnalysis();
        } else if (data.status === 'failed') {
          eventSource.close();
        }
      } catch (e) {
        console.error('Error parsing SSE data:', e);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Fallback to polling if SSE fails
      const pollInterval = setInterval(async () => {
        try {
          const progressData = await api.getProgress(id);
          setProgress(progressData.progress);

          if (progressData.status === 'completed' || progressData.status === 'failed') {
            clearInterval(pollInterval);
            if (progressData.status === 'completed') {
              loadAnalysis();
            }
          }
        } catch (e) {
          clearInterval(pollInterval);
        }
      }, 3000);
    };
  }, [id, loadAnalysis]);

  const startProcessing = async () => {
    setError(null);
    setProgress({
      step: 'waiting',
      message: 'Iniciando analise...',
      percentage: 0,
    });

    try {
      await api.processAnalysis(id);
      startProgressStream();
    } catch (err) {
      setError('Falha ao iniciar analise. Tente novamente.');
      setProgress(null);
    }
  };

  useEffect(() => {
    loadAnalysis();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [loadAnalysis]);

  if (!analysis) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando analise...</p>
        </div>
      </main>
    );
  }

  const severityBadges = [
    { label: 'Criticas', count: analysis.summary?.criticalThreats || 0, color: 'bg-red-500' },
    { label: 'Altas', count: analysis.summary?.highThreats || 0, color: 'bg-orange-500' },
    { label: 'Medias', count: analysis.summary?.mediumThreats || 0, color: 'bg-yellow-500' },
    { label: 'Baixas', count: analysis.summary?.lowThreats || 0, color: 'bg-green-500' },
  ];

  const isProcessing = analysis.status === 'processing' || (progress && progress.step !== 'completed' && progress.step !== 'failed');

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-4xl">🛡️</span>
            <h1 className="text-2xl font-bold text-gray-800">Threat Modeler AI</h1>
          </Link>
          <div className="flex items-center gap-2">
            {analysis.status === 'completed' && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <span className="text-xs text-gray-500 px-2">Exportar:</span>
                <a
                  href={api.getReportUrl(id, 'pdf')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-white hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-200"
                  target="_blank"
                  title="Baixar relatorio em PDF"
                >
                  PDF
                </a>
                <a
                  href={api.getReportUrl(id, 'json')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-200"
                  target="_blank"
                  title="Baixar dados em JSON"
                >
                  JSON
                </a>
                <a
                  href={api.getReportUrl(id, 'markdown')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md transition-colors border border-transparent hover:border-gray-300"
                  target="_blank"
                  title="Baixar relatorio em Markdown"
                >
                  MD
                </a>
              </div>
            )}
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Voltar
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button
              onClick={startProcessing}
              className="ml-4 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Progress Tracker */}
        {isProcessing && progress && (
          <div className="mb-6">
            <ProgressTracker
              progress={progress}
              onRetry={progress.step === 'failed' ? startProcessing : undefined}
            />
          </div>
        )}

        {analysis.status === 'failed' && !isProcessing && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">Falha na analise</p>
            <p className="text-red-600 text-sm">{analysis.error}</p>
            <button
              onClick={startProcessing}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Resumo Unificado */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Imagem */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Diagrama</span>
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Expandir
                </button>
              </div>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${analysis.imageUrl}`}
                alt={analysis.imageName}
                className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity border"
                onClick={() => setIsImageModalOpen(true)}
              />
              <p className="text-xs text-gray-400 mt-1 truncate">{analysis.imageName}</p>
            </div>

            {/* Metricas Principais */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Provider */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium">Provider</p>
                  <p className="text-lg font-bold text-blue-800">
                    {(analysis.detectedProvider || 'N/A').toUpperCase()}
                  </p>
                </div>
                {/* Componentes */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium">Componentes</p>
                  <p className="text-2xl font-bold text-gray-800">{analysis.summary?.totalComponents || 0}</p>
                </div>
                {/* Ameacas */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium">Ameacas</p>
                  <p className="text-2xl font-bold text-gray-800">{analysis.summary?.totalThreats || 0}</p>
                </div>
                {/* Criticas + Altas */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <p className="text-xs text-red-600 font-medium">Criticas + Altas</p>
                  <p className="text-2xl font-bold text-red-700">
                    {(analysis.summary?.criticalThreats || 0) + (analysis.summary?.highThreats || 0)}
                  </p>
                </div>
              </div>

              {/* Severidades */}
              {analysis.status === 'completed' && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {severityBadges.map((badge) => (
                    <div
                      key={badge.label}
                      className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-xs"
                    >
                      <span className={`w-2 h-2 rounded-full ${badge.color}`}></span>
                      <span className="text-gray-700">{badge.count} {badge.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Mitigacoes Existentes */}
              {analysis.existingMitigations && analysis.existingMitigations.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-green-700 font-medium mb-1">
                    Mitigacoes ja existentes na arquitetura:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.existingMitigations.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {analysis.status === 'completed' && (
          <>
            {/* Detalhes da Analise */}
            <AnalysisSummary analysis={analysis} />

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Componentes Identificados
              </h2>
              <ComponentList components={analysis.components} />
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Analise STRIDE por Componente
              </h2>
              <StrideReport analysis={analysis} />
            </section>
          </>
        )}
      </div>

      <ImageModal
        imageUrl={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${analysis.imageUrl}`}
        imageName={analysis.imageName}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </main>
  );
}
