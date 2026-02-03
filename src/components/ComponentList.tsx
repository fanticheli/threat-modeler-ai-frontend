'use client';

import { Component } from '@/types';

interface ComponentListProps {
  components: Component[];
}

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

const typeLabels: Record<string, string> = {
  user: 'Usuario',
  users: 'Usuarios',
  client: 'Cliente',
  server: 'Servidor',
  webserver: 'Web Server',
  appserver: 'App Server',
  web_server: 'Web Server',
  app_server: 'App Server',
  application: 'Aplicacao',
  compute: 'Compute',
  ec2: 'EC2',
  instance: 'Instance',
  container: 'Container',
  database: 'Database',
  db: 'Database',
  rds: 'RDS',
  sql: 'SQL',
  nosql: 'NoSQL',
  dynamodb: 'DynamoDB',
  api: 'API',
  api_gateway: 'API Gateway',
  gateway: 'Gateway',
  load_balancer: 'Load Balancer',
  loadbalancer: 'Load Balancer',
  lb: 'Load Balancer',
  alb: 'ALB',
  nlb: 'NLB',
  elb: 'ELB',
  firewall: 'Firewall',
  waf: 'WAF',
  shield: 'Shield',
  security_group: 'Security Group',
  cache: 'Cache',
  redis: 'Redis',
  elasticache: 'ElastiCache',
  memcached: 'Memcached',
  queue: 'Queue',
  sqs: 'SQS',
  sns: 'SNS',
  mq: 'MQ',
  messaging: 'Messaging',
  storage: 'Storage',
  s3: 'S3',
  blob: 'Blob',
  efs: 'EFS',
  file_storage: 'File Storage',
  cdn: 'CDN',
  cloudfront: 'CloudFront',
  distribution: 'Distribution',
  search: 'Search',
  elasticsearch: 'Elasticsearch',
  opensearch: 'OpenSearch',
  solr: 'Solr',
  serverless: 'Serverless',
  lambda: 'Lambda',
  function: 'Function',
  monitoring: 'Monitoring',
  cloudwatch: 'CloudWatch',
  logging: 'Logging',
  metrics: 'Metrics',
  security: 'Security',
  kms: 'KMS',
  iam: 'IAM',
  secrets: 'Secrets',
  vault: 'Vault',
  email: 'Email',
  ses: 'SES',
  smtp: 'SMTP',
  backup: 'Backup',
  snapshot: 'Snapshot',
  network: 'Network',
  vpc: 'VPC',
  subnet: 'Subnet',
  external_service: 'External',
  external: 'External',
  third_party: 'Third Party',
  saas: 'SaaS',
};

export default function ComponentList({ components }: ComponentListProps) {
  const getIcon = (type: string) => typeIcons[type.toLowerCase()] || '📦';
  const getLabel = (type: string) => typeLabels[type.toLowerCase()] || type;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {components.map((component) => (
        <div
          key={component.id}
          className="bg-white rounded-lg shadow p-4 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">
              {getIcon(component.type)}
            </span>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
              {getLabel(component.type)}
            </span>
          </div>
          <h4 className="font-medium text-gray-800 truncate">{component.name}</h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {component.description}
          </p>
          {component.provider && (
            <span className="text-xs text-blue-500 mt-2 inline-block">
              {component.provider.toUpperCase()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
