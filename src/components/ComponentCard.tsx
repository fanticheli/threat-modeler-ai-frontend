import { Component } from '@/types/analysis';
import { motion } from 'framer-motion';
import {
  Server, Database, Globe, Shield, Cloud, HardDrive,
  Radio, Zap, Eye, Mail, Network, Users, Search, Archive, Box
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, React.ElementType> = {
  server: Server,
  database: Database,
  cdn: Globe,
  waf: Shield,
  load_balancer: Network,
  cache: HardDrive,
  storage: Archive,
  queue: Radio,
  serverless: Zap,
  monitoring: Eye,
  security: Shield,
  email: Mail,
  network: Network,
  user: Users,
  search: Search,
  backup: Archive,
};

interface ComponentCardProps {
  component: Component;
  threatCount: number;
  maxSeverity?: string;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export const ComponentCard = ({
  component, threatCount, maxSeverity, isSelected, onClick, index
}: ComponentCardProps) => {
  const Icon = typeIcons[component.type] || Box;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        'glass-card rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-muted/30',
        isSelected && 'ring-1 ring-primary bg-primary/5'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{component.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {component.type}
            </Badge>
            {threatCount > 0 && (
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider',
                maxSeverity === 'critical' && 'text-severity-critical',
                maxSeverity === 'high' && 'text-severity-high',
                maxSeverity === 'medium' && 'text-severity-medium',
                maxSeverity === 'low' && 'text-severity-low',
              )}>
                {threatCount} ameaças
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
