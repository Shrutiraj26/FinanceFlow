import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgClass: string;
  valueColor?: string;
  subtitle?: string;
  subtitleHighlight?: string;
  progress?: number;
}

export default function SummaryCard({
  title,
  value,
  icon,
  iconBgClass,
  valueColor = "text-foreground",
  subtitle,
  subtitleHighlight,
  progress
}: SummaryCardProps) {
  return (
    <Card className="p-4 border border-border">
      <div className="flex items-center">
        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${iconBgClass} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-mutedForeground">{title}</p>
          <p className={`text-xl font-semibold ${valueColor}`}>{value}</p>
        </div>
      </div>
      {subtitle && (
        <div className="mt-2">
          <p className="text-xs text-mutedForeground">
            {subtitleHighlight && <span className={valueColor}>{subtitleHighlight}</span>} {subtitle}
          </p>
        </div>
      )}
      {progress !== undefined && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-warning h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </Card>
  );
}
