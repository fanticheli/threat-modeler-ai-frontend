import { Badge } from '@/components/ui/badge';
import { Severity } from '@/types/analysis';
import { cn } from '@/lib/utils';

const severityConfig: Record<Severity, { label: string; className: string }> = {
  critical: { label: 'CRITICAL', className: 'bg-severity-critical/20 text-severity-critical border-severity-critical/30' },
  high: { label: 'HIGH', className: 'bg-severity-high/20 text-severity-high border-severity-high/30' },
  medium: { label: 'MEDIUM', className: 'bg-severity-medium/20 text-severity-medium border-severity-medium/30' },
  low: { label: 'LOW', className: 'bg-severity-low/20 text-severity-low border-severity-low/30' },
};

export const SeverityBadge = ({ severity, count }: { severity: Severity; count?: number }) => {
  const config = severityConfig[severity];
  return (
    <Badge className={cn('uppercase tracking-wider text-[10px] font-bold border', config.className)}>
      {config.label}{count !== undefined ? `: ${count}` : ''}
    </Badge>
  );
};
