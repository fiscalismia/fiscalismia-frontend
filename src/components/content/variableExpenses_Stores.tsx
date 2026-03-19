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
  Tooltip,
  Typography
} from '@mui/material';
import {
  getUniqueEffectiveMonthYears,
  getUniqueEffectiveYears,
  getUniquePurchasingDates,
  getBreakPointWidth
} from '../../utils/sharedFunctions';
import { ContentChartBubbleObject, RouteInfo } from '../../types/custom/customTypes';
import SelectDropdown from '../minor/SelectDropdown';
import { locales } from '../../utils/localeConfiguration';
import ContentBubbleChart from '../minor/ContentChart_Bubble';

type StoreMap = Map<string, StoreMapEntries>;
type StoreMapEntries = { cost: number; count: number };
type StoreTotal = { money_spent: number; total_visits: number; total_planned: number; total_unplanned: number };
type StoreAggregate = { storeMap: StoreMap; storeTotal: StoreTotal };

const DEFAULT_STORE_COUNT: number = 10;

const headerInfoStyling = {
  fontFamily: 'Hack, Roboto',
  fontSize: '16px',
  letterSpacing: 3,
  textTransform: 'uppercase'
};

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
 * Extracts the store string from variable expenses and returns a unique set
 * @param {string[]} filteredVariableExpenses
 * @returns unique stores
 */
