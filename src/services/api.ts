import {
  Analysis,
  AnalysisPhase,
  Component,
  Connection,
  ImageValidation,
  StrideEntry,
  Threat,
  BackendAnalysis,
  BackendAnalysisListItem,
  BackendComponent,
  BackendConnection,
  BackendImageQuality,
  BackendProgressEvent,
  BackendStrideEntry,
  BackendSummary,
  BackendThreat,
  BackendUploadResponse,
  ProgressEvent,
  StrideCategory,
  Severity,
} from '@/types/analysis';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Private adapter helpers ──

function deriveCategory(type: string): string {
  const t = type.toLowerCase();
  if (['database', 'db', 'rds', 'dynamodb', 'cache', 'elasticache', 'redis', 'mongo', 'sql'].some(k => t.includes(k))) return 'Database';
  if (['storage', 's3', 'blob', 'bucket', 'disk'].some(k => t.includes(k))) return 'Storage';
  if (['network', 'cdn', 'cloudfront', 'load balancer', 'lb', 'alb', 'nlb', 'elb', 'vpc', 'route53', 'dns'].some(k => t.includes(k))) return 'Network';
  if (['security', 'waf', 'firewall', 'iam', 'cognito', 'auth', 'kms', 'shield', 'guard'].some(k => t.includes(k))) return 'Security';
  if (['queue', 'sqs', 'sns', 'kafka', 'eventbridge', 'mq', 'messaging'].some(k => t.includes(k))) return 'Messaging';
  if (['monitor', 'cloudwatch', 'xray', 'logging', 'log'].some(k => t.includes(k))) return 'Monitoring';
  return 'Compute';
}

function mapComponent(raw: BackendComponent): Component {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    provider: raw.provider || 'unknown',
    description: raw.description,
    category: deriveCategory(raw.type),
  };
}

function mapConnection(raw: BackendConnection): Connection {
  return {
    source: raw.from,
    target: raw.to,
    protocol: raw.protocol,
    encrypted: raw.encrypted ?? false,
    description: raw.description,
  };
}

function mapThreat(raw: BackendThreat, componentId: string, index: number): Threat {
  const firstSentence = raw.description.split(/[.!?]/)[0]?.trim() || raw.description.substring(0, 80);
  return {
    id: `${componentId}-t${index}`,
    category: raw.category as StrideCategory,
    title: firstSentence,
    description: raw.description,
    severity: raw.severity as Severity,
    countermeasures: raw.countermeasures,
  };
}

function mapStrideEntry(raw: BackendStrideEntry, components: BackendComponent[]): StrideEntry {
  const comp = components.find(c => c.id === raw.componentId);
  return {
    componentId: raw.componentId,
    componentName: comp?.name || raw.componentId,
    threats: raw.threats.map((t, i) => mapThreat(t, raw.componentId, i)),
  };
}

function computeRiskScore(summary: BackendSummary): number {
  const total = summary.totalThreats;
  if (total === 0) return 0;
  const weighted =
    summary.criticalThreats * 10 +
    summary.highThreats * 7 +
    summary.mediumThreats * 4 +
    summary.lowThreats * 1;
  return Math.min(100, Math.round((weighted / total) * 10));
}

function mapLanguage(lang: 'pt-BR' | 'en-US'): 'pt-br' | 'en-us' {
  return lang.toLowerCase() as 'pt-br' | 'en-us';
}

function mapLanguageToBackend(lang: string): 'pt-BR' | 'en-US' {
  return lang === 'en-us' ? 'en-US' : 'pt-BR';
}

function mapPhase(step: string): AnalysisPhase {
  switch (step) {
    case 'waiting': return 'validating';
    case 'detecting_components': return 'detecting_components';
    case 'analyzing_stride': return 'stride_analysis';
    case 'generating_report': return 'generating_report';
    case 'completed': return 'completed';
    case 'failed': return 'failed';
    default: return 'validating';
  }
}

