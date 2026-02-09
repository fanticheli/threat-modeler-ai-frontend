import { Analysis, ImageValidation } from '@/types/analysis';
import { mockAnalysis, mockAnalysesList } from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const USE_MOCK = !import.meta.env.VITE_API_URL;

// Simulated delay for mock
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  validateImage: async (file: File): Promise<ImageValidation> => {
    if (USE_MOCK) {
      await delay(800);
      const score = Math.min(95, Math.max(40, 60 + Math.random() * 35));
      return {
        quality_score: Math.round(score),
        details: { resolution: '1920x1080', sharpness: 0.85, contrast: 0.78 },
      };
    }
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/api/upload/validate`, { method: 'POST', body: formData });
    return res.json();
  },

  startAnalysis: async (file: File, language: string): Promise<{ analysis_id: string }> => {
    if (USE_MOCK) {
      await delay(500);
      return { analysis_id: 'analysis-001' };
    }
    const formData = new FormData();
    formData.append('image', file);
    formData.append('language', language);
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
    return res.json();
  },

  getAnalysis: async (id: string): Promise<Analysis> => {
    if (USE_MOCK) {
      await delay(300);
      return { ...mockAnalysis, id };
    }
    const res = await fetch(`${API_URL}/api/analysis/${id}`);
    return res.json();
  },

  streamProgress: (id: string): EventSource | null => {
    if (USE_MOCK) return null;
    return new EventSource(`${API_URL}/api/analysis/${id}/progress/stream`);
  },

  exportReport: async (id: string, format: 'pdf' | 'json' | 'markdown'): Promise<Blob> => {
    if (USE_MOCK) {
      await delay(500);
      const content = format === 'json'
        ? JSON.stringify(mockAnalysis, null, 2)
        : `# Threat Model Report\n\nAnalysis ID: ${id}\nFormat: ${format}`;
      return new Blob([content], { type: 'application/octet-stream' });
    }
    const res = await fetch(`${API_URL}/api/report/${id}/${format}`);
    return res.blob();
  },

  listAnalyses: async (): Promise<Analysis[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockAnalysesList;
    }
    const res = await fetch(`${API_URL}/api/analysis`);
    return res.json();
  },

  deleteAnalysis: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      return;
    }
    await fetch(`${API_URL}/api/analysis/${id}`, { method: 'DELETE' });
  },
};
