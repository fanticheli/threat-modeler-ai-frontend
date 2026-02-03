export interface Component {
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

export interface Connection {
  from: string;
  to: string;
  protocol: string;
  port?: string;
  description: string;
  encrypted?: boolean;
}

export interface Threat {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severityJustification?: string;
  existingMitigation?: string;
  affectedData?: string;
  countermeasures: string[];
}

export interface StrideAnalysisItem {
  componentId: string;
  threats: Threat[];
}

export interface Summary {
  totalComponents: number;
  totalThreats: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
}

export interface Progress {
  step: 'waiting' | 'detecting_components' | 'analyzing_stride' | 'generating_report' | 'completed' | 'failed';
  message: string;
  percentage: number;
  currentComponent?: number;
  totalComponents?: number;
  updatedAt?: string;
}

export interface ProgressResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: Progress;
}

export interface ProcessResponse {
  message: string;
  jobId?: string;
  status: string;
  analysis?: Analysis;
}

export type AnalysisLanguage = 'pt-BR' | 'en-US';

export interface Analysis {
  _id: string;
  imageUrl: string;
  imageName: string;
  language?: AnalysisLanguage;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  detectedProvider?: string;
  existingMitigations?: string[];
  components: Component[];
  connections: Connection[];
  strideAnalysis: StrideAnalysisItem[];
  summary: Summary;
  progress?: Progress;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisListItem {
  _id: string;
  imageName: string;
  status: 'processing' | 'completed' | 'failed';
  summary: Summary;
  progress?: Progress;
  createdAt: string;
}

export interface UploadResponse {
  id: string;
  imageUrl: string;
  imageName: string;
  status: string;
}
