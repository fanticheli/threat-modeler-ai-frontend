'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/ImageUploader';
import ImageQualityFeedback from '@/components/ImageQualityFeedback';
import { api, ImageQualityResult } from '@/services/api';

type AnalysisLanguage = 'pt-BR' | 'en-US';

const LANGUAGES: { value: AnalysisLanguage; label: string; flag: string }[] = [
  { value: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
];

export default function Home() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<AnalysisLanguage>('pt-BR');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qualityResult, setQualityResult] = useState<ImageQualityResult | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setQualityResult(null);

    // Validar qualidade automaticamente ao selecionar
    setIsValidating(true);
    try {
      const quality = await api.validateImageQuality(file);
      setQualityResult(quality);
    } catch (err) {
      // Se falhar a validação, continua sem mostrar feedback
      console.warn('Falha ao validar qualidade da imagem');
    } finally {
      setIsValidating(false);
    }
  };

  const handleAnalyze = async (skipQualityCheck = false) => {
    if (!selectedFile) {
      setError('Por favor, selecione uma imagem');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const uploadResult = await api.uploadImage(selectedFile, selectedLanguage, skipQualityCheck);
      router.push(`/analysis/${uploadResult.id}`);
    } catch (err: any) {
      if (err.quality) {
        setQualityResult(err.quality);
        setError('A qualidade da imagem está abaixo do recomendado.');
      } else {
        setError('Falha ao fazer upload da imagem. Tente novamente.');
      }
      setIsLoading(false);
    }
  };

  const handleProceedAnyway = () => {
    handleAnalyze(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🛡️</span>
            <h1 className="text-2xl font-bold text-gray-800">Threat Modeler AI</h1>
          </div>
          <Link
            href="/history"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Historico
          </Link>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
              Analise de Arquitetura com STRIDE
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Faca upload de um diagrama de arquitetura para identificar ameacas automaticamente
            </p>

            <ImageUploader
              onFileSelect={handleFileSelect}
              isLoading={isLoading || isValidating}
            />

            {isValidating && (
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analisando qualidade da imagem...
              </div>
            )}

            {qualityResult && !isValidating && (
              <div className="mt-4">
                <ImageQualityFeedback
                  quality={qualityResult}
                  onProceedAnyway={!qualityResult.isValid ? handleProceedAnyway : undefined}
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Seletor de Idioma */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma da Análise
              </label>
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.value)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
                      ${selectedLanguage === lang.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'}
                    `}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={!selectedFile || isLoading || isValidating || (qualityResult && !qualityResult.isValid)}
              className={`
                w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors
                ${
                  selectedFile && !isLoading && !isValidating && (!qualityResult || qualityResult.isValid)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Analisar Arquitetura'
              )}
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>A analise utiliza Claude Vision para detectar componentes</p>
            <p>e a metodologia STRIDE para identificar ameacas de seguranca</p>
          </div>
        </div>
      </div>
    </main>
  );
}
