import { Analysis, AnalysisListItem, UploadResponse, ProgressResponse, ProcessResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type AnalysisLanguage = 'pt-BR' | 'en-US';

export interface ImageQualityResult {
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

export interface UploadWithQualityResponse extends UploadResponse {
  quality: ImageQualityResult;
}

export const api = {
  async validateImageQuality(file: File): Promise<ImageQualityResult> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/upload/validate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha ao validar imagem');
    }

    return response.json();
  },

  async uploadImage(
    file: File,
    language: AnalysisLanguage = 'pt-BR',
    skipQualityCheck = false,
  ): Promise<UploadWithQualityResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('language', language);

    const url = skipQualityCheck
      ? `${API_URL}/api/upload?skipQualityCheck=true`
      : `${API_URL}/api/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.quality) {
        const error = new Error('Qualidade da imagem insuficiente') as Error & { quality: ImageQualityResult };
        error.quality = errorData.quality;
        throw error;
      }
      throw new Error('Falha ao fazer upload da imagem');
    }

    return response.json();
  },

  async getAnalysis(id: string): Promise<Analysis> {
    const response = await fetch(`${API_URL}/api/analysis/${id}`);

    if (!response.ok) {
      throw new Error('Falha ao buscar análise');
    }

    return response.json();
  },

  async getAllAnalyses(): Promise<AnalysisListItem[]> {
    const response = await fetch(`${API_URL}/api/analysis`);

    if (!response.ok) {
      throw new Error('Falha ao buscar análises');
    }

    return response.json();
  },

  async processAnalysis(id: string): Promise<ProcessResponse> {
    const response = await fetch(`${API_URL}/api/analysis/${id}/process`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Falha ao iniciar análise');
    }

    return response.json();
  },

  async getProgress(id: string): Promise<ProgressResponse> {
    const response = await fetch(`${API_URL}/api/analysis/${id}/progress`);

    if (!response.ok) {
      throw new Error('Falha ao buscar progresso');
    }

    return response.json();
  },

  getProgressStreamUrl(id: string): string {
    return `${API_URL}/api/analysis/${id}/progress/stream`;
  },

  async deleteAnalysis(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/analysis/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Falha ao excluir análise');
    }
  },

  getReportUrl(id: string, format: 'pdf' | 'json' | 'markdown'): string {
    return `${API_URL}/api/report/${id}/${format}`;
  },
};
