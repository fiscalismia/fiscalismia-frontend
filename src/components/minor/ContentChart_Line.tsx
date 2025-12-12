import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { resourceProperties as res } from '../../resources/resource_properties';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTheme } from '@mui/material/styles';
import { getRandomInt } from '../../utils/sharedFunctions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartDataLabels,
  Title,
  Tooltip,
  Filler,
  Legend,
  annotationPlugin
);

interface ContentLineChartProps {
  chartTitle: string;
  labels: string[];
  selectedLabel: string;
  dataSetCount: number;
  dataSet1: any;
  dataSet2?: any;
  selectionColor?: string;
  pointColor1?: string;
  dataSet1Name: string;
  lineColor1?: string;
  dataSet1Order?: number;
  dataSet2Name?: string;
  pointColor2?: string;
  lineColor2?: string;
  dataSet2Order?: number;
  chartOptions?: ChartOptions<'line'>;
  chartData?: ChartData<'line'>;
}

type DateComparison = {
  date: string;
  dateDiff: number;
  index: number;
};

/**
 * Horizontal Line Chart for multi-purpose use allowing for two datasets.
 * If a single dataset is present, it can be used by several Components as it is relatively straight forward without custom logic.
 * If two datasets are provided, the difference in values between both is displayed as a tooltip.
 * @param {ContentLineChartProps} props
 * @returns
 */
