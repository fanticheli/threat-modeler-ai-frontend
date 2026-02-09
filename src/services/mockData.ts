import { Analysis } from '@/types/analysis';

export const mockAnalysis: Analysis = {
  id: 'analysis-001',
  status: 'completed',
  language: 'pt-br',
  imageUrl: '/placeholder.svg',
  createdAt: '2026-02-08T14:30:00Z',
  result: {
    metadata: {
      provider: 'aws',
      diagramType: 'Architecture Diagram',
      totalComponents: 8,
      totalConnections: 12,
      totalThreats: 23,
      criticalThreats: 3,
      highThreats: 7,
      mediumThreats: 9,
      lowThreats: 4,
      overallRiskScore: 72,
    },
    components: [
      { id: 'c1', name: 'API Gateway', type: 'server', provider: 'AWS', description: 'Amazon API Gateway - REST API endpoint', category: 'Compute' },
      { id: 'c2', name: 'Lambda Functions', type: 'serverless', provider: 'AWS', description: 'AWS Lambda - Serverless compute', category: 'Compute' },
      { id: 'c3', name: 'RDS PostgreSQL', type: 'database', provider: 'AWS', description: 'Amazon RDS - Primary database', category: 'Database' },
      { id: 'c4', name: 'ElastiCache Redis', type: 'cache', provider: 'AWS', description: 'Amazon ElastiCache - Session & cache layer', category: 'Database' },
      { id: 'c5', name: 'S3 Bucket', type: 'storage', provider: 'AWS', description: 'Amazon S3 - Static assets & uploads', category: 'Storage' },
      { id: 'c6', name: 'CloudFront CDN', type: 'cdn', provider: 'AWS', description: 'Amazon CloudFront - Content delivery', category: 'Network' },
      { id: 'c7', name: 'WAF', type: 'security', provider: 'AWS', description: 'AWS WAF - Web Application Firewall', category: 'Security' },
      { id: 'c8', name: 'Cognito', type: 'security', provider: 'AWS', description: 'Amazon Cognito - User authentication', category: 'Security' },
    ],
    connections: [
      { source: 'c6', target: 'c7', protocol: 'HTTPS', encrypted: true, description: 'CDN → WAF traffic filtering' },
      { source: 'c7', target: 'c1', protocol: 'HTTPS', encrypted: true, description: 'WAF → API Gateway' },
      { source: 'c1', target: 'c2', protocol: 'HTTPS', encrypted: true, description: 'API Gateway → Lambda invocation' },
      { source: 'c2', target: 'c3', protocol: 'TCP/5432', encrypted: true, description: 'Lambda → RDS connection' },
      { source: 'c2', target: 'c4', protocol: 'TCP/6379', encrypted: false, description: 'Lambda → ElastiCache (unencrypted!)' },
      { source: 'c2', target: 'c5', protocol: 'HTTPS', encrypted: true, description: 'Lambda → S3 API calls' },
      { source: 'c6', target: 'c5', protocol: 'HTTPS', encrypted: true, description: 'CloudFront → S3 origin' },
      { source: 'c1', target: 'c8', protocol: 'HTTPS', encrypted: true, description: 'API Gateway → Cognito auth' },
      { source: 'c2', target: 'c8', protocol: 'HTTPS', encrypted: true, description: 'Lambda → Cognito token validation' },
      { source: 'c3', target: 'c3', protocol: 'internal', encrypted: true, description: 'RDS Multi-AZ replication' },
      { source: 'c4', target: 'c4', protocol: 'internal', encrypted: false, description: 'ElastiCache cluster sync' },
      { source: 'c5', target: 'c6', protocol: 'HTTPS', encrypted: true, description: 'S3 → CloudFront distribution' },
    ],
    strideAnalysis: [
      {
        componentId: 'c1',
        componentName: 'API Gateway',
        threats: [
          { id: 't1', category: 'Spoofing', title: 'JWT Token Forgery via Weak Signing Algorithm', description: 'If the API Gateway accepts JWTs signed with weak algorithms (e.g., HS256 with a guessable secret), attackers can forge valid tokens and impersonate legitimate users.', severity: 'critical', countermeasures: ['Use RS256 or ES256 for JWT signing', 'Implement token audience and issuer validation', 'Rotate signing keys periodically', 'Enable Cognito advanced security features'] },
          { id: 't2', category: 'Denial of Service', title: 'API Rate Limit Bypass via Header Manipulation', description: 'Attackers may bypass rate limiting by rotating IP addresses, spoofing X-Forwarded-For headers, or using distributed botnets to overwhelm the API Gateway.', severity: 'high', countermeasures: ['Configure WAF rate-based rules', 'Implement per-user rate limiting via API keys', 'Enable API Gateway throttling at stage level', 'Set up CloudWatch alarms for anomalous traffic'] },
          { id: 't3', category: 'Information Disclosure', title: 'Verbose Error Responses Leaking Internal Architecture', description: 'Default API Gateway error responses may expose internal implementation details such as Lambda function names, stack traces, or database error messages.', severity: 'medium', countermeasures: ['Configure custom error responses in API Gateway', 'Implement error transformation in Lambda', 'Remove stack traces from production responses', 'Use API Gateway response templates'] },
        ],
      },
      {
        componentId: 'c2',
        componentName: 'Lambda Functions',
        threats: [
          { id: 't4', category: 'Elevation of Privilege', title: 'Over-Permissive IAM Role Allows Lateral Movement', description: 'Lambda functions with overly broad IAM roles (e.g., AdministratorAccess or s3:*) can be exploited to access resources beyond their intended scope, enabling lateral movement within the AWS account.', severity: 'critical', countermeasures: ['Apply least-privilege IAM policies per function', 'Use IAM Access Analyzer to identify unused permissions', 'Implement resource-based policies on target services', 'Enable AWS CloudTrail for API call auditing'] },
          { id: 't5', category: 'Tampering', title: 'SQL Injection via Unvalidated Input Parameters', description: 'Lambda functions that construct SQL queries using raw string concatenation from API Gateway input parameters are vulnerable to SQL injection attacks.', severity: 'critical', countermeasures: ['Use parameterized queries/prepared statements', 'Implement input validation with JSON Schema', 'Enable API Gateway request validation', 'Use an ORM like Prisma or TypeORM'] },
          { id: 't6', category: 'Repudiation', title: 'Insufficient Logging of Data Modification Events', description: 'Without comprehensive logging of who modified what data and when, it becomes impossible to trace unauthorized changes or prove compliance.', severity: 'medium', countermeasures: ['Implement structured logging with correlation IDs', 'Log all data modification events to CloudWatch', 'Enable X-Ray tracing for request tracking', 'Set up centralized log aggregation'] },
        ],
      },
      {
        componentId: 'c3',
        componentName: 'RDS PostgreSQL',
        threats: [
          { id: 't7', category: 'Information Disclosure', title: 'Unencrypted Database Snapshots Accessible Cross-Account', description: 'RDS snapshots that are shared publicly or cross-account without encryption could expose sensitive data to unauthorized parties.', severity: 'high', countermeasures: ['Enable RDS snapshot encryption with KMS', 'Restrict snapshot sharing permissions', 'Implement automated snapshot lifecycle policies', 'Audit shared snapshots regularly'] },
          { id: 't8', category: 'Tampering', title: 'Direct Database Access via Exposed Security Group', description: 'If the RDS security group allows inbound connections from broad CIDR ranges or 0.0.0.0/0, attackers could directly connect to the database.', severity: 'high', countermeasures: ['Restrict security group to Lambda ENIs only', 'Place RDS in private subnet with no public access', 'Enable RDS IAM authentication', 'Use VPC endpoints for database connections'] },
        ],
      },
      {
        componentId: 'c4',
        componentName: 'ElastiCache Redis',
        threats: [
          { id: 't9', category: 'Information Disclosure', title: 'Missing TLS on Internal Cache Connection', description: 'The Lambda → ElastiCache connection is not encrypted (TCP/6379 without TLS), exposing session tokens, cached user data, and API responses to network-level eavesdropping.', severity: 'high', countermeasures: ['Enable in-transit encryption on ElastiCache', 'Use Redis AUTH with strong passwords', 'Implement encryption at the application layer', 'Monitor VPC Flow Logs for anomalous cache access'] },
          { id: 't10', category: 'Spoofing', title: 'Redis AUTH Bypass Allows Cache Poisoning', description: 'Without Redis AUTH enabled, any service within the VPC subnet can connect to the cache and inject malicious data, potentially poisoning session tokens or cached responses.', severity: 'high', countermeasures: ['Enable Redis AUTH with a strong password', 'Use IAM-based authentication for ElastiCache', 'Restrict security group to specific Lambda ENIs', 'Implement data integrity checks on cached values'] },
        ],
      },
      {
        componentId: 'c5',
        componentName: 'S3 Bucket',
        threats: [
          { id: 't11', category: 'Information Disclosure', title: 'Misconfigured Bucket Policy Allows Public Read', description: 'S3 buckets with overly permissive bucket policies or ACLs could expose sensitive files like user uploads, configuration files, or backups.', severity: 'high', countermeasures: ['Enable S3 Block Public Access at account level', 'Use bucket policies with explicit deny for public access', 'Enable S3 Access Points for fine-grained access', 'Set up S3 Access Analyzer'] },
          { id: 't12', category: 'Tampering', title: 'Object Overwrite Without Versioning', description: 'Without S3 versioning enabled, an attacker who gains write access can silently overwrite or delete objects without any recovery path.', severity: 'medium', countermeasures: ['Enable S3 versioning on all buckets', 'Implement MFA Delete for critical buckets', 'Use S3 Object Lock for compliance', 'Enable CloudTrail data events for S3'] },
        ],
      },
      {
        componentId: 'c6',
        componentName: 'CloudFront CDN',
        threats: [
          { id: 't13', category: 'Denial of Service', title: 'CloudFront Distribution DDoS via Cache Bypass', description: 'Attackers can craft requests with unique query parameters or cache-busting headers to bypass CloudFront cache, forcing every request to hit the origin directly.', severity: 'medium', countermeasures: ['Configure CloudFront cache key normalization', 'Enable AWS Shield Advanced', 'Set up WAF rate-based rules on CloudFront', 'Implement origin request limits'] },
          { id: 't14', category: 'Spoofing', title: 'Domain Fronting via Shared CloudFront Domain', description: 'If using shared CloudFront domains, attackers could potentially route malicious traffic through legitimate-appearing CDN domains.', severity: 'low', countermeasures: ['Use custom domain with dedicated SSL certificate', 'Implement Origin Access Identity (OAI)', 'Monitor CloudFront access logs', 'Enable CloudFront signed URLs for sensitive content'] },
        ],
      },
      {
        componentId: 'c7',
        componentName: 'WAF',
        threats: [
          { id: 't15', category: 'Tampering', title: 'WAF Rule Bypass via Request Encoding', description: 'Attackers may bypass WAF rules using encoding techniques like double URL encoding, Unicode normalization, or chunked transfer encoding.', severity: 'medium', countermeasures: ['Enable WAF body inspection for all content types', 'Use AWS Managed Rule Groups (Core, SQL, Linux)', 'Implement custom regex-based rules', 'Enable WAF logging and analysis'] },
          { id: 't16', category: 'Denial of Service', title: 'WAF Rule Evaluation Exhaustion', description: 'Complex WAF rule sets with regex patterns can be exploited with specially crafted payloads to cause excessive evaluation time, effectively creating a denial of service.', severity: 'low', countermeasures: ['Optimize WAF rule order (most common first)', 'Use rate-based rules before regex rules', 'Monitor WAF CloudWatch metrics', 'Set up auto-scaling for protected resources'] },
        ],
      },
      {
        componentId: 'c8',
        componentName: 'Cognito',
        threats: [
          { id: 't17', category: 'Spoofing', title: 'Account Takeover via Weak Password Policy', description: 'If Cognito user pool password policy is too lenient, attackers can brute-force or use credential stuffing attacks to take over user accounts.', severity: 'high', countermeasures: ['Enforce strong password policy (min 12 chars, complexity)', 'Enable MFA (TOTP or SMS)', 'Implement advanced security features (adaptive auth)', 'Set up compromised credential detection'] },
          { id: 't18', category: 'Repudiation', title: 'Missing Authentication Event Logging', description: 'Without logging authentication events (successful/failed logins, password changes, MFA changes), security incidents cannot be properly investigated.', severity: 'medium', countermeasures: ['Enable Cognito user pool analytics', 'Configure CloudWatch log group for Cognito', 'Set up alerts for suspicious auth patterns', 'Implement custom auth event triggers with Lambda'] },
          { id: 't19', category: 'Elevation of Privilege', title: 'Self-Registration Allows Unauthorized Access', description: 'If self-registration is enabled without proper verification, attackers can create accounts and gain access to protected resources.', severity: 'medium', countermeasures: ['Implement email/phone verification on registration', 'Use pre-signup Lambda trigger for custom validation', 'Restrict Cognito app client allowed auth flows', 'Implement group-based access control'] },
        ],
      },
    ],
  },
};

