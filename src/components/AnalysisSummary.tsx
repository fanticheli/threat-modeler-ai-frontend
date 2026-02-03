'use client';

import { useState } from 'react';
import { Analysis } from '@/types';

interface AnalysisSummaryProps {
  analysis: Analysis;
}

const typeIcons: Record<string, string> = {
  user: '👤', users: '👥', client: '👤',
  server: '🖥️', webserver: '🖥️', appserver: '🖥️', web_server: '🖥️', app_server: '🖥️',
  application: '🖥️', compute: '🖥️', ec2: '🖥️', instance: '🖥️', container: '📦',
  database: '🗄️', db: '🗄️', rds: '🗄️', sql: '🗄️', nosql: '🗄️', dynamodb: '🗄️',
  api: '🔌', api_gateway: '🔌', gateway: '🔌',
  load_balancer: '⚖️', loadbalancer: '⚖️', lb: '⚖️', alb: '⚖️', nlb: '⚖️', elb: '⚖️',
  firewall: '🛡️', waf: '🛡️', shield: '🛡️', security_group: '🛡️',
  cache: '💾', redis: '💾', elasticache: '💾', memcached: '💾',
  queue: '📬', sqs: '📬', sns: '📬', mq: '📬', messaging: '📬',
  storage: '☁️', s3: '☁️', blob: '☁️', efs: '☁️', file_storage: '☁️',
  cdn: '🌐', cloudfront: '🌐', distribution: '🌐',
  search: '🔍', elasticsearch: '🔍', opensearch: '🔍', solr: '🔍',
  serverless: '⚡', lambda: '⚡', function: '⚡',
  monitoring: '📊', cloudwatch: '📊', logging: '📊', metrics: '📊',
  security: '🔐', kms: '🔐', iam: '🔐', secrets: '🔐', vault: '🔐',
  email: '📧', ses: '📧', smtp: '📧',
  backup: '💿', snapshot: '💿',
  network: '🌐', vpc: '🌐', subnet: '🌐',
  external_service: '🔗', external: '🔗', third_party: '🔗', saas: '🔗',
};

const typeLabels: Record<string, string> = {
  user: 'Usuario', users: 'Usuarios', client: 'Cliente',
  server: 'Servidor', webserver: 'Web Server', appserver: 'App Server',
  web_server: 'Web Server', app_server: 'App Server', application: 'App',
  compute: 'Compute', ec2: 'EC2', instance: 'Instance', container: 'Container',
  database: 'Database', db: 'Database', rds: 'RDS', sql: 'SQL', nosql: 'NoSQL', dynamodb: 'DynamoDB',
  api: 'API', api_gateway: 'API Gateway', gateway: 'Gateway',
  load_balancer: 'Load Balancer', loadbalancer: 'Load Balancer', lb: 'LB', alb: 'ALB', nlb: 'NLB', elb: 'ELB',
  firewall: 'Firewall', waf: 'WAF', shield: 'Shield', security_group: 'SG',
  cache: 'Cache', redis: 'Redis', elasticache: 'ElastiCache', memcached: 'Memcached',
  queue: 'Queue', sqs: 'SQS', sns: 'SNS', mq: 'MQ', messaging: 'Messaging',
  storage: 'Storage', s3: 'S3', blob: 'Blob', efs: 'EFS', file_storage: 'File Storage',
  cdn: 'CDN', cloudfront: 'CloudFront', distribution: 'Distribution',
  search: 'Search', elasticsearch: 'ES', opensearch: 'OpenSearch', solr: 'Solr',
  serverless: 'Serverless', lambda: 'Lambda', function: 'Function',
  monitoring: 'Monitoring', cloudwatch: 'CloudWatch', logging: 'Logging', metrics: 'Metrics',
  security: 'Security', kms: 'KMS', iam: 'IAM', secrets: 'Secrets', vault: 'Vault',
  email: 'Email', ses: 'SES', smtp: 'SMTP',
  backup: 'Backup', snapshot: 'Snapshot',
  network: 'Network', vpc: 'VPC', subnet: 'Subnet',
  external_service: 'External', external: 'External', third_party: 'Third Party', saas: 'SaaS',
};

export default function AnalysisSummary({ analysis }: AnalysisSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (type: string) => typeIcons[type?.toLowerCase()] || '📦';
  const getLabel = (type: string) => typeLabels[type?.toLowerCase()] || type;

  // Agrupar componentes por tipo
  const componentsByType = analysis.components.reduce((acc, comp) => {
    const type = comp.type?.toLowerCase() || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(comp);
    return acc;
  }, {} as Record<string, typeof analysis.components>);

  // Contar ameaças por categoria STRIDE
  const threatsByCategory: Record<string, number> = {};
  analysis.strideAnalysis.forEach((item) => {
    item.threats.forEach((threat) => {
      const cat = threat.category || 'Unknown';
      threatsByCategory[cat] = (threatsByCategory[cat] || 0) + 1;
    });
  });

  // Top componentes com mais ameaças críticas/altas
  const topRiskComponents = analysis.strideAnalysis
    .map((item) => {
      const component = analysis.components.find((c) => c.id === item.componentId);
      const critical = item.threats.filter((t) => t.severity === 'critical').length;
      const high = item.threats.filter((t) => t.severity === 'high').length;
      return {
        name: component?.name || item.componentId,
        type: component?.type || 'unknown',
        critical,
        high,
        total: item.threats.length,
        risk: critical * 4 + high * 2,
      };
    })
    .filter((c) => c.risk > 0)
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      {/* Header clicável */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Detalhes da Analise
          </h3>
          {/* Preview compacto */}
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
            <span>{Object.keys(componentsByType).length} tipos de componentes</span>
            <span>•</span>
            <span>{Object.keys(threatsByCategory).length} categorias STRIDE</span>
            {topRiskComponents.length > 0 && (
              <>
                <span>•</span>
                <span className="text-red-600">{topRiskComponents.length} componentes em risco</span>
              </>
            )}
          </div>
        </div>
        <span className="text-gray-400 text-lg">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {/* Componentes por Tipo */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Componentes por Tipo
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(componentsByType).map(([type, components]) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                  >
                    {getIcon(type)} {components.length} {getLabel(type)}
                  </span>
                ))}
              </div>
            </div>

            {/* Ameaças por Categoria STRIDE */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Ameacas por Categoria
              </h4>
              <div className="space-y-1">
                {Object.entries(threatsByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{category}</span>
                      <span className="font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Componentes em Risco */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Componentes em Maior Risco
              </h4>
              {topRiskComponents.length > 0 ? (
                <div className="space-y-2">
                  {topRiskComponents.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 truncate max-w-[150px]" title={comp.name}>
                        {getIcon(comp.type)} {comp.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {comp.critical > 0 && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                            {comp.critical}C
                          </span>
                        )}
                        {comp.high > 0 && (
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                            {comp.high}A
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-green-600">Nenhuma ameaca critica ou alta</p>
              )}
            </div>
          </div>

          {/* Conexões */}
          {analysis.connections.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Conexoes ({analysis.connections.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.connections.slice(0, 8).map((conn, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600 border"
                  >
                    {conn.from} → {conn.to}
                    <span className="text-gray-400">({conn.protocol})</span>
                    {conn.encrypted && <span className="text-green-500">🔒</span>}
                  </span>
                ))}
                {analysis.connections.length > 8 && (
                  <span className="text-xs text-gray-400 px-2 py-1">
                    +{analysis.connections.length - 8} mais
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