function getUniqueStoresInVarExpenses(filteredVariableExpenses: any) {
  const uniqueStoreSet = new Set(filteredVariableExpenses.map((e: any) => (e.store ? e.store.trim() : 'No Store')));
  return [...uniqueStoreSet];
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
 * Transforms an aggregated StoreMap into the props object consumed by the Bubble chart.
 * Each store becomes a dataset with x, y coordinates and a radius for the bubble
 * @param storeMap
 * @returns
 */
function extractBubbleChartData(storeMap: StoreMap): ContentChartBubbleObject {
  const storeCount = storeMap.size;
  const RADIUS_DIVISOR = 50;
  const MAX_RADIUS = 40;
  const MIN_RADIUS = 8;
  const entries = [...storeMap.entries()];
  const dataSetsAndNames = entries.reduce(
    (acc, [storeName, { cost, count }], i) => {
      let effecticeRadius;
      const proposedRadius = (cost * count) / RADIUS_DIVISOR;
      effecticeRadius = proposedRadius > MAX_RADIUS ? MAX_RADIUS : proposedRadius;
      effecticeRadius = effecticeRadius < MIN_RADIUS ? MIN_RADIUS : effecticeRadius;
      acc[`dataSet${i + 1}Name`] = storeName;
      acc[`dataSet${i + 1}`] = { x: count, y: cost, r: effecticeRadius };
      return acc;
    },
    {} as Record<string, any>
  );
  const booleanPieChartObj: ContentChartBubbleObject = {
    chartTitle: locales().VARIABLE_EXPENSES_STORES_BUBBLE_CHART_TITLE,
    labels: [''], // To have only one dataset entry rendered without a label, empty label within an array has to be passed.
    dataSetCount: storeCount,
    maxXValue: 1,
    maxYValue: 100,
    ...dataSetsAndNames
  };
  return booleanPieChartObj;
}

/**
 * Aggregates variable expenses by store in a single pass, producing:
 * - A StoreMap of the top N stores (sorted by cost descending), each containing summed cost and visit count.
 * - A StoreTotal with overall spending, visit count, and planned/unplanned purchase breakdowns.
 * @param filteredVariableExpenses Pre-filtered expense rows containing store, cost, and is_planned fields.
 * @param storeCount Number of top stores to return (default: DEFAULT_STORE_COUNT). Slices the map after sorting by cost.
 * @returns StoreAggregate containing the sliced storeMap and the unsliced storeTotal across all stores.
 */
function aggregateCostsPerStore(filteredVariableExpenses: any, storeCount: number): StoreAggregate {
  const storeTotal: StoreTotal = { money_spent: 0, total_visits: 0, total_planned: 0, total_unplanned: 0 };
  const storeMap: StoreMap = filteredVariableExpenses.reduce(
    (map: StoreMap, { store, cost, is_planned }: { store: string; cost: any; is_planned: boolean }) => {
      const parsedCost = cost ? parseFloat(cost) : 0;
      const existing = map.get(store);

      // increment Map
      if (existing) {
        existing.cost += parsedCost;
        existing.count += 1;
      } else {
        map.set(store, { cost: parsedCost, count: 1 });
      }
      // increment Total
      storeTotal.money_spent += parsedCost;
      storeTotal.total_visits += 1;
      if (is_planned) storeTotal.total_planned += 1;
      if (!is_planned) storeTotal.total_unplanned += 1;

      return map;
    },
    new Map<string, StoreMapEntries>()
  );

  const topN = new Map<string, StoreMapEntries>(
    [...storeMap.entries()].sort(([, a], [, b]) => b.cost - a.cost).slice(0, storeCount)
  );

  return { storeMap: topN, storeTotal: storeTotal };
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
  const [uniqueStoreCount, setUniqueStoreCount] = useState<number>();
  const [moneySpentByStore, setMoneySpentByStore] = useState<string>();
  const [visitsPerStore, setVisitsPerStore] = useState<number>();
  const [totalPlannedPurchases, setTotalPlannedPurchases] = useState<number>(5);
  const [totalUnplannedPurchases, setTotalUnplannedPurchases] = useState<number>(4);
  // Bubble Chart Aggregating Stores with money spent/visit count
  const [storeBubbleChartData, setStoreBubbleChartData] = useState<ContentChartBubbleObject>();
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
    // Counts all uniqueStores in the storeSet for further processing
    const uniqueStores = getUniqueStoresInVarExpenses(filteredYearVarExpenses);
    setUniqueStoreCount(uniqueStores ? uniqueStores.length : 0);
    // Extracts total counts, sums for the header and an aggregate map for the Bubble chart
    const storeAggregateData = aggregateCostsPerStore(
      filteredYearVarExpenses,
      uniqueStores ? uniqueStores.length : DEFAULT_STORE_COUNT
    );
    setMoneySpentByStore(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.money_spent.toFixed(2) : '0');
    setVisitsPerStore(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.total_visits : 0);
    setTotalPlannedPurchases(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.total_planned : 0);
    setTotalUnplannedPurchases(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.total_unplanned : 0);
    // Bubble Chart containing store data agggregates by money spent and visitation count
    const varExpenseBubbleChart = extractBubbleChartData(storeAggregateData.storeMap);
    setStoreBubbleChartData(varExpenseBubbleChart);
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
    } else {
      // filter all expenses by preselected year and month substring
      filteredMonthVarExpenses = allVariableExpenses
        .filter((e: any) => e.purchasing_date.substring(0, 4) === selectedYear)
        .filter((e: any) => e.purchasing_date.substring(5, 7) === selectedMonthArr[1]);
      // Counts all uniqueStores in the storeSet for further processing
      const uniqueStores = getUniqueStoresInVarExpenses(filteredMonthVarExpenses);
      setUniqueStoreCount(uniqueStores ? uniqueStores.length : 0);
      // Extracts total counts, sums for the header and an aggregate map for the Bubble chart
      const storeAggregateData = aggregateCostsPerStore(
        filteredMonthVarExpenses,
        uniqueStores ? uniqueStores.length : DEFAULT_STORE_COUNT
      );
      setMoneySpentByStore(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.money_spent.toFixed(2) : '0');
      setVisitsPerStore(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.total_visits : 0);
      setTotalPlannedPurchases(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.total_planned : 0);
      setTotalUnplannedPurchases(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.total_unplanned : 0);
      // Bubble Chart containing store data agggregates by money spent and visitation count
      const varExpenseBubbleChart = extractBubbleChartData(storeAggregateData.storeMap);
      setStoreBubbleChartData(varExpenseBubbleChart);
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
                  <Typography
                    sx={{
                      ml: 12,
                      ...headerInfoStyling
                    }}
                  >
                    {locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_STORE_COUNT(`${uniqueStoreCount}`)}
                  </Typography>
                  <Typography
                    sx={{
                      ml: 5,
                      ...headerInfoStyling
                    }}
                  >
                    {locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_MONEY_SPENT(`${moneySpentByStore}`)}
                  </Typography>
                  <Typography
                    sx={{
                      ml: 5,
                      ...headerInfoStyling
                    }}
                  >
                    {locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_STORE_VISITS(`${visitsPerStore}`)}
                  </Typography>
                  {totalUnplannedPurchases && totalPlannedPurchases ? (
                    <>
                      <Typography
                        sx={{
                          ml: 5,
                          ...headerInfoStyling
                        }}
                      >
                        {locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_STORE_VISITS_PLANNED(
                          `${totalPlannedPurchases}`,
                          ` (${((totalPlannedPurchases / (totalPlannedPurchases + totalUnplannedPurchases)) * 100).toFixed(1)}%)`
                        )}
                      </Typography>
                      <Typography
                        sx={{
                          ml: 5,
                          ...headerInfoStyling
                        }}
                      >
                        {locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_STORE_VISITS_UNPLANNED(
                          `${totalUnplannedPurchases}`,
                          ` (${((totalUnplannedPurchases / (totalPlannedPurchases + totalUnplannedPurchases)) * 100).toFixed(1)}%)`
                        )}
                      </Typography>
                    </>
                  ) : (
                    <Skeleton animation={false} variant="rectangular" height={60} />
                  )}
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
              <Grid xs={12}>
                {storeBubbleChartData ? (
                  <Paper
                    elevation={6}
                    sx={{
                      ...chartBackgroundProperties(palette),
                      height: 400
                    }}
                  >
                    <ContentBubbleChart {...storeBubbleChartData} />
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
