'use client';

import { useEffect, useState } from 'react';
import { WebVital, getRatingColor, formatMetric } from '@/lib/web-vitals';

/**
 * Performance Debug Dashboard
 * Displays Web Vitals in real-time (development only)
 * 
 * Usage: Add <PerformanceDebugDashboard /> to layout in development
 */
export function PerformanceDebugDashboard() {
  const [metrics, setMetrics] = useState<WebVital[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Listen to Web Vitals reports
    const originalLog = console.log;
    console.log = function (...args: any[]) {
      originalLog.apply(console, args);

      // Check if this is a Web Vitals log
      if (args[0]?.includes?.('[Web Vitals Report]')) {
        // Extract metric from console output
        const metricData = args[1];
        if (metricData?.name) {
          const newMetric: WebVital = {
            name: metricData.name,
            value: metricData.value,
            rating: metricData.rating,
            delta: 0,
            id: `${metricData.name}-${Date.now()}`,
            url: metricData.url,
            timestamp: Date.now(),
          };
          setMetrics((prev) => [...prev, newMetric]);
        }
      }
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || metrics.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition"
        title="Toggle Performance Dashboard"
      >
        📊 Vitals
      </button>

      {/* Dashboard Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-4 w-80 max-h-96 overflow-auto">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span>Web Vitals Report</span>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </h3>

          {metrics.length === 0 ? (
            <p className="text-gray-500 text-sm">Waiting for metrics...</p>
          ) : (
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="border-l-4 pl-3 py-2 rounded"
                  style={{ borderColor: getRatingColor(metric.rating) }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm">{metric.name}</div>
                      <div className="text-xs text-gray-600">
                        {formatMetric(metric)}
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded text-white"
                      style={{ backgroundColor: getRatingColor(metric.rating) }}
                    >
                      {metric.rating === 'good'
                        ? '✓ Good'
                        : metric.rating === 'needs-improvement'
                          ? '⚠ Needs Improvement'
                          : '✗ Poor'}
                    </span>
                  </div>
                  {metric.delta !== 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Δ {metric.delta > 0 ? '+' : ''}{metric.delta.toFixed(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t text-xs text-gray-500">
            <p>📍 Route: {metrics[0]?.url || '/'}</p>
            <p>⏱️ Measured: {metrics.length} metric(s)</p>
          </div>
        </div>
      )}
    </div>
  );
}
