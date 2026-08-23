import { motion } from "motion/react";

export default function AgentStatus() {
  return (
    <div className="agent-status">
      <div className="status-indicator">
        <motion.span
          className="status-pulse"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.9, 0.25, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <span className="status-dot" />
      </div>

      <div>
        <span className="agent-label">Recovery Agent</span>
        <strong>Active</strong>
      </div>
    </div>
  );
}