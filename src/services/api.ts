import { Analysis, AnalysisListItem, UploadResponse, ProgressResponse, ProcessResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type AnalysisLanguage = 'pt-BR' | 'en-US';

export const api = {
  async uploadImage(file: File, language: AnalysisLanguage = 'pt-BR'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('language', language);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
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
