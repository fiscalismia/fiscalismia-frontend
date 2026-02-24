import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import InputVariableExpenseModal from '../minor/Modal_InputVariableExpense';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import { resourceProperties as res } from '../../resources/resource_properties';
import {
  getAllVariableExpenses,
  getAllVariableExpenseStores,
  getAllVariableExpenseCategories,
  getAllVariableExpenseSensitivities
} from '../../services/pgConnections';
import {
  Box,
  Container,
  IconButton,
  Palette,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import {
  constructContentVerticalBarChartObject,
  constructContentCardObject,
  constructContentLineChartObject,
  getUniqueEffectiveMonthYears,
  getUniqueEffectiveYears,
  getUniquePurchasingDates,
  getBreakPointWidth,
  toastOptions
} from '../../utils/sharedFunctions';
import {
  ContentCardObject,
  ContentChartBooleanPieObject,
  ContentChartHorizontalBarObject,
  ContentChartLineObject,
  ContentChartVerticalBarObject,
  RouteInfo
} from '../../types/custom/customTypes';
import ContentCardCosts from '../minor/ContentCard_Costs';
import SelectDropdown from '../minor/SelectDropdown';
import ContentLineChart from '../minor/ContentChart_Line';
import ContentVerticalBarChart from '../minor/ContentChart_VerticalBar';
import { ContentBooleanPieChart } from '../minor/ContentChart_BooleanPie';
import ContentHorizontalBarChart from '../minor/ContentChart_HorizontalBar';
import { locales } from '../../utils/localeConfiguration';
import { toast } from 'react-toastify';

const chartBackgroundProperties = (palette: Palette) => {
  return {
    borderRadius: 0,
    border: `1px solid ${palette.border.dark}`,
    padding: 1,
    backgroundColor: palette.background.default,
    width: '100%'
  };
};

/**
 *
 * Extracts datestrings in the format yyyy without duplicates from raw data
 * @param allVariableExpenses
 * @returns
 */
function getUniquePurchasingDateYears(allVariableExpenses: any): string[] {
  const uniquePurchasingDateArray = getUniquePurchasingDates(allVariableExpenses);
  return getUniqueEffectiveYears(uniquePurchasingDateArray);
}

/**
 * Extracts Month Array in correct locale containing only Months included in raw data.
 * Pass filtered raw data for single year in order to extract the correct values per year
 * @param allVariableExpenses
 * @returns 2D Array of Month name and number strings in the Format [January, February][01,02] in correct locale
 */
function getUniquePurchasingDateMonths(allVariableExpenses: any): (string | RegExp)[][] {
  const uniquePurchasingDateArray = getUniquePurchasingDates(allVariableExpenses);
  // format yyyy-mm
  const uniquePurchasingMonthYears = getUniqueEffectiveMonthYears(uniquePurchasingDateArray);
  // format mm
  const uniqueMonthNumbers = uniquePurchasingMonthYears.map((yearMonthStr: string) => yearMonthStr.substring(5, 7));
  // format [monthname][monthNr] initialized with ALL Aggregate value
  const localeMonthArr: (string | RegExp)[][] = locales().ARRAY_MONTH_ALL.filter((e) => e[0] == res.ALL);
  uniqueMonthNumbers.forEach((monthNr) => {
    // if monthNr matches string between 01-12 we are guaranteed to find an element
    if (monthNr.match(/\b(0[1-9]|1[0-2])\b/)) {
      localeMonthArr.push(locales().ARRAY_MONTH_ALL.find((e) => e[1] == monthNr)!);
    }
  });
  return localeMonthArr;
}

/**
 * Extracts all rows with contains_indulgence flag set to true, splits individual indulgences off and counts the total occurence,
 * subsequently used to populate a horizontal barchart.
 * @param allVariableExpenses
 * @returns
 */
function extractHorizontalBarChartData(allVariableExpenses: any): ContentChartHorizontalBarObject {
  const allVariableExpensesFiltered = allVariableExpenses
    .filter((row: any) => row.category.toLowerCase() !== 'sale')
    .filter((row: any) => row.contains_indulgence)
    .map((e: any): string => (e.indulgences ? e.indulgences.trim() : ''));

  // creates a Map with the indulgence as the key and the summed up occurences as value
  const indulgenceSumMap: Map<string, number> = allVariableExpensesFiltered.reduce(
    (map: Map<string, number>, indulgences: string) => {
      if (!indulgences || (indulgences && indulgences.length === 0)) {
        toast.warn(
          'indulgences is null, please check that each row with the contains_indulgence flag set to true has entries here.',
          toastOptions
        );
      } else {
        const individualIndulgences: string[] = indulgences.split(',');
        individualIndulgences.forEach((item: string) => {
          const indulgence = item.trim();
          if (!map.has(indulgence)) {
            map.set(indulgence, 0);
          }
          map.set(indulgence, map.get(indulgence)! + 1);
        });
      }
      return map;
    },
    new Map<string, number>()
  );

  // Creates a <string,number> Array containing the 6 top indulgences and their number of occurence
  const topIndulgenceArray = Array.from(indulgenceSumMap.entries())
    .sort((a: [string, number], b: [string, number]) => (a[1] < b[1] ? 1 : -1))
    .slice(0, 6)
    .map((e: [string, number]) => {
      return Array.from([e[0], parseInt(e[1].toFixed(0))]);
    });

  const booleanPieChartObj: ContentChartHorizontalBarObject = {
    chartTitle: locales().VARIABLE_EXPENSES_OVERVIEW_INDULGENCE_BAR_CHART_TITLE,
    labels: [''], // To have only one dataset entry rendered without a label, empty label within an array has to be passed.
    dataSetCount: 6,
    skipTitle: true,
    dataSet1: topIndulgenceArray && topIndulgenceArray.length > 0 ? [topIndulgenceArray[0][1] as number] : [],
    dataSet2: topIndulgenceArray && topIndulgenceArray.length > 1 ? [topIndulgenceArray[1][1] as number] : [],
    dataSet3: topIndulgenceArray && topIndulgenceArray.length > 2 ? [topIndulgenceArray[2][1] as number] : [],
    dataSet4: topIndulgenceArray && topIndulgenceArray.length > 3 ? [topIndulgenceArray[3][1] as number] : [],
    dataSet5: topIndulgenceArray && topIndulgenceArray.length > 4 ? [topIndulgenceArray[4][1] as number] : [],
    dataSet6: topIndulgenceArray && topIndulgenceArray.length > 5 ? [topIndulgenceArray[5][1] as number] : [],
    dataSet1Name: topIndulgenceArray && topIndulgenceArray.length > 0 ? (topIndulgenceArray[0][0] as string) : '',
    dataSet2Name: topIndulgenceArray && topIndulgenceArray.length > 1 ? (topIndulgenceArray[1][0] as string) : '',
    dataSet3Name: topIndulgenceArray && topIndulgenceArray.length > 2 ? (topIndulgenceArray[2][0] as string) : '',
    dataSet4Name: topIndulgenceArray && topIndulgenceArray.length > 3 ? (topIndulgenceArray[3][0] as string) : '',
    dataSet5Name: topIndulgenceArray && topIndulgenceArray.length > 4 ? (topIndulgenceArray[4][0] as string) : '',
    dataSet6Name: topIndulgenceArray && topIndulgenceArray.length > 5 ? (topIndulgenceArray[5][0] as string) : ''
  };
  return booleanPieChartObj;
}

/**
 * Extracts the two flags is_planned and contains_indulgence and displays the true/false count in two intertwined pie charts with custom labels.
 * @param allVariableExpenses
 * @param palette
 * @returns ContentChartBooleanPieObject
 */
function extractPieChartData(allVariableExpenses: any, palette: Palette): ContentChartBooleanPieObject {
  const allVariableExpensesFiltered = allVariableExpenses.filter((row: any) => row.category.toLowerCase() !== 'sale');

  let varExpensesPieChartDs1: number[] = [];
  let varExpensesPieChartDs2: number[] = [];

  varExpensesPieChartDs1 = allVariableExpensesFiltered
    .map((e: any) => e.is_planned)
    .reduce(
      (booleanCountArr: number[], currentBooleanValue: boolean) => {
        if (currentBooleanValue) {
          booleanCountArr[0] += 1; // planned
        } else {
          booleanCountArr[1] += 1; // not planned
        }
        return booleanCountArr;
      },
      [0, 0]
    );

  varExpensesPieChartDs2 = allVariableExpensesFiltered
    .map((e: any) => e.contains_indulgence)
    .reduce(
      (booleanCountArr: number[], currentBooleanValue: boolean) => {
        if (!currentBooleanValue) {
          booleanCountArr[0] += 1; // Clean
        } else {
          booleanCountArr[1] += 1; // Indulgence
        }
        return booleanCountArr;
      },
      [0, 0]
    );
  const pieChart1Colors = {
    backgroundColor: {
      pieColor1: palette.tertiary.light,
      pieColor2: palette.tertiary.dark
    },
    borderColor: {
      borderColor1: palette.grey[900],
      borderColor2: palette.grey[900]
    }
  };
  const pieChart2Colors = {
    backgroundColor: {
      pieColor1: palette.secondary.light,
      pieColor2: palette.secondary.dark
    },
    borderColor: {
      borderColor1: palette.grey[800],
      borderColor2: palette.grey[800]
    }
  };
  const booleanPieChartObj: ContentChartBooleanPieObject = {
    chartTitle: 'Boolean Flags',
    skipTitle: true,
    labels: [
      locales().VARIABLE_EXPENSES_OVERVIEW_IS_PLANNED_LABEL_YES,
      locales().VARIABLE_EXPENSES_OVERVIEW_IS_PLANNED_LABEL_NO,
      locales().VARIABLE_EXPENSES_OVERVIEW_CONTAINS_INDULGENCE_LABEL_NO,
      locales().VARIABLE_EXPENSES_OVERVIEW_CONTAINS_INDULGENCE_LABEL_YES
    ],
    dataSetCount: 2,
    dataSet1: varExpensesPieChartDs1,
    dataSet1Name: locales().VARIABLE_EXPENSES_OVERVIEW_IS_PLANNED_TOOLTIP,
    dataSet1Colors: pieChart1Colors,
    dataSet2: varExpensesPieChartDs2,
    dataSet2Name: locales().VARIABLE_EXPENSES_OVERVIEW_CONTAINS_INDULGENCE_TOOLTIP,
    dataSet2Colors: pieChart2Colors
  };
  return booleanPieChartObj;
}
/**
 * Extracts vertical bars for each filtered category, especially Groceries, Leisure, Gift and the combined aggregate Category Health & Body
 * @param {*} allVariableExpenses all variable expenses within db
 * @returns contentChartObj constructed via helper method constructContentVerticalBarChartObject
 */
function extractVerticalBarChartData(allVariableExpenses: any) {
  const barChartColors = {
    color1: '',
    color2: '',
    color3: '',
    color4: ''
  };
  const allVariableExpensesFiltered = allVariableExpenses.filter((row: any) => row.category.toLowerCase() !== 'sale');
  // unique purchasing date substrings in the format yyyy-mm as string array
  const uniqueExpenseDates: string[] = getUniquePurchasingDates(allVariableExpensesFiltered) as string[];
  const varExpensesVerticalBarChartXaxis: string[] = getUniqueEffectiveMonthYears(uniqueExpenseDates) as string[];
  // only read dates from datetime
  const varExpensesVerticalBarChartDs1: number[] = [];
  const varExpensesVerticalBarChartDs2: number[] = [];
  const varExpensesVerticalBarChartDs3: number[] = [];
  const varExpensesVerticalBarChartDs4: number[] = [];
  // for each unique date create an xAxis array with summed up expense values per filtered category
  varExpensesVerticalBarChartXaxis.forEach((xAxisEntry) => {
    varExpensesVerticalBarChartDs1.push(
      allVariableExpensesFiltered
        .filter((row: any) => row.purchasing_date.substring(0, 7) === xAxisEntry)
        .filter(
          (row: any) =>
            row.category.toLowerCase() === locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_GROCERIES.toLowerCase()
        )
        .map((row: any) => parseFloat(row.cost))
        .reduce((partialSum: number, add: number) => partialSum + add, 0)
    );
    varExpensesVerticalBarChartDs2.push(
      allVariableExpensesFiltered
        .filter((row: any) => row.purchasing_date.substring(0, 7) === xAxisEntry)
        .filter(
          (row: any) =>
            row.category.toLowerCase() === locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_LEISURE.toLowerCase()
        )
        .map((row: any) => parseFloat(row.cost))
        .reduce((partialSum: number, add: number) => partialSum + add, 0)
    );
    varExpensesVerticalBarChartDs3.push(
      allVariableExpensesFiltered
        .filter((row: any) => row.purchasing_date.substring(0, 7) === xAxisEntry)
        .filter(
          (row: any) => row.category.toLowerCase() === locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_GIFT.toLowerCase()
        )
        .map((row: any) => parseFloat(row.cost))
        .reduce((partialSum: number, add: number) => partialSum + add, 0)
    );
    varExpensesVerticalBarChartDs4.push(
      allVariableExpensesFiltered
        .filter((row: any) => row.purchasing_date.substring(0, 7) === xAxisEntry)
        .filter(
          (row: any) =>
            row.category.toLowerCase() === locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_HEALTH.toLowerCase() ||
            row.category.toLowerCase() === locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_SUPPLEMENTS.toLowerCase() ||
            row.category.toLowerCase() === locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_HYGIENE.toLowerCase() ||
            row.category.toLowerCase() === locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_MEDICAL_EXPENSES.toLowerCase()
        )
        .map((row: any) => parseFloat(row.cost))
        .reduce((partialSum: number, add: number) => partialSum + add, 0)
    );
  });

  const varExpensesVerticalBarChartDataSet = {
    dataSet1: varExpensesVerticalBarChartDs1,
    dataSet2: varExpensesVerticalBarChartDs2,
    dataSet3: varExpensesVerticalBarChartDs3,
    dataSet4: varExpensesVerticalBarChartDs3,
    dataSet1Name: locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_GROCERIES,
    dataSet2Name: locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_LEISURE,
    dataSet3Name: locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_GIFT,
    dataSet4Name: locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_COMBINED_HEALTH_AND_BODY
  };
  const varExpensesBarChart = constructContentVerticalBarChartObject(
    locales().VARIABLE_EXPENSES_OVERVIEW_BAR_CHART_HEADER,
    varExpensesVerticalBarChartXaxis,
    varExpensesVerticalBarChartDataSet,
    barChartColors
  );

  return { varExpensesBarChart };
}

/**
 *
 * @param {*} allVariableExpenses all variable expenses within db
 * @param palette
 * @returns contentChartObj constructed via helper method constructContentLineChartObject
 */
function extractLineChartData(allVariableExpenses: any, palette: Palette) {
  const overviewColors = {
    pointColor1: palette.tertiary.light,
    lineColor1: 'black',
    selectionColor: palette.error.main
  };
  // No filtering of overall results required
  const overviewFiltered = allVariableExpenses;
  // unique purchasing date substrings in the format yyyy-mm as string array
  const uniqueExpenseDates: string[] = getUniquePurchasingDates(overviewFiltered) as string[];
  const overviewXaxis: string[] = getUniqueEffectiveMonthYears(uniqueExpenseDates) as string[];
  // only read date string from datetime
  const overviewDataset: number[] = [];
  // for each unique date create an xAxis array with summed up monthly_cost values
  overviewXaxis.forEach((xAxisEntry) => {
    overviewDataset.push(
      overviewFiltered
        .filter((row: any) => row.purchasing_date.substring(0, 7) === xAxisEntry)
        .map((row: any) => parseFloat(row.cost))
        .reduce((partialSum: number, add: number) => partialSum + add, 0)
    );
  });

  const overviewDataSets = {
    dataSet1: overviewDataset,
    dataSet1Name: locales().VARIABLE_EXPENSES_OVERVIEW_LINE_CHART_HEADER
  };
  const overview = constructContentLineChartObject(
    locales().VARIABLE_EXPENSES_OVERVIEW_LINE_CHART_HEADER,
    overviewXaxis,
    overviewDataSets,
    overviewColors
  );

  return { overview };
}

/**
 * Transforms a list of Objects from the db into simple arrays
 * @param allStores
 * @param allCategories
 * @param allSensitivities
 * @returns
 * storeAutoCompleteItemArray: unique stores within variable expenses
 * categoryAutoCompleteItemArray: unique categories within variable expenses
 * indulgencesAutoCompleteItemArray: unique indulgences within variable expenses
 */
function getDataStructuresForAutocomplete(allStores: any[], allCategories: any[], allSensitivities: any[]) {
  const storeArray: string[] = [];
  allStores.forEach((e, i: number) => {
    storeArray[i] = `${e.description}`;
  });
  const categoryArray: string[] = [];
  allCategories.forEach((e, i: number) => {
    categoryArray[i] = `${e.description}`;
  });
  const indulgenceArray: string[] = [];
  allSensitivities.forEach((e, i: number) => {
    indulgenceArray[i] = `${e.description}`;
  });
  const storeAutoCompleteItemArray = Array.from(new Set(storeArray)).sort();
  const categoryAutoCompleteItemArray = Array.from(new Set(categoryArray)).sort();
  const indulgencesAutoCompleteItemArray = Array.from(new Set(indulgenceArray)).sort();
  return { storeAutoCompleteItemArray, categoryAutoCompleteItemArray, indulgencesAutoCompleteItemArray };
}

/**
 * Extracts the total expenses per category and returns an array of the categories with the largest expenses for the entire provided dataset.
 * @param allVariableExpenses
 * @returns 2d array consisting of 1-6 elements containing ["category name", summed_cost]
 */
function aggregateCostsPerCategory(allVariableExpenses: any): (string | number)[][] {
  type CategoryCostObj = { category: string; cost: number };
  const categoryCostsArr: CategoryCostObj[] = allVariableExpenses
    .filter((row: any) => row.category.toLowerCase() !== 'sale')
    .map((e: any) => {
      return { category: e.category, cost: parseFloat(e.cost) };
    });

  // creates a Map with category as the key and the summed up cost as value
  const categorySumMap = categoryCostsArr.reduce((map, item) => {
    if (!map.has(item.category)) {
      map.set(item.category, 0);
    }
    map.set(item.category, map.get(item.category)! + item.cost);
    return map;
  }, new Map<string, number>());

  // Creates a <string,number> Array containing the 6 categories with the largest expense total
  return Array.from(categorySumMap.entries())
    .sort((a: [string, number], b: [string, number]) => (a[1] < b[1] ? 1 : -1))
    .slice(0, 6)
    .map((e: [string, number]) => {
      return Array.from([e[0], parseFloat(e[1].toFixed(2))]);
    });
}

// TODO create custom type for purchase info
/**
 *
 * @param allVariableExpenses
 * @param isMonthly
 * @returns
 */
function extractAggregatedPurchaseInformation(allVariableExpenses: any, isMonthly: boolean) {
  const yearlyTotalExpenseCard = constructContentCardObject(
    locales().VARIABLE_EXPENSES_OVERVIEW_TOTAL_EXPENSES,
    null,
    isMonthly ? '1.00' : '12.00',
    null,
    null,
    res.NO_IMG
  );
  const categoryCards: ContentCardObject[] = [];

  const costsPerCategory: (string | number)[][] = aggregateCostsPerCategory(allVariableExpenses);
  costsPerCategory.forEach((e: (string | number)[]) => {
    categoryCards.push(
      constructContentCardObject(e[0].toString(), Number(e[1]), isMonthly ? '1.00' : '12.00', null, null, res.NO_IMG)
    );
  });

  yearlyTotalExpenseCard.amount = allVariableExpenses
    .filter((row: any) => row.category.toLowerCase() !== 'sale')
    .map((row: any) => parseFloat(row.cost))
    .reduce((partialSum: number, add: number) => partialSum + add, 0);
  const purchaseInfo = {
    totalCard: yearlyTotalExpenseCard,
    categoryCards: categoryCards
  };
  return purchaseInfo;
}

interface VariableExpenses_OverviewProps {
  routeInfo: RouteInfo;
}

/**
 *
 * @param _props
 * @returns
 */
export default function VariableExpenses_Overview(_props: VariableExpenses_OverviewProps) {
  const { palette, breakpoints } = useTheme();
  // Variable Expense Data for Display
  const [allVariableExpenses, setAllVariableExpenses] = useState<any>(null);
  const [selectedVariableExpenses, setSelectedVariableExpenses] = useState<any>();
  const [aggregatedPurchaseInformation, setAggregatedPurchaseInformation] = useState<any>();
  // Monthly/Yearly Expenses Visualized in Linechart showing the total expenditure per month
  const [expenseLineChartData, setExpenseLineChartData] = useState<ContentChartLineObject>();
  // Monthly/Yearly Expenses Visualized in Vertical Barchart - one slice per month
  const [expenseVerticalBarChartData, setExpenseVerticalBarChartData] = useState<ContentChartVerticalBarObject>();
  // Dual Pie Chart is_planned yes/no piechart & contains indulgence yes/no pie chart
  const [expensePieChartData, setExpensePieChartData] = useState<ContentChartBooleanPieObject>();
  // Horizontal Bar Chart Aggregating Indulgences/Sensitivities
  const [indulgencesHorizontalBarChartData, setIndulgencesHorizontalBarChartData] =
    useState<ContentChartHorizontalBarObject>();
  const [selectedChartLabel, setSelectedChartLabel] = useState<string>('');
  // year selection
  const [yearsWithPurchases, setYearsWithPurchases] = useState<string[][]>();
  const [selectedYear, setSelectedYear] = useState<string>();
  const [monthsWithPurchasesInSelectedYear, setMonthsWithPurchasesInSelectedYear] = useState<(string | RegExp)[][]>();
  const [selectedMonth, setSelectedMonth] = useState<string>(locales().ARRAY_MONTH_ALL[0][0] as string); // default All Month Aggregate
  // to refresh table based on added food item after DB insertion
  const [addedItemId, setAddedItemId] = useState<number>();
  const [renderAllExpenseRows, setRenderAllExpenseRows] = useState<boolean>(false);
  // Autocomplete Data for InputModal
  const [storeAutoCompleteItemArray, setStoreAutoCompleteItemArray] = useState<string[]>([]);
  const [categoryAutoCompleteItemArray, setCategoryAutoCompleteItemArray] = useState<string[]>([]);
  const [indulgencesAutoCompleteItemArray, setIndulgencesAutoCompleteItemArray] = useState<string[]>([]);

  // width for page content based on current window width extracted from supplied breakpoints.
  const breakpointWidth = getBreakPointWidth(breakpoints);
  const tableHeadStyling = {
    backgroundColor: palette.primary.dark,
    '> th': { color: palette.common.white, letterSpacing: 1, fontWeight: 500 }
  };
  const tableRowStyling = {
    '&:nth-of-type(odd)': { backgroundColor: 'rgba(128,128,128,0.7)' },
    '&:nth-of-type(even)': { backgroundColor: 'rgba(184,184,184,0.8)' },
    '&:last-child td, &:last-child th': { border: 0 }
  };
  const toggleButtonStylingProps = {
    borderRadius: 0,
    paddingX: 2.0,
    '&:hover': {
      bgcolor: palette.mode === 'light' ? palette.grey[600] : palette.grey[600],
      color: palette.common.white
    },
    '&.Mui-selected:hover': {
      bgcolor: palette.mode === 'light' ? palette.grey[800] : palette.grey[500]
    },
    '&.Mui-selected': {
      bgcolor: palette.mode === 'light' ? palette.grey[900] : palette.grey[400],
      color: palette.mode === 'light' ? palette.common.white : palette.common.black,
      boxShadow: palette.mode === 'light' ? `0px 0px 4px 2px ${palette.grey[700]}` : '',
      transition: 'box-shadow 0.2s linear 0s'
    },
    '&.Mui-disabled': {
      color: palette.text.disabled
    }
  };
  useEffect(() => {
    const getAllPricesAndDiscounts = async () => {
      const allVariableExpenses = await getAllVariableExpenses();
      const uniqueYears: string[] = getUniquePurchasingDateYears(allVariableExpenses.results);
      setYearsWithPurchases(new Array(uniqueYears)); // Creates 2D Array for mapping ToggleButtonGroup as parent
      const allStores = await getAllVariableExpenseStores();
      const allCategories = await getAllVariableExpenseCategories();
      const allSensitivities = await getAllVariableExpenseSensitivities();
      setAllVariableExpenses(allVariableExpenses.results);
      const autoCompleteItemArrays = getDataStructuresForAutocomplete(
        allStores.results,
        allCategories.results,
        allSensitivities.results
      );
      setStoreAutoCompleteItemArray(autoCompleteItemArrays.storeAutoCompleteItemArray);
      setCategoryAutoCompleteItemArray(autoCompleteItemArrays.categoryAutoCompleteItemArray);
      setIndulgencesAutoCompleteItemArray(autoCompleteItemArrays.indulgencesAutoCompleteItemArray);
    };
    getAllPricesAndDiscounts();
  }, [addedItemId, selectedYear]);

  const handleYearSelection = (_event: React.MouseEvent<HTMLElement> | null, newValue: string) => {
    setSelectedYear(newValue);
    // filter all expenses by preselected year and remove negative values (Sales)
    const filteredYearVarExpenses = allVariableExpenses
      .filter((e: any) => e.purchasing_date.substring(0, 4) === newValue)
      .filter((e: any) => parseFloat(e.cost) > 0);
    setSelectedVariableExpenses(filteredYearVarExpenses);
    // Month Selection - Initialize with Aggregate All
    setMonthsWithPurchasesInSelectedYear(getUniquePurchasingDateMonths(filteredYearVarExpenses));
    handleSelectMonth(res.ALL);
    // Line Chart aggregating total expenses per month
    const varExpenseLineChartAggregate = extractLineChartData(filteredYearVarExpenses, palette);
    setExpenseLineChartData(varExpenseLineChartAggregate.overview);
    // Bar Chart Displaying Sum per predefined Categories
    const varExpenseVerticalBarChartAggregate = extractVerticalBarChartData(filteredYearVarExpenses);
    setExpenseVerticalBarChartData(varExpenseVerticalBarChartAggregate.varExpensesBarChart);
    // Pie Chart displaying is_planned and contains_indulgence flags
    const varExpenseBooleanPieChart = extractPieChartData(filteredYearVarExpenses, palette);
    setExpensePieChartData(varExpenseBooleanPieChart);
    // Horizontal Bar Chart Aggregating Indulgences/Sensitivities
    const varExpenseHorizontalBarChart = extractHorizontalBarChartData(filteredYearVarExpenses);
    setIndulgencesHorizontalBarChartData(varExpenseHorizontalBarChart);
    // Content Cards with aggregated costs per largest category
    const aggregatePurchaseInfo = extractAggregatedPurchaseInformation(filteredYearVarExpenses, false);
    setAggregatedPurchaseInformation(aggregatePurchaseInfo);
    setSelectedChartLabel('');
  };

  const handleSelectMonth = (selected: string): void => {
    setSelectedMonth(selected);
    // remove negative values (Sales)
    let filteredMonthVarExpenses = allVariableExpenses.filter((e: any) => parseFloat(e.cost) > 0);
    const selectedMonthArr: string[] = monthsWithPurchasesInSelectedYear
      ? (monthsWithPurchasesInSelectedYear.filter((e) => e[0] === selected)[0] as string[])
      : (locales().ARRAY_MONTH_ALL.filter((e) => e[0] === selected)[0] as string[]);
    if (selectedMonthArr && selectedMonthArr[0] === res.ALL) {
      // filter all expenses by preselected year
      filteredMonthVarExpenses = allVariableExpenses.filter(
        (e: any) => e.purchasing_date.substring(0, 4) === selectedYear
      );
      const aggregatePurchaseInfo = extractAggregatedPurchaseInformation(filteredMonthVarExpenses, false);
      setAggregatedPurchaseInformation(aggregatePurchaseInfo);
      // unselect month label for marking active slice in both vertical bar chart and line chart
      setSelectedChartLabel('');
    } else {
      // filter all expenses by preselected year and month substring
      filteredMonthVarExpenses = allVariableExpenses
        .filter((e: any) => e.purchasing_date.substring(0, 4) === selectedYear)
        .filter((e: any) => e.purchasing_date.substring(5, 7) === selectedMonthArr[1]);
      // Pie Chart displaying is_planned and contains_indulgence flags
      const varExpenseBooleanPieChart = extractPieChartData(filteredMonthVarExpenses, palette);
      setExpensePieChartData(varExpenseBooleanPieChart);
      // Horizontal Bar Chart Aggregating Indulgences/Sensitivities
      const varExpenseHorizontalBarChart = extractHorizontalBarChartData(filteredMonthVarExpenses);
      setIndulgencesHorizontalBarChartData(varExpenseHorizontalBarChart);
      // Content Cards with aggregated costs per largest category
      const aggregatePurchaseInfo = extractAggregatedPurchaseInformation(filteredMonthVarExpenses, true);
      setAggregatedPurchaseInformation(aggregatePurchaseInfo);
      setSelectedChartLabel(`${selectedYear}-${selectedMonthArr[1]}`);
    }
    setSelectedVariableExpenses(filteredMonthVarExpenses);
  };

  const handleRenderAllExpenseRows = () => {
    setRenderAllExpenseRows(!renderAllExpenseRows);
  };

  /**
   * changes selected month via click on left arrow or right arrow.
   * Does nothing if we are in first month, or last month.
   * @param direction left or right
   */
  const handleMonthDirectionChanged = (direction: 'left' | 'right') => {
    const isPriorMonth = direction === 'left' ? true : false;
    let selectedMonthIndex = -1;
    const availableMonths = monthsWithPurchasesInSelectedYear
      ? monthsWithPurchasesInSelectedYear
      : locales().ARRAY_MONTH_ALL;
    availableMonths.forEach((e, i) => {
      if (e[0] === selectedMonth) {
        selectedMonthIndex = i;
      }
    });
    if (isPriorMonth && selectedMonthIndex > 0) {
      handleSelectMonth(
        monthsWithPurchasesInSelectedYear
          ? (monthsWithPurchasesInSelectedYear[selectedMonthIndex - 1][0] as string)
          : (locales().ARRAY_MONTH_ALL[selectedMonthIndex - 1][0] as string)
      );
    } else if (
      !isPriorMonth &&
      selectedMonthIndex < (monthsWithPurchasesInSelectedYear ? monthsWithPurchasesInSelectedYear?.length - 1 : 12)
    ) {
      handleSelectMonth(
        monthsWithPurchasesInSelectedYear
          ? (monthsWithPurchasesInSelectedYear[selectedMonthIndex + 1][0] as string)
          : (locales().ARRAY_MONTH_ALL[selectedMonthIndex + 1][0] as string)
      );
    }
  };

  return (
    <>
      <Grid container>
        <Grid xs={0} xl={1}></Grid>
        <Grid xs={12} xl={10} display="flex" alignItems="center" justifyContent="center">
          {/* DETERMINES RESPONSIVE LAYOUT */}
          <Box
            sx={{
              width: breakpointWidth
            }}
          >
            {/* MAIN CENTERED GRID */}
            <Grid container spacing={1.5}>
              {/* NEW EXPENSE INPUT MODAL */}
              <Grid xs={12} md={3} xl={2}>
                <InputVariableExpenseModal
                  setAddedItemId={setAddedItemId}
                  storeAutoCompleteItemArray={storeAutoCompleteItemArray}
                  categoryAutoCompleteItemArray={categoryAutoCompleteItemArray}
                  indulgencesAutoCompleteItemArray={indulgencesAutoCompleteItemArray}
                />
              </Grid>

              {/* MONTH SELECTION */}
              <Grid xs={12} md={3} xl={2.5}>
                <Stack direction="row">
                  <Tooltip title={locales().VARIABLE_EXPENSES_OVERVIEW_PRIOR_MONTH_BTN_TOOLTIP}>
                    {/* div required for Tooltip to render correctly if button is disabled */}
                    <div>
                      <IconButton
                        color="inherit"
                        disabled={selectedYear ? false : true}
                        onClick={() => handleMonthDirectionChanged('left')}
                        sx={{ paddingX: 2, width: 1 / 9 }}
                      >
                        <AssignmentReturnIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                  <Container maxWidth={false} sx={{ width: 7 / 9 }}>
                    {allVariableExpenses ? (
                      <SelectDropdown
                        selectLabel={locales().GENERAL_DATE}
                        selectItems={
                          monthsWithPurchasesInSelectedYear
                            ? monthsWithPurchasesInSelectedYear.map((e: any) => e[0] as string)
                            : locales().ARRAY_MONTH_ALL.map((e: any) => e[0] as string)
                        }
                        selectedValue={selectedMonth}
                        handleSelect={handleSelectMonth}
                        disabled={selectedYear ? false : true}
                      />
                    ) : (
                      <Skeleton animation={false} variant="rectangular" height={60} />
                    )}
                  </Container>
                  <Tooltip title={locales().VARIABLE_EXPENSES_OVERVIEW_NEXT_MONTH_BTN_TOOLTIP}>
                    {/* div required for Tooltip to render correctly if button is disabled */}
                    <div>
                      <IconButton
                        color="inherit"
                        disabled={selectedYear ? false : true}
                        onClick={() => handleMonthDirectionChanged('right')}
                        sx={{ paddingX: 2, width: 1 / 9 }}
                      >
                        <AssignmentReturnIcon
                          sx={{
                            transform: 'scaleX(-1)'
                          }}
                        />
                      </IconButton>
                    </div>
                  </Tooltip>
                </Stack>
              </Grid>
              {/* YEAR SELECTION */}
              <Grid xs={12} md={4} xl={6.5}>
                {yearsWithPurchases ? (
                  yearsWithPurchases.map((parent, index) => {
                    return (
                      <ToggleButtonGroup key={index} exclusive value={selectedYear} onChange={handleYearSelection}>
                        {parent.map((child, index) => {
                          return (
                            <ToggleButton
                              key={index}
                              size="large"
                              value={child}
                              selected={child === selectedYear}
                              sx={toggleButtonStylingProps}
                            >
                              {child}
                            </ToggleButton>
                          );
                        })}
                      </ToggleButtonGroup>
                    );
                  })
                ) : (
                  <Skeleton animation={false} variant="rectangular" height={60} />
                )}
              </Grid>

              {/* SHOW RAW DATA TOGGLE BTN */}
              <Grid xs={12} md={2} xl={1}>
                <ToggleButton
                  size="small"
                  onClick={handleRenderAllExpenseRows}
                  value={locales().VARIABLE_EXPENSES_OVERVIEW_RENDER_ALL_EXPENSE_ROW_BTN}
                  selected={renderAllExpenseRows}
                  sx={toggleButtonStylingProps}
                >
                  {locales().VARIABLE_EXPENSES_OVERVIEW_RENDER_ALL_EXPENSE_ROW_BTN}
                </ToggleButton>
              </Grid>

              {/* CONTENT CARDS WITH AGGREGATE VALUES PER MONTH/YEAR */}
              {aggregatedPurchaseInformation ? (
                <React.Fragment>
                  {aggregatedPurchaseInformation.categoryCards
                    ? aggregatedPurchaseInformation.categoryCards.map((e: ContentCardObject, i: number) => (
                        <Grid xs={6} md={4} xl={2} key={i}>
                          <ContentCardCosts elevation={12} {...e} />
                        </Grid>
                      ))
                    : null}
                  {/* Add empty grids for any months with less than 6 expense categories to retain horizontal width */}
                  {aggregatedPurchaseInformation?.categoryCards &&
                  aggregatedPurchaseInformation.categoryCards.length < 6
                    ? [...new Array(6 - aggregatedPurchaseInformation.categoryCards.length)].map(
                        (_e: any, i: number) => <Grid xs={6} md={4} xl={2} key={i}></Grid>
                      )
                    : null}
                </React.Fragment>
              ) : (
                [...new Array(6)].map((_e, i: number) => (
                  <Grid xs={6} md={4} xl={2} key={i}>
                    <Skeleton animation={false} variant="rectangular" height={120} />
                  </Grid>
                ))
              )}

              <Grid xs={12} md={8} xl={9}>
                {expenseLineChartData ? (
                  <Paper
                    elevation={6}
                    sx={{
                      ...chartBackgroundProperties(palette),
                      height: 300
                    }}
                  >
                    <ContentLineChart {...expenseLineChartData} dataSetCount={1} selectedLabel={selectedChartLabel} />
                  </Paper>
                ) : (
                  <Skeleton animation={false} variant="rectangular" height={300} />
                )}
              </Grid>
              <Grid xs={12} md={4} xl={3}>
                {expensePieChartData ? (
                  <Paper
                    elevation={6}
                    sx={{
                      ...chartBackgroundProperties(palette),
                      height: 300
                    }}
                  >
                    <ContentBooleanPieChart {...expensePieChartData} />
                  </Paper>
                ) : (
                  <Skeleton animation={false} variant="rectangular" height={300} />
                )}
              </Grid>
              {/* CATEGORY SUMS VERTICAL BAR CHART */}
              <Grid xs={12} md={8} xl={9}>
                {expenseVerticalBarChartData ? (
                  <Paper
                    elevation={6}
                    sx={{
                      ...chartBackgroundProperties(palette),
                      height: 400
                    }}
                  >
                    <ContentVerticalBarChart
                      {...expenseVerticalBarChartData}
                      dataSetCount={4}
                      selectedLabel={selectedChartLabel}
                      legendPos="top"
                    />
                  </Paper>
                ) : (
                  <Skeleton animation={false} variant="rectangular" height={400} />
                )}
              </Grid>
              <Grid xs={12} md={4} xl={3}>
                {indulgencesHorizontalBarChartData ? (
                  <Paper
                    elevation={6}
                    sx={{
                      ...chartBackgroundProperties(palette),
                      height: 400
                    }}
                  >
                    <ContentHorizontalBarChart {...indulgencesHorizontalBarChartData} />
                  </Paper>
                ) : (
                  <Skeleton animation={false} variant="rectangular" height={400} />
                )}
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid xs={0} xl={1}></Grid>
      </Grid>
      {renderAllExpenseRows ? (
        <TableContainer component={Paper} sx={{ borderRadius: 0, mt: 2 }}>
          <Table sx={{ minWidth: 500 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow sx={tableHeadStyling}>
                <TableCell>description</TableCell>
                <TableCell>category</TableCell>
                <TableCell>store</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>cost</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} align="right">
                  purchasing_date
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} align="right">
                  is_planned
                </TableCell>
                <TableCell align="right">contains_indulgence</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>sensitivities</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedVariableExpenses
                ? selectedVariableExpenses.map((row: any) => (
                    <TableRow key={row.id} sx={tableRowStyling}>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.store}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{row.cost}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} align="right">
                        {row.purchasing_date}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} align="right">
                        {row.is_planned ? 'Ja' : 'Nein'}
                      </TableCell>
                      <TableCell align="right">{row.contains_indulgence ? 'Ja' : 'Nein'}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{row.indulgences}</TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <></>
      )}
    </>
  );
}
