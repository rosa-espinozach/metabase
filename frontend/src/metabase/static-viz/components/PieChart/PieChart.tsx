import { init } from "echarts";
import { Group } from "@visx/group";
import type { IsomorphicChartProps } from "metabase/static-viz/types";
import { Legend } from "metabase/static-viz/components/Legend";
import { sanitizeSvgForBatik } from "metabase/static-viz/lib/echarts";
import { calculateLegendRows } from "metabase/static-viz/components/Legend/utils";
import { buildPieChart } from "metabase/visualizations/shared/echarts/pie";

const WIDTH = 400;
const HEIGHT = 400;

export const PieChart = ({ rawSeries, environment }: IsomorphicChartProps) => {
  const chart = init(null, null, {
    renderer: "svg",
    ssr: true,
    width: WIDTH,
    height: HEIGHT,
  });

  const { option, legend } = buildPieChart(rawSeries, environment);

  chart.setOption(option);

  const chartSvg = sanitizeSvgForBatik(chart.renderToSVGString());

  const { height: legendHeight, items } = calculateLegendRows(
    legend.map(legendItem => ({
      name: legendItem.title.join(" — "),
      color: legendItem.color,
    })),
    WIDTH,
    24,
    18,
    400,
  )!;

  return (
    <svg width={WIDTH} height={HEIGHT + legendHeight}>
      <Group dangerouslySetInnerHTML={{ __html: chartSvg }}></Group>
      <Group top={HEIGHT}>
        <Legend fontSize={18} fontWeight={400} items={items} />
      </Group>
    </svg>
  );
};
