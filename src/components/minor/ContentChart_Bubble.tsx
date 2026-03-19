import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import { getRandomInt } from '../../utils/sharedFunctions';
import { ContentChartBubbleObject } from '../../types/custom/customTypes';
import { useTheme } from '@mui/material/styles';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);
const MAX_BUBBLE_COUNT = 20;

interface ContentBubbleChartProps extends ContentChartBubbleObject {
  chartOptions?: ChartOptions<'bubble'>;
  chartData?: ChartData<'bubble'>;
}

/**
 * Bubble Chart receiving between 1 and 20 datasets appear as a singular bubble.
 * Best for displaying relative size differences between unique data.
 * @param props
 * @returns
 */
export default function ContentBubbleChart(props: ContentBubbleChartProps) {
  const { palette } = useTheme();
  const {
    chartTitle,
    dataSetCount,
    chartOptions,
    chartData,
    dataSet1,
    dataSet2,
    dataSet3,
    dataSet4,
    dataSet5,
    dataSet6,
    dataSet7,
    dataSet8,
    dataSet9,
    dataSet10,
    dataSet11,
    dataSet12,
    dataSet13,
    dataSet14,
    dataSet15,
    dataSet16,
    dataSet17,
    dataSet18,
    dataSet19,
    dataSet20,
    dataSet1Name,
    dataSet2Name,
    dataSet3Name,
    dataSet4Name,
    dataSet5Name,
    dataSet6Name,
    dataSet7Name,
    dataSet8Name,
    dataSet9Name,
    dataSet10Name,
    dataSet11Name,
    dataSet12Name,
    dataSet13Name,
    dataSet14Name,
    dataSet15Name,
    dataSet16Name,
    dataSet17Name,
    dataSet18Name,
    dataSet19Name,
    dataSet20Name
  } = props;
  const labels = props.labels ? props.labels : ['One', 'Two'];

  const options = {
    ...chartOptions,
    maintainAspectRatio: false,
    elements: {
      point: {
        pointStyle: 'circle',
        borderColor: '#333',
        backgroundColor: '#333',
        hoverRadius: 15,
        borderWidth: 2,
        hoverBorderWidth: 4
      }
    },
    scales: {
      y: {
        beginAtZero: true
      },
      x: {
        beginAtZero: true
      }
    },
    plugins: {
      datalabels: {
        display: false
      },
      legend: {
        position: 'bottom' as const
      },
      title: {
        display: true,
        text: chartTitle ? chartTitle : 'Chart.js Bubble Chart'
      }
    }
  };
  const datasetConfigs = [
    { data: dataSet1, name: dataSet1Name, color: null, defaultColor: palette.primary.main },
    { data: dataSet2, name: dataSet2Name, color: null, defaultColor: palette.secondary.main },
    { data: dataSet3, name: dataSet3Name, color: null, defaultColor: palette.tertiary.dark },
    { data: dataSet4, name: dataSet4Name, color: null, defaultColor: palette.success.dark },
    { data: dataSet5, name: dataSet5Name, color: null, defaultColor: palette.warning.dark },
    { data: dataSet6, name: dataSet6Name, color: null, defaultColor: palette.error.dark },
    { data: dataSet7, name: dataSet7Name, color: null, defaultColor: palette.info.main },
    { data: dataSet8, name: dataSet8Name, color: null, defaultColor: palette.info.dark },
    { data: dataSet9, name: dataSet9Name, color: null, defaultColor: palette.grey[600] },
    { data: dataSet10, name: dataSet10Name, color: null, defaultColor: palette.grey[800] },
    { data: dataSet11, name: dataSet11Name, color: null, defaultColor: palette.tertiary.main },
    { data: dataSet12, name: dataSet12Name, color: null, defaultColor: palette.tertiary.light },
    { data: dataSet13, name: dataSet13Name, color: null, defaultColor: palette.success.main },
    { data: dataSet14, name: dataSet14Name, color: null, defaultColor: palette.warning.main },
    { data: dataSet15, name: dataSet15Name, color: null, defaultColor: palette.error.main },
    { data: dataSet16, name: dataSet16Name, color: null, defaultColor: palette.primary.dark },
    { data: dataSet17, name: dataSet17Name, color: null, defaultColor: palette.secondary.dark },
    { data: dataSet18, name: dataSet18Name, color: null, defaultColor: palette.text.secondary },
    { data: dataSet19, name: dataSet19Name, color: null, defaultColor: palette.grey[400] },
    { data: dataSet20, name: dataSet20Name, color: null, defaultColor: palette.grey[300] }
  ];

  const data = {
    ...chartData,
    labels: labels,
    // cuts at either the datasetCount or a fixed length to limit displayed bubbles
    datasets: datasetConfigs
      .slice(0, dataSetCount && dataSetCount > MAX_BUBBLE_COUNT ? MAX_BUBBLE_COUNT : dataSetCount)
      .map((e) => {
        return {
          label: e.name ? e.name : 'Dataset 1',
          data: e.data
            ? [e.data]
            : [
                {
                  x: getRandomInt(-100, 100),
                  y: getRandomInt(-100, 100),
                  r: getRandomInt(5, 20)
                }
              ],
          backgroundColor: e.color ? e.color : e.defaultColor
        };
      })
  };

  return <Bubble options={options} data={data} />;
}
