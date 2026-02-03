'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnalysisListItem } from '@/types';
import { api } from '@/services/api';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const data = await api.getAllAnalyses();
      setAnalyses(data);
    } catch (err) {
      setError('Falha ao carregar historico');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta analise?')) return;

    try {
      await api.deleteAnalysis(id);
      setAnalyses(analyses.filter((a) => a._id !== id));
    } catch (err) {
      setError('Falha ao excluir analise');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (analysis: AnalysisListItem) => {
    const styles: Record<string, string> = {
      processing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      processing: 'Processando',
      completed: 'Concluida',
      failed: 'Falhou',
    };

    const status = analysis.status;
    const progress = analysis.progress;

    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>
          {labels[status]}
        </span>
        {status === 'processing' && progress && (
          <span className="text-xs text-gray-500">
            {progress.percentage}%
          </span>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-4xl">🛡️</span>
            <h1 className="text-2xl font-bold text-gray-800">Threat Modeler AI</h1>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Nova Analise
          </Link>
        </header>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Historico de Analises
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : analyses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">Nenhuma analise encontrada</p>
              <Link
                href="/"
                className="text-blue-600 hover:underline"
              >
                Criar primeira analise
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {analyses.map((analysis) => (
                <div
                  key={analysis._id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        href={`/analysis/${analysis._id}`}
                        className="font-medium text-gray-800 hover:text-blue-600"
                      >
                        {analysis.imageName}
                      </Link>
                      {getStatusBadge(analysis)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(analysis.createdAt)}
                    </p>
                  </div>

                  {analysis.status === 'completed' && (
                    <div className="flex items-center gap-4 mr-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{analysis.summary.totalComponents}</span> componentes
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{analysis.summary.totalThreats}</span> ameacas
                      </div>
                      {analysis.summary.criticalThreats > 0 && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          {analysis.summary.criticalThreats} criticas
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/analysis/${analysis._id}`}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => handleDelete(analysis._id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
