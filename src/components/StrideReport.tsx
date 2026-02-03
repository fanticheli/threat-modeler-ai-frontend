'use client';

import { useState } from 'react';
import { Analysis, Component } from '@/types';
import ThreatCard from './ThreatCard';

interface StrideReportProps {
  analysis: Analysis;
}

const ITEMS_PER_PAGE = 5;

export default function StrideReport({ analysis }: StrideReportProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(
    new Set()
  );

  const totalPages = Math.ceil(analysis.strideAnalysis.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = analysis.strideAnalysis.slice(startIndex, endIndex);

  const toggleComponent = (componentId: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(componentId)) {
      newExpanded.delete(componentId);
    } else {
      newExpanded.add(componentId);
    }
    setExpandedComponents(newExpanded);
  };

  const getComponentById = (id: string): Component | undefined => {
    return analysis.components.find((c) => c.id === id);
  };

  const typeIcons: Record<string, string> = {
    user: '👤',
    users: '👥',
    client: '👤',
    server: '🖥️',
    webserver: '🖥️',
    appserver: '🖥️',
    web_server: '🖥️',
    app_server: '🖥️',
    application: '🖥️',
    compute: '🖥️',
    ec2: '🖥️',
    instance: '🖥️',
    container: '📦',
    database: '🗄️',
    db: '🗄️',
    rds: '🗄️',
    sql: '🗄️',
    nosql: '🗄️',
    dynamodb: '🗄️',
    api: '🔌',
    api_gateway: '🔌',
    gateway: '🔌',
    load_balancer: '⚖️',
    loadbalancer: '⚖️',
    lb: '⚖️',
    alb: '⚖️',
    nlb: '⚖️',
    elb: '⚖️',
    firewall: '🛡️',
    waf: '🛡️',
    shield: '🛡️',
    security_group: '🛡️',
    cache: '💾',
    redis: '💾',
    elasticache: '💾',
    memcached: '💾',
    queue: '📬',
    sqs: '📬',
    sns: '📬',
    mq: '📬',
    messaging: '📬',
    storage: '☁️',
    s3: '☁️',
    blob: '☁️',
    efs: '☁️',
    file_storage: '☁️',
    cdn: '🌐',
    cloudfront: '🌐',
    distribution: '🌐',
    search: '🔍',
    elasticsearch: '🔍',
    opensearch: '🔍',
    solr: '🔍',
    serverless: '⚡',
    lambda: '⚡',
    function: '⚡',
    monitoring: '📊',
    cloudwatch: '📊',
    logging: '📊',
    metrics: '📊',
    security: '🔐',
    kms: '🔐',
    iam: '🔐',
    secrets: '🔐',
    vault: '🔐',
    email: '📧',
    ses: '📧',
    smtp: '📧',
    backup: '💿',
    snapshot: '💿',
    network: '🌐',
    vpc: '🌐',
    subnet: '🌐',
    external_service: '🔗',
    external: '🔗',
    third_party: '🔗',
    saas: '🔗',
  };

  const getIcon = (type: string) => typeIcons[type?.toLowerCase()] || '📦';

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setExpandedComponents(new Set());
    window.scrollTo({ top: document.getElementById('stride-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  return (
    <div id="stride-section">
      {/* Pagination Top */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow p-3">
        <span className="text-sm text-gray-600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, analysis.strideAnalysis.length)} de {analysis.strideAnalysis.length} componentes
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Proximo
          </button>
        </div>
      </div>

      {/* Components List */}
      <div className="space-y-4">
        {currentItems.map((strideItem) => {
          const component = getComponentById(strideItem.componentId);
          const isExpanded = expandedComponents.has(strideItem.componentId);
          const threatCount = strideItem.threats.length;

          return (
            <div
              key={strideItem.componentId}
              className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleComponent(strideItem.componentId)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getIcon(component?.type || '')}
                  </span>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">
                      {component?.name || strideItem.componentId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {threatCount} ameaca{threatCount !== 1 ? 's' : ''} identificada{threatCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-xl">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                  {strideItem.threats.map((threat, index) => (
                    <ThreatCard key={index} threat={threat} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Bottom */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Anterior
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Pagina {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Proximo
          </button>
        </div>
      )}
    </div>
  );
}
