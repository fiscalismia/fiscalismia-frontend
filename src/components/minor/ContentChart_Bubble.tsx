import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import { getRandomInt } from '../../utils/sharedFunctions';
import { ContentChartBubbleObject } from '../../types/custom/customTypes';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export const options = {
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

export const data = {
  datasets: [
    {
      label: 'Red dataset',
      data: Array.from({ length: 50 }, () => ({
        x: getRandomInt(-100, 100),
        y: getRandomInt(-100, 100),
        r: getRandomInt(5, 20)
      })),
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    },
    {
      label: 'Blue dataset',
      data: Array.from({ length: 50 }, () => ({
        x: getRandomInt(-100, 100),
        y: getRandomInt(-100, 100),
        r: getRandomInt(5, 20)
      })),
      backgroundColor: 'rgba(53, 162, 235, 0.5)'
    }
  ]
};

interface ContentBubbleChartProps extends ContentChartBubbleObject {
  chartOptions?: ChartOptions<'bubble'>;
  chartData?: ChartData<'bubble'>;
}

/**
 * Bubble Chart receiving between 1 and 10 datasets appear as a singular bubble.
 * Best for displaying relative size differences between unique data.
 * @param _props
 * @returns
 */
export default function ContentBubbleChart(_props: ContentBubbleChartProps) {
  return <Bubble options={options} data={data} />;
}
