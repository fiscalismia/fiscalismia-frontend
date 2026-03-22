import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import { resourceProperties as res } from '../../resources/resource_properties';
import { getAllVariableExpenses } from '../../services/pgConnections';
import {
  Box,
  Chip,
  Container,
  IconButton,
  Palette,
  Skeleton,
  Stack,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  getUniqueEffectiveMonthYears,
  getUniqueEffectiveYears,
  getUniquePurchasingDates,
  getBreakPointWidth,
  toggleButtonStylingProps
} from '../../utils/sharedFunctions';
import { ContentChartBubbleObject, RouteInfo } from '../../types/custom/customTypes';
import SelectDropdown from '../minor/SelectDropdown';
import { locales } from '../../utils/localeConfiguration';
import ContentBubbleChart from '../minor/ContentChart_Bubble';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

type StoreMap = Map<string, StoreMapEntries>;
type StoreMapEntries = { cost: number; count: number };
type StoreTotal = { money_spent: number; total_visits: number; total_planned: number; total_unplanned: number };
type StoreAggregate = { storeMap: StoreMap; storeTotal: StoreTotal };

const DEFAULT_STORE_COUNT: number = 10;

// defaults to fixed width of 5 digits but can be overwritten for e.g. currency symbol addition
const boldNumberLabel = (num: string | number, text: string, width: number = 6) => {
  const fontPixelSize = 12;
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      <b>
        <span style={{ display: 'inline-block', minWidth: `${width * fontPixelSize}px`, textAlign: 'right' }}>
          {num}
        </span>
      </b>{' '}
      {text}
    </span>
  );
};
const chartBackgroundProperties = (palette: Palette) => {
  return {
    borderRadius: 0,
    border: `2px solid ${palette.border.main}`,
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
 * @param storeMap sorted by highest cost map
 * @param allMonthsSelected
 * @param monthsWithCosts
 * @returns
 */
function extractBubbleChartData(
  storeMap: StoreMap,
  allMonthsSelected: boolean,
  monthsWithCosts: (string | RegExp)[][] | undefined
): ContentChartBubbleObject {
  const uniqueMonthCount = monthsWithCosts ? monthsWithCosts.length - 1 : 12;
  const storeCount = storeMap.size;
  const MAX_RADIUS = allMonthsSelected ? 100 : 50;
  const MIN_RADIUS = allMonthsSelected ? 6 : 8;
  // Divide radius by month count to keep sizes even between year and month granularity
  const RADIUS_DIVISOR = allMonthsSelected ? uniqueMonthCount : 1;
  const entries = [...storeMap.entries()];
  // normalizes yearly bubble size and scales based on x axis range - deactivated for months
  let costMultiplikator;
  if (allMonthsSelected) {
    const maxXValue = entries && entries.length > 0 ? entries[0][1].cost : 0;
    costMultiplikator = maxXValue < 1000 ? 5 : maxXValue > 1000 && maxXValue < 2500 ? 2.5 : 1;
  } else {
    costMultiplikator = 1;
  }
  const dataSetsAndNames = entries.reduce(
    (acc, [storeName, { cost, count }], i) => {
      let effecticeRadius;
      const proposedRadius = Math.sqrt(cost * costMultiplikator * count) / RADIUS_DIVISOR;
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

  // ensure Map is sorted by highest cost on top
  const sortedMap = new Map<string, StoreMapEntries>(
    [...storeMap.entries()].sort(([, a], [, b]) => b.cost - a.cost).slice(0, storeCount)
  );

  return { storeMap: sortedMap, storeTotal: storeTotal };
}

interface VariableExpenses_StoresProps {
  routeInfo: RouteInfo;
}
/**
 * Displays the TopN stores in terms of money spent and times visited, filtered by year or month
 * @param _props
 * @returns
 */
export default function VariableExpenses_Stores(_props: VariableExpenses_StoresProps) {
  const { palette, breakpoints } = useTheme();
  // Variable Expense Data for Display
  const [allVariableExpenses, setAllVariableExpenses] = useState<any>(null);
  const [, setSelectedVariableExpenses] = useState<any>();
  const [uniqueStoreCount, setUniqueStoreCount] = useState<number>();
  const [moneySpentByStore, setMoneySpentByStore] = useState<string>();
  const [visitsPerStore, setVisitsPerStore] = useState<number>();
  const [totalPlannedPurchases, setTotalPlannedPurchases] = useState<number>();
  const [totalUnplannedPurchases, setTotalUnplannedPurchases] = useState<number>();
  // Bubble Chart Aggregating Stores with money spent/visit count
  const [storeBubbleChartData, setStoreBubbleChartData] = useState<ContentChartBubbleObject>();
  // year and month selection
  const [yearsWithPurchases, setYearsWithPurchases] = useState<string[][]>();
  const [selectedYear, setSelectedYear] = useState<string>();
  const [monthsWithPurchasesInSelectedYear, setMonthsWithPurchasesInSelectedYear] = useState<(string | RegExp)[][]>();
  const [selectedMonth, setSelectedMonth] = useState<string>(locales().ARRAY_MONTH_ALL[0][0] as string); // default All Month Aggregate

  // width for page content based on current window width extracted from supplied breakpoints.
  const breakpointWidth = getBreakPointWidth(breakpoints);
  // Header Info Chips palette styling
  const isLargeScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const isMaxScreen = useMediaQuery((theme: Theme) => theme.breakpoints.only('xl'));
  const HEADER_BAR_WIDTH = isLargeScreen ? 250 : breakpointWidth;
  const HEADER_BAR_HEIGHT = 30;
  const HEADER_BAR_BORDER = `2px solid ${palette.border.dark}`;
  const headerInfoStyling = {
    fontFamily: 'Hack, Roboto',
    fontSize: '12px',
    letterSpacing: 3,
    minWidth: HEADER_BAR_WIDTH,
    maxWidth: HEADER_BAR_WIDTH,
    height: HEADER_BAR_HEIGHT,
    border: HEADER_BAR_BORDER,
    borderRadius: 0,
    justifyContent: 'flex-start', // aligns the internal flexbox layout to the left
    '& .MuiChip-label': {
      paddingLeft: '12px' // controls left padding of the label text
    }
  };
  // dependency must be inverted !selectedYear to only re-render on first selection moving from undefined to defined
  useEffect(() => {
    const getAllPricesAndDiscounts = async () => {
      const allVariableExpenses = await getAllVariableExpenses();
      const uniqueYears: string[] = getUniquePurchasingDateYears(allVariableExpenses.results);
      setYearsWithPurchases(new Array(uniqueYears)); // Creates 2D Array for mapping ToggleButtonGroup as parent
      setAllVariableExpenses(allVariableExpenses.results);
    };
    getAllPricesAndDiscounts();
  }, [!selectedYear]);

  const handleYearSelection = (_event: React.MouseEvent<HTMLElement> | null, newValue: string) => {
    setSelectedYear(newValue);
    // filter all expenses by preselected year and remove negative values (Sales)
    const filteredYearVarExpenses = allVariableExpenses
      .filter((e: any) => e.purchasing_date.substring(0, 4) === newValue)
      .filter((e: any) => parseFloat(e.cost) > 0);
    setSelectedVariableExpenses(filteredYearVarExpenses);
    // Extract Months with Costs - Initialize with Aggregate All
    const monthsWithCosts = getUniquePurchasingDateMonths(filteredYearVarExpenses);
    setMonthsWithPurchasesInSelectedYear(monthsWithCosts);
    handleSelectMonth(res.ALL);
    // Counts all uniqueStores in the storeSet for further processing
    const uniqueStores = getUniqueStoresInVarExpenses(filteredYearVarExpenses);
    setUniqueStoreCount(uniqueStores ? uniqueStores.length : 0);
    // Extracts total counts, sums for the header and an aggregate map for the Bubble chart
    const storeAggregateData = aggregateCostsPerStore(
      filteredYearVarExpenses,
      uniqueStores ? uniqueStores.length : DEFAULT_STORE_COUNT
    );
    setMoneySpentByStore(
      storeAggregateData.storeTotal
        ? `${storeAggregateData.storeTotal.money_spent.toLocaleString('de-DE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })}€`
        : '0'
    );
    setVisitsPerStore(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.total_visits : 0);
    setTotalPlannedPurchases(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.total_planned : 0);
    setTotalUnplannedPurchases(storeAggregateData.storeTotal ? storeAggregateData.storeTotal.total_unplanned : 0);
    // Bubble Chart containing store data agggregates by money spent and visitation count
    const varExpenseBubbleChart = extractBubbleChartData(storeAggregateData.storeMap, true, monthsWithCosts);
    setStoreBubbleChartData(varExpenseBubbleChart);
  };

  const handleSelectMonth = (selected: string): void => {
    setSelectedMonth(selected);
    // remove negative values (Sales)
    let filteredMonthVarExpenses = allVariableExpenses.filter((e: any) => parseFloat(e.cost) > 0);
    const selectedMonthArr: string[] = monthsWithPurchasesInSelectedYear
      ? (monthsWithPurchasesInSelectedYear.filter((e) => e[0] === selected)[0] as string[])
      : (locales().ARRAY_MONTH_ALL.filter((e) => e[0] === selected)[0] as string[]);
    const isAllSelected = selectedMonthArr && selectedMonthArr[0] === res.ALL;
    if (isAllSelected) {
      // filter all expenses by preselected year
      filteredMonthVarExpenses = filteredMonthVarExpenses.filter(
        (e: any) => e.purchasing_date.substring(0, 4) === selectedYear
      );
    } else {
      // filter all expenses by preselected year and month substring
      filteredMonthVarExpenses = filteredMonthVarExpenses
        .filter((e: any) => e.purchasing_date.substring(0, 4) === selectedYear)
        .filter((e: any) => e.purchasing_date.substring(5, 7) === selectedMonthArr[1]);
    }

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
    const varExpenseBubbleChart = extractBubbleChartData(
      storeAggregateData.storeMap,
      isAllSelected,
      monthsWithPurchasesInSelectedYear
    );
    setStoreBubbleChartData(varExpenseBubbleChart);
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
              <Grid xs={12} lg={6} xl={3}>
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
              <Grid xs={12} lg={6} xl={4}>
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
                              sx={toggleButtonStylingProps(palette)}
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

              {/* HEADER INFO CHIPS AND PROGRESS BAR WITH PURCHASE ENUMERATION => 2 Columns /w 3 Rows each */}
              <Grid xs={12} lg={6} xl={5} display="flex" justifyContent={isMaxScreen ? 'flex-end' : 'flex-start'}>
                <Grid container spacing={1}>
                  {/* Total counts within variable expense data */}
                  <Grid xs={12} lg={6}>
                    <Stack
                      direction="column"
                      spacing={0.75}
                      sx={{
                        alignSelf: 'center'
                      }}
                    >
                      {uniqueStoreCount && moneySpentByStore && visitsPerStore ? (
                        <React.Fragment>
                          <Chip
                            label={boldNumberLabel(
                              uniqueStoreCount,
                              locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_STORE_COUNT
                            )}
                            sx={{
                              backgroundColor: palette.primary.main,
                              color: palette.common.white,
                              ...headerInfoStyling
                            }}
                          />
                          <Chip
                            label={boldNumberLabel(
                              moneySpentByStore,
                              locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_MONEY_SPENT
                            )}
                            sx={{
                              backgroundColor: palette.header.main,
                              color: palette.common.white,
                              ...headerInfoStyling
                            }}
                          />
                          <Chip
                            label={boldNumberLabel(
                              visitsPerStore,
                              locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_STORE_VISITS
                            )}
                            sx={{
                              backgroundColor: palette.primary.main,
                              color: palette.common.white,
                              ...headerInfoStyling
                            }}
                          />
                        </React.Fragment>
                      ) : (
                        <>
                          {[...new Array(3)].map((_e, i: number) => (
                            <Skeleton
                              key={`${i}`}
                              animation={false}
                              variant="rectangular"
                              sx={{
                                minWidth: HEADER_BAR_WIDTH,
                                ml: 2
                              }}
                              height={HEADER_BAR_HEIGHT}
                            />
                          ))}
                        </>
                      )}
                    </Stack>
                  </Grid>
                  {/* Counts 3 header items /w planned vs. unplanned purchases /w percentage */}
                  <Grid xs={12} lg={6}>
                    <Stack direction="column" spacing={0.75} sx={{ alignSelf: 'center' }}>
                      {totalUnplannedPurchases && totalPlannedPurchases ? (
                        <React.Fragment>
                          <Chip
                            label={boldNumberLabel(
                              totalPlannedPurchases,
                              locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_STORE_VISITS_PLANNED,
                              4
                            )}
                            sx={{
                              backgroundColor: palette.success.dark,
                              color: palette.common.white,
                              ...headerInfoStyling
                            }}
                          />
                          <Chip
                            label={boldNumberLabel(
                              totalUnplannedPurchases,
                              locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_STORE_VISITS_UNPLANNED,
                              4
                            )}
                            sx={{
                              backgroundColor: palette.warning.dark,
                              color: palette.common.white,
                              ...headerInfoStyling
                            }}
                          />
                          {/* Absolute positioned Planned/Unplanned Purchases Percentage Bar with Text Overlay */}
                          <Box
                            sx={{
                              position: 'relative',
                              minWidth: HEADER_BAR_WIDTH,
                              maxWidth: HEADER_BAR_WIDTH
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={(totalPlannedPurchases / (totalPlannedPurchases + totalUnplannedPurchases)) * 100}
                              sx={{
                                [`& .${linearProgressClasses.bar}`]: {
                                  backgroundColor: palette.success.dark
                                },
                                [`&.${linearProgressClasses.colorPrimary}`]: {
                                  backgroundColor: palette.warning.dark
                                },
                                height: HEADER_BAR_HEIGHT,
                                border: HEADER_BAR_BORDER
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                paddingLeft: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'left'
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: 'Hack, Roboto',
                                  fontSize: '13px',
                                  letterSpacing: 2,
                                  color: palette.common.white
                                }}
                              >
                                {locales().VARIABLE_EXPENSES_STORES_HEADER_INFO_PROGRESS_BAR_PLANNED(
                                  `${((totalPlannedPurchases / (totalPlannedPurchases + totalUnplannedPurchases)) * 100).toFixed(1)}`
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </React.Fragment>
                      ) : (
                        <>
                          {[...new Array(3)].map((_e, i: number) => (
                            <Skeleton
                              key={`${i}`}
                              animation={false}
                              variant="rectangular"
                              sx={{
                                minWidth: HEADER_BAR_WIDTH,
                                ml: 2
                              }}
                              height={HEADER_BAR_HEIGHT}
                            />
                          ))}
                        </>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
              {/* MAIN Chart.JS 2D Bubble Chart */}
              <Grid xs={12}>
                {storeBubbleChartData ? (
                  <Paper
                    elevation={6}
                    sx={{
                      ...chartBackgroundProperties(palette),
                      height: '50vh'
                    }}
                  >
                    <ContentBubbleChart {...storeBubbleChartData} />
                  </Paper>
                ) : (
                  <Skeleton animation={false} variant="rectangular" height="50vh" />
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
