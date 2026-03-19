import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartOptions,
  ChartData,
  LegendItem,
  Color
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';
import { ContentChartBooleanPieObject } from '../../types/custom/customTypes';
import { locales } from '../../utils/localeConfiguration';

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

interface ContentPieChartProps extends ContentChartBooleanPieObject {
  chartOptions?: ChartOptions<'pie'>;
  chartData?: ChartData<'pie'>;
}

/**
 * Pie Chart receiving between 1 and 2 datasets which form a nested piechart.
 * Primarily designed for datasets with two values best suited for total counts of true/false flags.
 * @param props
 * @returns
 */
export default function ContentBooleanPieChart(props: ContentPieChartProps) {
  const { palette } = useTheme();

  const {
    chartTitle,
    skipTitle,
    dataSet1,
    dataSet2,
    dataSetCount,
    chartOptions,
    chartData,
    dataSet1Colors,
    dataSet1Name,
    dataSet2Name,
    dataSet2Colors
  } = props;
  const labels = props.labels ? props.labels : ['Red', 'Blue'];

  const data = {
    ...chartData,
    labels: labels,
    datasets: [
      {
        label: dataSet1Name ? dataSet1Name : 'Dataset 1',
        data: dataSet1 ? dataSet1 : [12, 19],
        backgroundColor: dataSet1Colors?.backgroundColor
          ? Object.values(dataSet1Colors.backgroundColor)
          : [palette.primary.dark, palette.primary.light],
        borderColor: dataSet1Colors?.borderColor
          ? Object.values(dataSet1Colors.borderColor)
          : [palette.grey[900], palette.grey[900]],
        datalabels: { color: palette.primary.contrastText },
        borderWidth: 2,
        order: 1
      },

      {
        label: dataSet2Name ? dataSet2Name : 'Dataset 2',
        data: dataSet2 ? dataSet2 : [4, 2],
        backgroundColor: dataSet2Colors?.backgroundColor
          ? Object.values(dataSet2Colors.backgroundColor)
          : [palette.secondary.dark, palette.secondary.light],
        borderColor: dataSet2Colors?.borderColor
          ? Object.values(dataSet2Colors.borderColor)
          : [palette.grey[700], palette.grey[700]],
        datalabels: { color: palette.secondary.contrastText },
        borderWidth: 1,
        order: 0
      }
    ]
  };

  const options = {
    ...chartOptions,
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        reverse: true,
        labels: {
          //                ___    __   ___  __     ___  __      __     ___     __             __  ___     __        ___  __   __     __   ___
          // |\/| |  | |     |  | /__` |__  |__) | |__  /__`    |__) | |__     /  ` |__|  /\  |__)  |     /  \ \  / |__  |__) |__) | |  \ |__
          // |  | \__/ |___  |  | .__/ |___ |  \ | |___ .__/    |    | |___    \__, |  | /~~\ |  \  |     \__/  \/  |___ |  \ |  \ | |__/ |___
          /**
           * Custom labels with user defined bg colors matching the style of provided datasets.
           * Also handles visibility based on flag set via clicking the legend.
           * @param chart
           * @returns A formatted Legend Item with correct visibility state
           */
          generateLabels: function (chart: ChartJS) {
            // Get the default label list
            const original = ChartJS.overrides.pie.plugins.legend.labels.generateLabels;
            const labelsOriginal = original.call(this, chart);
            // Build an array of colors used in the datasets of the chart
            let datasetColors = chart.data.datasets.map(function (e) {
              return e.backgroundColor;
            });
            datasetColors = datasetColors.flat();
            // Modify the color and hide state of each label
            labelsOriginal.forEach((label: LegendItem) => {
              if (label && label.index !== undefined) {
                // There are twice as many labels as there are datasets. This converts the label index into the corresponding dataset index
                label.datasetIndex = (label.index - (label.index % 2)) / 2;
                // The hidden state must match the dataset's hidden state
                label.hidden = !chart.isDatasetVisible(label.datasetIndex);
                // Change the color to match the dataset
                label.fillStyle = datasetColors[label.index] as Color;
              }
            });
            return labelsOriginal;
          }
        },
        /**
         * overrides the click event to make a click of a single label hide the corresponding partner label within the dataset.
         * @param _mouseEvent
         * @param legendItem
         * @param legend
         * @param legend.chart
         * @param legend.chart.getDatasetMeta
         * @param legend.chart.isDatasetVisible
         * @param legend.chart.update
         */
        onClick: function (
          _mouseEvent: MouseEvent,
          legendItem: LegendItem,
          legend: {
            chart: {
              getDatasetMeta: (arg0: number | undefined) => { (): any; new (): any; hidden: any };
              isDatasetVisible: (arg0: number | undefined) => any;
              update: () => void;
            };
          }
        ) {
          // toggle the visibility of the dataset from what it currently is
          legend.chart.getDatasetMeta(legendItem.datasetIndex).hidden = legend.chart.isDatasetVisible(
            legendItem.datasetIndex
          );
          legend.chart.update();
        }
      },
      tooltip: {
        callbacks: {
          // see https://www.chartjs.org/docs/latest/configuration/tooltip.html#tooltip-callbacks
          /**
           * Overrides the overlayed tooltip on hover and adds the label and value.
           * @param context
           * @returns label and value string
           */
          label: function (context: any) {
            const labelIndex = context.datasetIndex * 2 + context.dataIndex;
            return context.chart.data.labels[labelIndex] + ': ' + context.formattedValue;
          },
          /**
           *
           * @param context
           * @returns
           */
          title: function (context: any) {
            if (context && context.length > 0 && context[0]?.dataset?.label) {
              return context[0].dataset.label;
            } else {
              return '';
            }
          },
          /**
           * Constructs the footer within hover tooltip listing total amount of values present.
           * @param context
           * @returns footer string of applicable dataset 1 | 2
           */
          footer: function (context: any) {
            if (context && context.length > 0 && context[0]?.dataIndex !== undefined) {
              const dataIndex = context[0].dataIndex;
              if (dataIndex === 0) {
                return `${locales().VARIABLE_EXPENSES_OVERVIEW_TOTAL_PURCHASE_AMOUNT}: ${dataSet1[0] + dataSet1[1]}`;
              } else if (dataIndex === 1) {
                return `${locales().VARIABLE_EXPENSES_OVERVIEW_TOTAL_PURCHASE_AMOUNT}: ${dataSet2[0] + dataSet2[1]}`;
              }
            }
            return null;
          }
        }
      },
      //   __        __  ___  __            __       ___                    __   ___       __
      //  /  ` |  | /__`  |  /  \  |\/|    |  \  /\   |   /\     |     /\  |__) |__  |    /__`
      //  \__, \__/ .__/  |  \__/  |  |    |__/ /~~\  |  /~~\    |___ /~~\ |__) |___ |___ .__/
      datalabels: {
        display: true,
        align: 'center',
        font: {
          weight: 500,
          family: 'Roboto',
          size: 15
        },
        color: '#fff', // default without dataset specific override
        formatter: (value: any, chartObject: any) => {
          // const label = chartObject.chart.data.labels[chartObject.dataIndex];
          const totalValue = chartObject.dataset.data.reduce((add: number, val: number) => {
            return add + val;
          }, 0);
          return `${Math.round((value / totalValue) * 100)}%`;
        }
      },
      title: {
        display: dataSetCount === 1 || skipTitle ? false : true,
        text: chartTitle ? chartTitle : 'Chart.js Pie Chart'
      }
    }
  };

  /**
   * Removes elements from the data array if amount of bars is lower than 2
   */
  if (dataSetCount === 1) {
    data.datasets.pop();
  }

  return <Pie options={options as any} data={data} />;
}