export const mockAnalysesList: Analysis[] = [
  mockAnalysis,
  {
    id: 'analysis-002',
    status: 'completed',
    language: 'en-us',
    imageUrl: '/placeholder.svg',
    createdAt: '2026-02-07T09:15:00Z',
    result: {
      metadata: {
        provider: 'azure',
        diagramType: 'Microservices Architecture',
        totalComponents: 5,
        totalConnections: 7,
        totalThreats: 14,
        criticalThreats: 1,
        highThreats: 4,
        mediumThreats: 6,
        lowThreats: 3,
        overallRiskScore: 58,
      },
      components: [],
      connections: [],
      strideAnalysis: [],
    },
  },
  {
    id: 'analysis-003',
    status: 'completed',
    language: 'pt-br',
    imageUrl: '/placeholder.svg',
    createdAt: '2026-02-05T16:45:00Z',
    result: {
      metadata: {
        provider: 'gcp',
        diagramType: 'Serverless Architecture',
        totalComponents: 6,
        totalConnections: 9,
        totalThreats: 18,
        criticalThreats: 2,
        highThreats: 5,
        mediumThreats: 7,
        lowThreats: 4,
        overallRiskScore: 65,
      },
      components: [],
      connections: [],
      strideAnalysis: [],
    },
  },
];
