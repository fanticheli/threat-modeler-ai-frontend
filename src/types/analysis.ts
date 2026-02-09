export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type StrideCategory =
  | 'Spoofing'
  | 'Tampering'
  | 'Repudiation'
  | 'Information Disclosure'
  | 'Denial of Service'
  | 'Elevation of Privilege';

export type AnalysisPhase =
  | 'validating'
  | 'detecting_components'
  | 'analyzing_connections'
  | 'stride_analysis'
  | 'generating_report'
  | 'completed';

export interface Component {
  id: string;
  name: string;
  type: string;
  provider: string;
  description: string;
  category: string;
}

export interface Connection {
  source: string;
  target: string;
  protocol: string;
  encrypted: boolean;
  description: string;
}

export interface Threat {
  id: string;
  category: StrideCategory;
  title: string;
  description: string;
  severity: Severity;
  countermeasures: string[];
}

export interface StrideEntry {
  componentId: string;
  componentName: string;
  threats: Threat[];
}

export interface AnalysisResult {
  metadata: {
    provider: string;
    diagramType: string;
    totalComponents: number;
    totalConnections: number;
    totalThreats: number;
    criticalThreats: number;
    highThreats: number;
    mediumThreats: number;
    lowThreats: number;
    overallRiskScore: number;
  };
  components: Component[];
  connections: Connection[];
  strideAnalysis: StrideEntry[];
}

export interface Analysis {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  language: 'pt-br' | 'en-us';
  imageUrl: string;
  createdAt: string;
  result?: AnalysisResult;
}

export interface ProgressEvent {
  phase: AnalysisPhase;
  progress: number;
  message: string;
  details?: string;
}

export interface ImageValidation {
  quality_score: number;
  details: {
    resolution: string;
    sharpness: number;
    contrast: number;
  };
}
