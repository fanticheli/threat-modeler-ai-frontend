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
  | 'stride_analysis'
  | 'generating_report'
  | 'completed'
  | 'failed';

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

// ── Backend raw types (used internally by adapters in api.ts) ──

export interface BackendComponent {
  id: string;
  name: string;
  type: string;
  provider?: string;
  description: string;
  availabilityZone?: string;
  existingSecurityControls?: string[];
  isAutoScaling?: boolean;
  replicaOf?: string;
}

export interface BackendConnection {
  from: string;
  to: string;
  protocol: string;
  port?: string;
  description: string;
  encrypted?: boolean;
}

export interface BackendThreat {
  category: string;
  description: string;
  severity: string;
  severityJustification?: string;
  existingMitigation?: string;
  affectedData?: string;
  countermeasures: string[];
}

export interface BackendStrideEntry {
  componentId: string;
  threats: BackendThreat[];
}

export interface BackendSummary {
  totalComponents: number;
  totalThreats: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
}

export interface BackendProgress {
  step: 'waiting' | 'detecting_components' | 'analyzing_stride' | 'generating_report' | 'completed' | 'failed';
  message: string;
  percentage: number;
  currentComponent?: number;
  totalComponents?: number;
  updatedAt?: string;
}

export interface BackendAnalysis {
  _id: string;
  imageUrl: string;
  imageName: string;
  language: 'pt-BR' | 'en-US';
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  detectedProvider?: string;
  components: BackendComponent[];
  connections: BackendConnection[];
  strideAnalysis: BackendStrideEntry[];
  summary: BackendSummary;
  progress: BackendProgress;
  createdAt: string;
  updatedAt: string;
}

export interface BackendAnalysisListItem {
  _id: string;
  imageName: string;
  imageUrl?: string;
  detectedProvider?: string;
  status: 'processing' | 'completed' | 'failed';
  summary: BackendSummary;
  progress: BackendProgress;
  createdAt: string;
}

export interface BackendUploadResponse {
  id: string;
  imageUrl: string;
  imageName: string;
  status: string;
  quality: BackendImageQuality;
}

export interface BackendImageQuality {
  isValid: boolean;
  score: number;
  details: {
    resolution: { width: number; height: number; isValid: boolean; message: string };
    fileSize: { bytes: number; isValid: boolean; message: string };
    sharpness: { value: number; isValid: boolean; message: string };
    contrast: { value: number; isValid: boolean; message: string };
  };
  recommendations: string[];
}

export interface BackendProgressEvent {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: BackendProgress;
}
