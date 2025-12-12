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
import { getRandomInt } from '../../utils/sharedFunctions';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartDataLabels, Title, Tooltip, Legend, annotationPlugin);

interface ContentVerticalBarChartProps {
  chartTitle: string;
  labels: string[];
  selectedLabel: string;
  dataSetCount: number;
  legendPos?: string;
  dataSet1: any;
  dataSet2?: any;
  dataSet3?: any;
  dataSet4?: any;
  dataSet1Name: string;
  dataSet2Name?: string;
  dataSet3Name?: string;
  dataSet4Name?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  chartOptions?: ChartOptions<'bar'>;
  chartData?: ChartData<'bar'>;
}

/**
 * Vertical Bar Chart receiving between 1 and 4 datasets for the y-axis whereas labels describe the x-axis
 * @param {*} props barCount | labels | chartTitle | dataSet1 | dataSet2 | dataSet3 | dataSet4 | dataSet1Name | dataSet2Name | dataSet3Name | dataSet4Name | color1 | color2 | color3 | color4
 * @returns
 */
export default function ContentVerticalBarChart(props: ContentVerticalBarChartProps) {
  const { palette } = useTheme();
  const {
    chartTitle,
    selectedLabel,
    dataSetCount,
    chartOptions,
    chartData,
    dataSet1,
    dataSet2,
    dataSet3,
    dataSet4,
    dataSet1Name,
    dataSet2Name,
    dataSet3Name,
    dataSet4Name,
    color1,
    color2,
    color3,
    color4,
    legendPos
  } = props;
  const labels = props.labels
    ? props.labels
    : ['Mai 2020 - Juni 2022', 'Juli 2022 - Dezember 2022', 'Januar 2023 - Mai 2023', 'Juni 2023 - aktuell'];
  let selectedLabelIndex = -1;
  let maxValueYaxis = 0;
  // finds Index of selected Label for x Axis box highlighting via chartjs-plugin-annotation
  if (selectedLabel) {
    labels.forEach((e, i) => {
      if (e === selectedLabel) selectedLabelIndex = i;
    });
    // finds maximum Y value within all datasets for y Axis box highlighting via chartjs-plugin-annotation
    if (dataSet1) {
      const currentMax = Math.max(...dataSet1);
      maxValueYaxis = currentMax;
    }
    if (dataSet2) {
      const currentMax = Math.max(...dataSet2);
      maxValueYaxis < currentMax ? currentMax : maxValueYaxis;
    }
    if (dataSet3) {
      const currentMax = Math.max(...dataSet3);
      maxValueYaxis < currentMax ? currentMax : maxValueYaxis;
    }
    if (dataSet4) {
      const currentMax = Math.max(...dataSet4);
      maxValueYaxis < currentMax ? currentMax : maxValueYaxis;
    }
  }

  const options = {
    ...chartOptions,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: false
      },
      legend: {
        position: legendPos ? legendPos : 'left'
      },
      title: {
        display: true,
        text: chartTitle ? chartTitle : 'Chart.js Bar Chart'
      },
      annotation: {
        annotations: {
          box1: {
            type: 'box',
            xMin: selectedLabelIndex !== -1 ? selectedLabelIndex - 0.5 : -1,
            xMax: selectedLabelIndex !== -1 ? selectedLabelIndex + 0.5 : -1,
            yMin: 0,
            yMax: Math.ceil(maxValueYaxis) + 1,
            drawTime: 'beforeDraw',
            backgroundColor: 'rgba(235,165,62,0.2)'
          }
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
      }
    ]
  };

  /**
   * Removes elements from the data array if amount of bars is lower than 4
   */
  if (dataSetCount === 3) {
    data.datasets.pop();
  } else if (dataSetCount === 2) {
    data.datasets.pop();
    data.datasets.pop();
  } else if (dataSetCount === 1) {
    data.datasets.pop();
    data.datasets.pop();
    data.datasets.pop();
  }

  return <Bar options={options as any} data={data} />;
}
