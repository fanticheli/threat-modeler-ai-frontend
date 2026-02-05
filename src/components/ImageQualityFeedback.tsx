'use client';

interface QualityDetail {
  isValid: boolean;
  message: string;
  value?: number;
}

interface ImageQualityResult {
  isValid: boolean;
  score: number;
  details: {
    resolution: QualityDetail & { width: number; height: number };
    fileSize: QualityDetail & { bytes: number };
    sharpness: QualityDetail & { value: number };
    contrast: QualityDetail & { value: number };
  };
  recommendations: string[];
}

interface ImageQualityFeedbackProps {
  quality: ImageQualityResult | null;
  onProceedAnyway?: () => void;
}

export default function ImageQualityFeedback({ quality, onProceedAnyway }: ImageQualityFeedbackProps) {
  if (!quality) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Boa';
    if (score >= 40) return 'Regular';
    return 'Baixa';
  };

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const XIcon = () => (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className={`rounded-lg p-4 ${quality.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      {/* Header com Score */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Qualidade da Imagem</h3>
        <div className={`px-3 py-1 rounded-full ${getScoreBgColor(quality.score)}`}>
          <span className={`font-bold ${getScoreColor(quality.score)}`}>
            {quality.score}% - {getScoreLabel(quality.score)}
          </span>
        </div>
      </div>

      {/* Barra de progresso visual */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            quality.score >= 80 ? 'bg-green-500' :
            quality.score >= 60 ? 'bg-yellow-500' :
            quality.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${quality.score}%` }}
        />
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          {quality.details.resolution.isValid ? <CheckIcon /> : <XIcon />}
          <div>
            <p className="text-sm font-medium text-gray-700">Resolução</p>
            <p className="text-xs text-gray-500">
              {quality.details.resolution.width}x{quality.details.resolution.height}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quality.details.fileSize.isValid ? <CheckIcon /> : <XIcon />}
          <div>
            <p className="text-sm font-medium text-gray-700">Tamanho</p>
            <p className="text-xs text-gray-500">
              {(quality.details.fileSize.bytes / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quality.details.sharpness.isValid ? <CheckIcon /> : <XIcon />}
          <div>
            <p className="text-sm font-medium text-gray-700">Nitidez</p>
            <p className="text-xs text-gray-500">{quality.details.sharpness.value}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quality.details.contrast.isValid ? <CheckIcon /> : <XIcon />}
          <div>
            <p className="text-sm font-medium text-gray-700">Contraste</p>
            <p className="text-xs text-gray-500">{quality.details.contrast.value}%</p>
          </div>
        </div>
      </div>

      {/* Recomendações */}
      {quality.recommendations.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm font-medium text-yellow-800 mb-2">Recomendações:</p>
          <ul className="text-sm text-yellow-700 space-y-1">
            {quality.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-500">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botão para continuar mesmo assim */}
      {!quality.isValid && onProceedAnyway && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="text-sm text-red-600 mb-2">
            A análise pode ter resultados imprecisos com esta qualidade de imagem.
          </p>
          <button
            onClick={onProceedAnyway}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Continuar mesmo assim →
          </button>
        </div>
      )}
    </div>
  );
}
