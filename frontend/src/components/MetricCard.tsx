import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  delay?: number;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay,
      }}
      whileHover={{
        y: -4,
      }}
    >
      <div className="metric-top">
        <span>{title}</span>

        <div className="metric-icon">
          <Icon size={18} />
        </div>
      </div>

      <div className="metric-value">{value}</div>

      <div className="metric-subtitle">{subtitle}</div>
    </motion.div>
  );
}