export default function ContentLineChart(props: ContentLineChartProps) {
  const { palette } = useTheme();
  const {
    selectedLabel,
    dataSet1,
    dataSet2,
    dataSetCount,
    chartOptions,
    chartData,
    chartTitle,
    pointColor1,
    dataSet1Name,
    dataSet1Order,
    lineColor1,
    dataSet2Order,
    lineColor2,
    dataSet2Name,
    pointColor2,
    selectionColor
  } = props;
  const labels = props.labels
    ? props.labels
    : ['Mai 2020 - Juni 2022', 'Juli 2022 - Dezember 2022', 'Januar 2023 - Mai 2023', 'Juni 2023 - aktuell'];

  let maxValueYaxis: number = 0;
  let selectedLabelIndex: number = -1;
  let yValueDifference: number = 0;
  // finds Index of selected Label for x Axis box highlighting via chartjs-plugin-annotation
  if (selectedLabel) {
    labels.forEach((e: string, i: number) => {
      if (e === selectedLabel) {
        selectedLabelIndex = i;
      }
    });
    if (dataSetCount === 1) {
      // finds current y value at the selected x axis to limit the selection border box in height
      maxValueYaxis = dataSet1[selectedLabelIndex];
    }
    if (dataSetCount === 2) {
      // finds current y value at the selected x axis and looks in both datasets for the respective maximum
      let selectedDs1Max: number = 0;
      let selectedDs2Max: number = 0;
      let ds1Selected = false;
      let ds2Selected = false;
      dataSet1.forEach((e: any) => {
        if (e.x === selectedLabel) {
          selectedDs1Max = e.y;
          ds1Selected = true;
        }
      });
      dataSet2.forEach((e: any) => {
        if (e.x === selectedLabel) {
          selectedDs2Max = e.y;
          ds2Selected = true;
        }
      });
      maxValueYaxis = selectedDs1Max > selectedDs2Max ? selectedDs1Max : selectedDs2Max;
      // retreives difference between y values applicable at the selected Date
      const selectedDate: number = Date.parse(selectedLabel);
      if (ds1Selected && !ds2Selected) {
        // initialize y value of non-selected dataset 2 applicable at given date
        const previousDateIndex = dataSet2
          .map((e: any, i: number): DateComparison => {
            return {
              date: e.x,
              dateDiff: selectedDate - Date.parse(e.x), // calculate time difference between dates
              index: i
            };
          })
          .filter((e: DateComparison) => e.dateDiff > 0) // filter out higher dates
          .sort((a: DateComparison, b: DateComparison) => a.dateDiff > b.dateDiff)[0].index; // sort by smallest date difference to receive previous date // retrieve index of previous date
        selectedDs2Max = dataSet2[previousDateIndex].y;
      } else if (!ds1Selected && ds2Selected) {
        const previousDateIndex = dataSet1
          .map((e: any, i: number): DateComparison => {
            return {
              date: e.x,
              dateDiff: selectedDate - Date.parse(e.x), // calculate time difference between dates
              index: i
            };
          })
          .filter((e: DateComparison) => e.dateDiff > 0) // filter out higher dates
          .sort((a: DateComparison, b: DateComparison) => a.dateDiff > b.dateDiff)[0].index; // sort by smallest date difference to receive previous date // retrieve index of previous date
        selectedDs1Max = dataSet1[previousDateIndex].y;
      }
      // if selectedLabel is in both datasets, both maxes are initialized
      yValueDifference =
        selectedDs1Max > selectedDs2Max ? selectedDs1Max - selectedDs2Max : selectedDs2Max - selectedDs1Max;
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
        position: 'top' as const
      },
      title: {
        display: dataSetCount === 1 ? false : true,
        text: chartTitle ? chartTitle : 'Chart.js Bar Chart'
      },
      annotation: {
        annotations: {
          box1: {
            type: 'box',
            xMin: selectedLabelIndex,
            xMax: selectedLabelIndex,
            yMin: 0,
            yMax: Math.ceil(maxValueYaxis),
            drawTime: 'afterDraw',
            borderWidth: 4,
            borderColor: selectionColor ? selectionColor : 'rgba(182,32,32,0.8)'
          },
          label1: {
            type: 'label',
            display: dataSetCount === 2 ? true : false, // only display if 2 lines are present (e.g. income vs. costs)
            xValue: selectedLabelIndex,
            xAdjust: selectedLabelIndex === labels.length - 1 ? -60 : 60, // if selected label is at the right corner, invert x offset of label
            yAdjust: 20,
            yValue: maxValueYaxis,
            borderWidth: 2,
            borderColor: palette.grey[900],
            callout: {
              display: true,
              position: selectedLabelIndex === labels.length - 1 ? 'right' : 'left', // if selected label is at the right corner, invert position
              borderWidth: 1,
              borderColor: palette.grey[900],
              margin: 5
            },
            backgroundColor: pointColor1 ? props!.pointColor1 : 'rgba(64,64,64,0.7)',
            content: [res.BUDGET, yValueDifference],
            font: {
              weight: '600' as const,
              size: 14
            }
          }
        }
      }
    }
  };

  const line1Config = {
    point: {
      pointStyle: 'circle',
      radius: 5,
      hoverRadius: 10,
      borderWidth: 1
    },
    line: {
      borderWidth: 2,
      tension: 0.1,
      borderJoinStyle: 'bevel'
    }
  };

  const line2Config = {
    point: {
      pointStyle: 'rect',
      borderWidth: 1,
      radius: 8,
      hoverRadius: 16
    },
    line: {
      borderWidth: 2,
      tension: 0.1,
      borderJoinStyle: 'bevel'
    }
  };

  const data = {
    ...chartData,
    labels: labels,
    datasets: [
      {
        fill: true,
        label: dataSet1Name ? dataSet1Name : 'Dataset 1',
        data: dataSet1 ? dataSet1 : labels.map(() => getRandomInt(0, 100)),
        backgroundColor: pointColor1 ? pointColor1 : 'rgba(64,64,64,0.7)',
        borderColor: lineColor1 ? lineColor1 : 'rgba(94,85,23,0.7)',
        elements: line1Config,
        order: dataSet1Order ? dataSet1Order : 1 // Datasets with higher order are drawn first
      },
      {
        fill: true,
        label: dataSet2Name ? dataSet2Name : 'Dataset 2',
        data: dataSet2 ? dataSet2 : labels.map(() => getRandomInt(-1000, 1000)),
        backgroundColor: pointColor2 ? pointColor2 : 'rgba(64,64,64,0.6)',
        borderColor: lineColor2 ? lineColor2 : 'rgba(18, 28, 84, 0.7)',
        elements: line2Config,
        order: dataSet2Order ? dataSet2Order : 0
      }
    ]
  };

  /**
   * Removes elements from the data array if amount of bars is lower than 2
   */
  if (dataSetCount === 1) {
    data.datasets.pop();
  }

  return <Line options={options as any} data={data} />;
}
