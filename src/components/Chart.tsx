import { useEffect, useRef } from "react";
import type { Chart as ChartInstance } from "chart.js";

export function Chart({ technical = false }: { technical?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const values = technical
    ? [48, 55, 51, 69, 65, 78, 74, 87, 82, 92, 88, 96]
    : [38, 46, 43, 58, 54, 69, 64, 78, 72, 82, 87, 92];

  useEffect(() => {
    let chart: ChartInstance | undefined;
    let cancelled = false;
    const color = technical ? "#7C5CFC" : "#2563A6";
    void import("chart.js/auto").then(({ default: ChartJS }) => {
      if (cancelled || !canvas.current) return;
      chart = new ChartJS(canvas.current, {
        type: "line",
        data: {
          labels: [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
          ],
          datasets: [
            {
              data: values,
              borderColor: color,
              backgroundColor: `${color}20`,
              fill: true,
              tension: 0.25,
              pointRadius: 3,
              pointBackgroundColor: "#fff",
              pointBorderColor: color,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { displayColors: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#8B98A7", font: { size: 9 } } },
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { stepSize: 25, color: "#8B98A7", font: { size: 9 } },
              grid: { color: "#EDF1F4" },
            },
          },
        },
      });
    });
    return () => {
      cancelled = true;
      chart?.destroy();
    };
  }, [technical]);

  return (
    <div className="chart-canvas">
      <canvas ref={canvas} aria-label="Gráfico de tendencia" />
    </div>
  );
}
