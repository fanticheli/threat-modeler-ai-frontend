'use client';

import { Threat } from '@/types';

interface ThreatCardProps {
  threat: Threat;
}

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

const severityEmoji: Record<string, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

const severityLabels: Record<string, string> = {
  critical: 'Critica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baixa',
};

export default function ThreatCard({ threat }: ThreatCardProps) {
  const colors = severityColors[threat.severity] || severityColors.medium;

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">{threat.category}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${colors.text} ${colors.bg} border ${colors.border}`}>
          {severityEmoji[threat.severity]} {severityLabels[threat.severity]}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{threat.description}</p>

      {/* Severity Justification */}
      {threat.severityJustification && (
        <div className="mb-3 p-2 bg-white/50 rounded border border-gray-200">
          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Justificativa da Severidade
          </h5>
          <p className="text-xs text-gray-600">{threat.severityJustification}</p>
        </div>
      )}

      {/* Affected Data */}
      {threat.affectedData && (
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase">Dados Afetados: </span>
          <span className="text-xs text-gray-600">{threat.affectedData}</span>
        </div>
      )}

      {/* Existing Mitigation */}
      {threat.existingMitigation && threat.existingMitigation !== 'none' && (
        <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
          <h5 className="text-xs font-semibold text-blue-700 uppercase mb-1">
            Mitigacao Existente
          </h5>
          <p className="text-xs text-blue-600">{threat.existingMitigation}</p>
        </div>
      )}

      {/* Countermeasures */}
      {threat.countermeasures && threat.countermeasures.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Contramedidas Recomendadas
          </h5>
          <ul className="space-y-1">
            {threat.countermeasures.map((countermeasure, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{countermeasure}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