function mapFullAnalysis(raw: BackendAnalysis): Analysis {
  const components = (raw.components || []).map(mapComponent);
  const connections = (raw.connections || []).map(mapConnection);
  const strideAnalysis = (raw.strideAnalysis || []).map(e => mapStrideEntry(e, raw.components || []));
  const summary = raw.summary || { totalComponents: 0, totalThreats: 0, criticalThreats: 0, highThreats: 0, mediumThreats: 0, lowThreats: 0 };

  const totalThreats = strideAnalysis.reduce((acc, e) => acc + e.threats.length, 0);

  return {
    id: raw._id,
    status: raw.status,
    language: mapLanguage(raw.language),
    imageUrl: raw.imageUrl?.startsWith('/') ? `${API_URL}${raw.imageUrl}` : raw.imageUrl,
    createdAt: raw.createdAt,
    executiveSummary: raw.executiveSummary,
    result: raw.status === 'completed' ? {
      metadata: {
        provider: raw.detectedProvider || 'unknown',
        diagramType: 'Architecture Diagram',
        totalComponents: components.length || summary.totalComponents,
        totalConnections: connections.length,
        totalThreats: totalThreats || summary.totalThreats,
        criticalThreats: summary.criticalThreats,
        highThreats: summary.highThreats,
        mediumThreats: summary.mediumThreats,
        lowThreats: summary.lowThreats,
        overallRiskScore: computeRiskScore(summary),
      },
      components,
      connections,
      strideAnalysis,
    } : undefined,
  };
}

function mapListItem(raw: BackendAnalysisListItem): Analysis {
  const summary = raw.summary || { totalComponents: 0, totalThreats: 0, criticalThreats: 0, highThreats: 0, mediumThreats: 0, lowThreats: 0 };
  const imgUrl = raw.imageUrl?.startsWith('/') ? `${API_URL}${raw.imageUrl}` : (raw.imageUrl || '');
  return {
    id: raw._id,
    status: raw.status,
    language: 'pt-br',
    imageUrl: imgUrl,
    createdAt: raw.createdAt,
    result: raw.status === 'completed' ? {
      metadata: {
        provider: raw.detectedProvider || 'unknown',
        diagramType: 'Architecture Diagram',
        totalComponents: summary.totalComponents,
        totalConnections: 0,
        totalThreats: summary.totalThreats,
        criticalThreats: summary.criticalThreats,
        highThreats: summary.highThreats,
        mediumThreats: summary.mediumThreats,
        lowThreats: summary.lowThreats,
        overallRiskScore: computeRiskScore(summary),
      },
      components: [],
      connections: [],
      strideAnalysis: [],
    } : undefined,
  };
}

function mapValidation(raw: BackendImageQuality): ImageValidation {
  const d = raw.details;
  return {
    quality_score: raw.score,
    details: {
      resolution: `${d.resolution.width}x${d.resolution.height}`,
      sharpness: d.sharpness.value,
      contrast: d.contrast.value,
    },
  };
}

// ── Exported: map backend SSE progress to frontend ProgressEvent ──

export function mapBackendProgressToFrontend(raw: BackendProgressEvent): ProgressEvent {
  return {
    phase: mapPhase(raw.progress.step),
    progress: raw.progress.percentage,
    message: raw.progress.message,
    details: raw.progress.currentComponent != null && raw.progress.totalComponents != null
      ? `${raw.progress.currentComponent}/${raw.progress.totalComponents}`
      : undefined,
  };
}

// ── API functions ──

export const api = {
  validateImage: async (file: File): Promise<ImageValidation> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/api/upload/validate`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Validate failed: ${res.status}`);
    const data: BackendImageQuality = await res.json();
    return mapValidation(data);
  },

  startAnalysis: async (file: File, language: string): Promise<{ analysis_id: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('language', mapLanguageToBackend(language));
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data: BackendUploadResponse = await res.json();
    return { analysis_id: data.id };
  },

  getAnalysis: async (id: string): Promise<Analysis> => {
    const res = await fetch(`${API_URL}/api/analysis/${id}`);
    if (!res.ok) throw new Error(`Get analysis failed: ${res.status}`);
    const data: BackendAnalysis = await res.json();
    return mapFullAnalysis(data);
  },

  streamProgress: (id: string): EventSource => {
    return new EventSource(`${API_URL}/api/analysis/${id}/progress/stream`);
  },

  exportReport: async (id: string, format: 'pdf' | 'json' | 'markdown'): Promise<Blob> => {
    const res = await fetch(`${API_URL}/api/report/${id}/${format}`);
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);
    return res.blob();
  },

  listAnalyses: async (): Promise<Analysis[]> => {
    const res = await fetch(`${API_URL}/api/analysis`);
    if (!res.ok) throw new Error(`List failed: ${res.status}`);
    const data: BackendAnalysisListItem[] = await res.json();
    return data.map(mapListItem);
  },

  deleteAnalysis: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/analysis/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  },
};
