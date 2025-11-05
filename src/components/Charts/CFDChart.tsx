import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './CFDChart.css';

export interface CFDDataPoint {
  turn: number;
  funnel: number;
  productBacklog: number;
  sprintBacklog: number;
  implementation: number;
  integration: number;
  testing: number;
  preDeployment: number;
  production: number;
}

interface CFDChartProps {
  data: CFDDataPoint[];
  title?: string;
  height?: number;
}

export const CFDChart: React.FC<CFDChartProps> = ({
  data,
  title = "Cumulative Flow Diagram",
  height = 400
}) => {
  // Colors for each column in the workflow
  const colors = {
    funnel: '#e2e8f0',        // Light gray
    productBacklog: '#fed7d7', // Light red
    sprintBacklog: '#fefcbf',  // Light yellow
    implementation: '#c6f6d5', // Light green
    integration: '#bee3f8',    // Light blue
    testing: '#d6bcfa',       // Light purple
    preDeployment: '#fbb6ce',  // Light pink
    production: '#68d391'      // Green
  };

  // Custom tooltip to show detailed information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cfd-tooltip">
          <h4>Turn {label}</h4>
          <div className="tooltip-content">
            <div className="tooltip-item">
              <span className="color-box" style={{ backgroundColor: colors.funnel }}></span>
              <span>Funnel: {data.funnel}</span>
            </div>
            <div className="tooltip-item">
              <span className="color-box" style={{ backgroundColor: colors.productBacklog }}></span>
              <span>Product Backlog: {data.productBacklog}</span>
            </div>
            <div className="tooltip-item">
              <span className="color-box" style={{ backgroundColor: colors.sprintBacklog }}></span>
              <span>Sprint Backlog: {data.sprintBacklog}</span>
            </div>
            <div className="tooltip-item">
              <span className="color-box" style={{ backgroundColor: colors.implementation }}></span>
              <span>Implementation: {data.implementation}</span>
            </div>
            <div className="tooltip-item">
              <span className="color-box" style={{ backgroundColor: colors.integration }}></span>
              <span>Integration: {data.integration}</span>
            </div>
            <div className="tooltip-item">
              <span className="color-box" style={{ backgroundColor: colors.testing }}></span>
              <span>Testing: {data.testing}</span>
            </div>
            <div className="tooltip-item">
              <span className="color-box" style={{ backgroundColor: colors.preDeployment }}></span>
              <span>Pre-Deployment: {data.preDeployment}</span>
            </div>
            <div className="tooltip-item">
              <span className="color-box" style={{ backgroundColor: colors.production }}></span>
              <span>Production: {data.production}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate total items for Y-axis scaling
  const maxItems = Math.max(
    ...data.map(d =>
      d.funnel + d.productBacklog + d.sprintBacklog +
      d.implementation + d.integration + d.testing +
      d.preDeployment + d.production
    )
  );

  return (
    <div className="cfd-chart-container">
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="chart-description">
          <p>Visualizes work distribution across the development workflow over time.</p>
          <p><strong>How to read:</strong> Each colored area represents items in that workflow stage. Wider bands indicate bottlenecks.</p>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="turn"
              label={{ value: 'Sprint Turn', position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              label={{ value: 'Number of Items', angle: -90, position: 'insideLeft' }}
              domain={[0, maxItems + 5]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Production (bottom layer) */}
            <Area
              type="monotone"
              dataKey="production"
              stackId="1"
              stroke={colors.production}
              fill={colors.production}
              name="Production"
            />

            {/* Pre-Deployment */}
            <Area
              type="monotone"
              dataKey="preDeployment"
              stackId="1"
              stroke="#d53f8c"
              fill={colors.preDeployment}
              name="Pre-Deployment"
            />

            {/* Testing */}
            <Area
              type="monotone"
              dataKey="testing"
              stackId="1"
              stroke="#805ad5"
              fill={colors.testing}
              name="Testing"
            />

            {/* Integration */}
            <Area
              type="monotone"
              dataKey="integration"
              stackId="1"
              stroke="#3182ce"
              fill={colors.integration}
              name="Integration"
            />

            {/* Implementation */}
            <Area
              type="monotone"
              dataKey="implementation"
              stackId="1"
              stroke="#38a169"
              fill={colors.implementation}
              name="Implementation"
            />

            {/* Sprint Backlog */}
            <Area
              type="monotone"
              dataKey="sprintBacklog"
              stackId="1"
              stroke="#d69e2e"
              fill={colors.sprintBacklog}
              name="Sprint Backlog"
            />

            {/* Product Backlog */}
            <Area
              type="monotone"
              dataKey="productBacklog"
              stackId="1"
              stroke="#e53e3e"
              fill={colors.productBacklog}
              name="Product Backlog"
            />

            {/* Funnel (top layer) */}
            <Area
              type="monotone"
              dataKey="funnel"
              stackId="1"
              stroke="#718096"
              fill={colors.funnel}
              name="Funnel"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-insights">
        <h4>Key Insights</h4>
        <ul>
          <li><strong>Bottlenecks:</strong> Look for horizontal bands that widen significantly</li>
          <li><strong>Flow:</strong> Smooth diagonal transitions indicate good flow</li>
          <li><strong>Accumulation:</strong> Growing areas show work piling up</li>
          <li><strong>Completion:</strong> Items moving to Production represent delivered value</li>
        </ul>
      </div>
    </div>
  );
};