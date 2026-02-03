'use client';

import { Progress } from '@/types';

interface ProgressTrackerProps {
  progress: Progress;
  onRetry?: () => void;
}

const stepLabels: Record<string, string> = {
  waiting: 'Aguardando',
  detecting_components: 'Detectando Componentes',
  analyzing_stride: 'Analisando STRIDE',
  generating_report: 'Gerando Relatorio',
  completed: 'Concluido',
  failed: 'Falhou',
};

const stepIcons: Record<string, string> = {
  waiting: '⏳',
  detecting_components: '🔍',
  analyzing_stride: '🛡️',
  generating_report: '📄',
  completed: '✅',
  failed: '❌',
};

export default function ProgressTracker({ progress, onRetry }: ProgressTrackerProps) {
  const isFailed = progress.step === 'failed';
  const isCompleted = progress.step === 'completed';

  return (
    <div className={`rounded-xl shadow-lg p-6 ${isFailed ? 'bg-red-50 border border-red-200' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{stepIcons[progress.step] || '⏳'}</span>
          <div>
            <h3 className="font-semibold text-gray-800">
              {stepLabels[progress.step] || progress.step}
            </h3>
            <p className={`text-sm ${isFailed ? 'text-red-600' : 'text-gray-500'}`}>
              {progress.message}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${isFailed ? 'text-red-600' : 'text-blue-600'}`}>
            {progress.percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isFailed ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        {['detecting_components', 'analyzing_stride', 'generating_report', 'completed'].map((step, i) => {
          const stepOrder = ['waiting', 'detecting_components', 'analyzing_stride', 'generating_report', 'completed'];
          const currentIndex = stepOrder.indexOf(progress.step);
          const stepIndex = stepOrder.indexOf(step);
          const isActive = stepIndex <= currentIndex;
          const isCurrent = step === progress.step;

          return (
            <div
              key={step}
              className={`flex flex-col items-center ${
                isCurrent ? 'text-blue-600 font-medium' : isActive ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${
                isCurrent ? 'bg-blue-100 text-blue-600' : isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100'
              }`}>
                {isActive && !isCurrent ? '✓' : i + 1}
              </span>
              <span className="hidden md:inline">{stepLabels[step]}</span>
            </div>
          );
        })}
      </div>

      {/* Component Progress (if analyzing STRIDE) */}
      {progress.step === 'analyzing_stride' && progress.totalComponents && progress.totalComponents > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">
              Componente {progress.currentComponent || 0} de {progress.totalComponents}
            </span>
            <span className="text-blue-600 font-medium">
              {Math.round(((progress.currentComponent || 0) / progress.totalComponents) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-blue-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((progress.currentComponent || 0) / progress.totalComponents) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Retry Button */}
      {isFailed && onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Tentar Novamente
        </button>
      )}

      {/* Loading Animation */}
      {!isCompleted && !isFailed && (
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
