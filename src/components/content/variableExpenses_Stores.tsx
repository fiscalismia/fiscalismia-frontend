import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import { resourceProperties as res } from '../../resources/resource_properties';
import { getAllVariableExpenses, getAllVariableExpenseStores } from '../../services/pgConnections';
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
  constructContentCardObject,
  getUniqueEffectiveMonthYears,
  getUniqueEffectiveYears,
  getUniquePurchasingDates,
  getBreakPointWidth,
  toastOptions
} from '../../utils/sharedFunctions';
import { ContentCardObject, ContentChartHorizontalBarObject, RouteInfo } from '../../types/custom/customTypes';
import ContentCardCosts from '../minor/ContentCard_Costs';
import SelectDropdown from '../minor/SelectDropdown';
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
 * Extracts the total expenses per store and returns an array of the stores with the largest expenses for the entire provided dataset.
 * Extracts the number of purchases per store and returns an array of the stores with the highest visiting count for the entire provided dataset.
 * @param allVariableExpenses
 * @returns dict with:
 * - store_costs: 2d array consisting of 1-10 elements containing ["store name", summed_cost]
 * - store visits: 2d array consisting of 1-10 elements containing ["store name", visit_count]
 */
function aggregateCostsPerStore(allVariableExpenses: any): (string | number)[][] {
  type StoreCostObject = { store: string; cost: number };
  const storeCostsArr: StoreCostObject[] = allVariableExpenses.map((e: any) => {
    return { store: e.store, cost: parseFloat(e.cost) };
  });

  // creates a Map with store as the key and the summed up cost as value
  const storeSumMap = storeCostsArr.reduce((map, item) => {
    if (!map.has(item.store)) {
      map.set(item.store, 0);
    }
    map.set(item.store, map.get(item.store)! + item.cost);
    return map;
  }, new Map<string, number>());

  // Creates a <string,number> Array containing the 10 stores with the largest expense total
  return Array.from(storeSumMap.entries())
    .sort((a: [string, number], b: [string, number]) => (a[1] < b[1] ? 1 : -1))
    .slice(0, 10)
    .map((e: [string, number]) => {
      return Array.from([e[0], parseFloat(e[1].toFixed(2))]);
    });
}

// TODO create custom type for purchase infoaggregateCostsPerCategory
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

  const costsPerCategory: (string | number)[][] = aggregateCostsPerStore(allVariableExpenses);
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

interface VariableExpenses_StoresProps {
  routeInfo: RouteInfo;
}

/**
 *
 * @param _props
 * @returns
 */
export default function VariableExpenses_Stores(_props: VariableExpenses_StoresProps) {
  const { palette, breakpoints } = useTheme();
  // Variable Expense Data for Display
  const [allVariableExpenses, setAllVariableExpenses] = useState<any>(null);
  const [selectedVariableExpenses, setSelectedVariableExpenses] = useState<any>();
  const [aggregatedPurchaseInformation, setAggregatedPurchaseInformation] = useState<any>();
  // Horizontal Bar Chart Aggregating Indulgences/Sensitivities
  const [indulgencesHorizontalBarChartData, setIndulgencesHorizontalBarChartData] =
    useState<ContentChartHorizontalBarObject>();
  // year selection
  const [yearsWithPurchases, setYearsWithPurchases] = useState<string[][]>();
  const [selectedYear, setSelectedYear] = useState<string>();
  const [monthsWithPurchasesInSelectedYear, setMonthsWithPurchasesInSelectedYear] = useState<(string | RegExp)[][]>();
  const [selectedMonth, setSelectedMonth] = useState<string>(locales().ARRAY_MONTH_ALL[0][0] as string); // default All Month Aggregate

  // width for page content based on current window width extracted from supplied breakpoints.
  const breakpointWidth = getBreakPointWidth(breakpoints);
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
      setAllVariableExpenses(allVariableExpenses.results);
    };
    getAllPricesAndDiscounts();
  }, [selectedYear]);

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
    // Horizontal Bar Chart Aggregating Indulgences/Sensitivities
    const varExpenseHorizontalBarChart = extractHorizontalBarChartData(filteredYearVarExpenses);
    setIndulgencesHorizontalBarChartData(varExpenseHorizontalBarChart);
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
    } else {
      // filter all expenses by preselected year and month substring
      filteredMonthVarExpenses = allVariableExpenses
        .filter((e: any) => e.purchasing_date.substring(0, 4) === selectedYear)
        .filter((e: any) => e.purchasing_date.substring(5, 7) === selectedMonthArr[1]);
      // Horizontal Bar Chart Aggregating Indulgences/Sensitivities
      const varExpenseHorizontalBarChart = extractHorizontalBarChartData(filteredMonthVarExpenses);
      setIndulgencesHorizontalBarChartData(varExpenseHorizontalBarChart);
    }
    setSelectedVariableExpenses(filteredMonthVarExpenses);
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
    </>
  );
}
