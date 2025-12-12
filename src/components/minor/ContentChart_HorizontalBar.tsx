import { useTheme } from '@mui/material/styles';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ContentChartHorizontalBarObject } from '../../types/custom/customTypes';
import { getRandomInt } from '../../utils/sharedFunctions';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartDataLabels, Title, Tooltip, Legend, annotationPlugin);

interface ContentHorizontalBarChartProps extends ContentChartHorizontalBarObject {
  chartOptions?: ChartOptions<'bar'>;
  chartData?: ChartData<'bar'>;
}

/**
 * Horizontal Bar Chart receiving up to 6 datasets, primarily designed to be used with a single entry in the labels string[] array.
 * @param {ContentHorizontalBarChartProps} props
 * @returns
 */
export default function ContentHorizontalBarChart(props: ContentHorizontalBarChartProps) {
  const { palette } = useTheme();
  const {
    chartTitle,
    skipTitle,
    dataSetCount,
    chartOptions,
    chartData,
    dataSet1,
    dataSet2,
    dataSet3,
    dataSet4,
    dataSet5,
    dataSet6,
    dataSet1Name,
    dataSet2Name,
    dataSet3Name,
    dataSet4Name,
    dataSet5Name,
    dataSet6Name,
    color1,
    color2,
    color3,
    color4,
    color5,
    color6
  } = props;
  const labels = props.labels ? props.labels : ['Label One', 'Label Two'];

  const maxDatasetValue = Math.max(dataSet1, dataSet2, dataSet3, dataSet4, dataSet5, dataSet6);
  const options = {
    ...chartOptions,
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        suggestedMin: 0,
        suggestedMax:
          maxDatasetValue > 400
            ? maxDatasetValue * 1.33
            : maxDatasetValue > 200
              ? maxDatasetValue * 1.5
              : maxDatasetValue > 100
                ? maxDatasetValue * 1.66
                : maxDatasetValue + 25
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: skipTitle ? false : true,
        text: chartTitle ? chartTitle : 'Chart.js Bar Chart'
      },
      //   __        __  ___  __            __       ___                    __   ___       __
      //  /  ` |  | /__`  |  /  \  |\/|    |  \  /\   |   /\     |     /\  |__) |__  |    /__`
      //  \__, \__/ .__/  |  \__/  |  |    |__/ /~~\  |  /~~\    |___ /~~\ |__) |___ |___ .__/
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        clamp: true,
        font: {
          weight: 500,
          family: 'Roboto',
          size: 14
        },
        color: palette.text.secondary, // default without dataset specific override
        formatter: (_value: any, chartObject: any) => {
          const label = chartObject.dataset.label;
          return `${label}`;
        }
      }
    }
  };

  const barConfig = {
    bar: {
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.7)',
      borderSkipped: 'bottom',
      inflateAmount: 0,
      borderRadius: 0
    }
  };

  const data = {
    ...chartData,
    labels,
    datasets: [
      {
        label: dataSet1Name ? dataSet1Name : 'Dataset 1',
        data: dataSet1 ? dataSet1 : labels.map(() => getRandomInt(0, 100)),
        backgroundColor: color1 ? color1 : palette.primary.main,
        elements: barConfig
      },
      {
        label: dataSet2Name ? dataSet2Name : 'Dataset 2',
        data: dataSet2 ? dataSet2 : labels.map(() => getRandomInt(0, 100)),
        backgroundColor: color2 ? color2 : palette.secondary.main,
        elements: barConfig
      },
      {
        label: dataSet3Name ? dataSet3Name : 'Dataset 3',
        data: dataSet3 ? dataSet3 : labels.map(() => getRandomInt(0, 100)),
        backgroundColor: color3 ? color3 : palette.tertiary.dark,
        elements: barConfig
      },
      {
        label: dataSet4Name ? dataSet4Name : 'Dataset 4',
        data: dataSet4 ? dataSet4 : labels.map(() => getRandomInt(0, 100)),
        backgroundColor: color4 ? color4 : palette.success.dark,
        elements: barConfig
      },
      {
        label: dataSet5Name ? dataSet5Name : 'Dataset 5',
        data: dataSet5 ? dataSet5 : labels.map(() => getRandomInt(0, 100)),
        backgroundColor: color5 ? color5 : palette.warning.dark,
        elements: barConfig
      },
      {
        label: dataSet6Name ? dataSet6Name : 'Dataset 6',
        data: dataSet6 ? dataSet6 : labels.map(() => getRandomInt(0, 100)),
        backgroundColor: color6 ? color6 : palette.error.dark,
        elements: barConfig
      }
    ]
  };

  /**
   * Removes elements from the data array if amount of bars is lower than 6
   */
  if (dataSetCount === 5) {
    data.datasets.pop();
  } else if (dataSetCount === 4) {
    [...new Array(2)].forEach(() => {
      data.datasets.pop();
    });
  } else if (dataSetCount === 3) {
    [...new Array(3)].forEach(() => {
      data.datasets.pop();
    });
  } else if (dataSetCount === 2) {
    [...new Array(4)].forEach(() => {
      data.datasets.pop();
    });
  } else if (dataSetCount === 1) {
    [...new Array(5)].forEach(() => {
      data.datasets.pop();
    });
  }

  return <Bar options={options as any} data={data} />;
}
