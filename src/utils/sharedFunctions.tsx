import React from 'react';
import { localStorageKeys, resourceProperties as res } from '../resources/resource_properties';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import { ContentCardObject, ContentChartLineObject, ContentChartVerticalBarObject } from '../types/custom/customTypes';
import { Breakpoints, Theme, useMediaQuery } from '@mui/material';
import { locales } from './localeConfiguration';
import { ToastOptions, ToastPosition, Zoom } from 'react-toastify';

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    tertiary: true;
    default: true;
  }
}

/**
 * Constructs the object for several Custom React Components displaying synthesized information extracted from the db.
 * Is used to construct fixed cost information, monthly income information and overview of variable expenses, among potentially others.
 * @param header
 * @param amount
 * @param subtitle
 * @param details
 * @param icon
 * @param img
 * @returns
 */
export function constructContentCardObject(
  header: string,
  amount: number | null,
  subtitle: string,
  details: string[] | null,
  icon: React.ReactNode | string,
  img: string | null
): ContentCardObject {
  const turnus =
    subtitle === '1.00'
      ? locales().INTERVAL_MONTHLY
      : subtitle === '3.00'
        ? locales().INTERVAL_QUARTERLY
        : subtitle === '6.00'
          ? locales().INTERVAL_HALFYEARLY
          : subtitle === '12.00'
            ? locales().INTERVAL_YEARLY
            : `${locales().GENERAL_EVERY} ${subtitle} ${locales().GENERAL_MONTHS}`;
  const contentCardObj = {
    header: header.trim(),
    amount: amount ? amount : null,
    subtitle: turnus,
    details: details,
    img: img
      ? img === res.NO_IMG
        ? null
        : img
      : `https://source.unsplash.com/random/?money&${Math.floor(Math.random() * 100)}`,
    icon: icon
  };
  return contentCardObj;
}

/**
 * Used for constructing chart.js line charts with a single line.
 * @param title Card Title
 * @param xAxis typically a string representation of a date array
 * @param dataSets typically number arrays for the y axis
 * @param dataSets.dataSet1
 * @param dataSets.dataSet1Name
 * @param dataSets.dataSet2
 * @param dataSets.dataSet2Name
 * @param colors color overrides for line, point and active selection
 * @param colors.pointColor1
 * @param colors.lineColor1
 * @param colors.pointColor2
 * @param colors.lineColor2
 * @param colors.selectionColor
 * @returns {ContentChartLineObject} a ContentChartLineObject
 */
export function constructContentLineChartObject(
  title: string,
  xAxis: string[],
  dataSets: {
    dataSet1: any;
    dataSet1Name: string;
    dataSet2?: any;
    dataSet2Name?: string;
  },
  colors: { pointColor1: string; lineColor1: string; pointColor2?: string; lineColor2?: string; selectionColor: string }
): ContentChartLineObject {
  const contentChartObj: ContentChartLineObject = {
    chartTitle: title,
    labels: xAxis,
    dataSet1: dataSets?.dataSet1,
    dataSet1Name: dataSets?.dataSet1Name,
    pointColor1: colors.pointColor1,
    lineColor1: colors.lineColor1,
    selectionColor: colors.selectionColor
  };
  if (dataSets.dataSet2) {
    contentChartObj.dataSet2 = dataSets.dataSet2;
  }
  if (dataSets.dataSet2Name) {
    contentChartObj.dataSet2Name = dataSets.dataSet2Name;
  }
  if (colors.pointColor2) {
    contentChartObj.pointColor2 = colors.pointColor2;
  }
  if (colors.lineColor2) {
    contentChartObj.lineColor2 = colors.lineColor2;
  }
  return contentChartObj;
}

/**
 * Used for constructing chart.js line charts with multiple vertical bars.
 * @param title Card Title
 * @param xAxis typically a string representation of a date array
 * @param dataSets typically number arrays for the y axis
 * @param dataSets.dataSet1
 * @param dataSets.dataSet2
 * @param dataSets.dataSet3
 * @param dataSets.dataSet4
 * @param dataSets.dataSet1Name
 * @param dataSets.dataSet2Name
 * @param dataSets.dataSet3Name
 * @param dataSets.dataSet4Name
 * @param colors color overrides for bar colors
 * @param colors.color1
 * @param colors.color2
 * @param colors.color3
 * @param colors.color4
 * @returns {ContentChartVerticalBarObject} a ContentChartVerticalBarObject
 */
export function constructContentVerticalBarChartObject(
  title: string,
  xAxis: string[],
  dataSets: {
    dataSet1: any;
    dataSet2: any;
    dataSet3: any;
    dataSet4?: any;
    dataSet1Name: string;
    dataSet2Name: string;
    dataSet3Name: string;
    dataSet4Name?: string;
  },
  colors: { color1: string; color2: string; color3: string; color4?: string }
): ContentChartVerticalBarObject {
  const contentChartObj = {
    chartTitle: title,
    labels: xAxis,
    dataSet1: dataSets?.dataSet1,
    dataSet2: dataSets?.dataSet2,
    dataSet3: dataSets?.dataSet3,
    dataSet4: dataSets?.dataSet4,
    dataSet1Name: dataSets?.dataSet1Name,
    dataSet2Name: dataSets?.dataSet2Name,
    dataSet3Name: dataSets?.dataSet3Name,
    dataSet4Name: dataSets?.dataSet4Name,
    color1: colors?.color1,
    color2: colors?.color2,
    color3: colors?.color3,
    color4: colors?.color4
  };
  return contentChartObj;
}

/**
 * @param min lowest value
 * @param max highest value
 * @returns random int between min and max
 */
export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * extracts all uniqure effective dates of a single dataset
 * @param {*} singleDataSet
 * @param {'asc' | 'desc'} sort optional override to sort descending
 * @returns sorted array of effective dates in the format 'yyyy-mm-dd'
 * It doesn't matter how it is sorted, as long as it is. This is because both
 * income and fixed costs call this method and subsequently are passed to the
 * chart component via incomeDataSets that both require to be sorted in the same way.
 */
export function getUniqueEffectiveDates(singleDataSet: any, sort: 'asc' | 'desc' = 'asc'): string[] {
  const uniqueDates = Array.from(new Set(singleDataSet.map((e: any) => e.effective_date))) as string[];
  if (sort === 'desc') {
    return uniqueDates.sort((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
  }
  return uniqueDates.sort(); // ascending is default
}

/**
 * extracts all uniqure effective dates from two result sets from the db
 * @param {*} firstDataset
 * @param {*} secondDataset
 * @param {'asc' | 'desc'} sort optional override to sort descending
 * @returns DESC sorted array of effective dates in the format 'yyyy-mm-dd'
 */
export function getCombinedUniqueEffectiveDates(firstDataset: any, secondDataset: any, sort: 'asc' | 'desc' = 'asc') {
  if (firstDataset && secondDataset) {
    const firstSet = new Set(firstDataset.map((e: any) => e.effective_date));
    const secondSet = new Set(secondDataset.map((e: any) => e.effective_date));
    const datasetArray = Array.from(new Set([...firstSet, ...secondSet]));
    if (sort === 'desc') {
      return datasetArray.sort((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0)); // SORT Desc to initialize with current value at index 0
    } else {
      return datasetArray.sort(); // ascending is default
    }
  } else {
    return null;
  }
}

/**
 * extracts all unique purchasing_date values from given array
 * @param {*} singleDataSet
 * @returns array of date strings in the format yyyy-mm-dd
 */
export function getUniquePurchasingDates(singleDataSet: unknown[]) {
  const uniquePurchasingDateSet = new Set(singleDataSet.map((e: any) => e.purchasing_date));
  return [...uniquePurchasingDateSet].sort((a, b) => (a > b ? 1 : -1));
}

/**
 * Extracts the month-year string from an array of date strings in the format yyyy-mm-dd
 * @param {string[]} uniqueEffectiveDateArray array of date strings in the format yyyy-mm-dd
 * @returns ASC sorted array of year strings in the format yyyy-mm
 */
export function getUniqueEffectiveMonthYears(uniqueEffectiveDateArray: unknown[]) {
  const uniqueMonthYearSet = new Set(uniqueEffectiveDateArray.map((e: any) => e.substring(0, 7)));
  return [...uniqueMonthYearSet].sort((a, b) => (a > b ? 1 : -1));
}

/**
 * Extracts the year string from an array of date strings in the format yyyy-mm-dd
 * @param {string[]} uniqueEffectiveDateArray array of date strings in the format yyyy-mm-dd
 * @returns ASC sorted array of year strings in the format yyyy
 */
export function getUniqueEffectiveYears(uniqueEffectiveDateArray: unknown[]) {
  const uniqueYearSet = new Set(uniqueEffectiveDateArray.map((e: any) => e.substring(0, 4)));
  return [...uniqueYearSet].sort((a, b) => (a > b ? 1 : -1));
}

/**
 * Formats Date into a React Component including a Quarter Chip and custom Date String
 * @param {*} props value = date in format 2024-01-15
 * @returns Date formatted as "Q1 2. Jan 24"
 */
export const DateCellFormatter = ({ value }: { value: string }) => {
  const extractedDate = value ? new Date(value) : null;
  if (extractedDate && extractedDate !== null) {
    const day = String(extractedDate.getDate());
    const monthShort = extractedDate.toLocaleString('default', { month: 'short' });
    const year = extractedDate.getFullYear();
    const yearShort = String(extractedDate.getFullYear()).substring(2, 4);
    const dayAndMonth = `${day}. ${monthShort}`;
    const monthIdx = extractedDate.getMonth();
    const isCurrentYear = year === new Date().getFullYear();
    let quarter: number;
    if (monthIdx >= 0 && monthIdx < 3) {
      quarter = 1;
    } else if (monthIdx >= 3 && monthIdx < 6) {
      quarter = 2;
    } else if (monthIdx >= 6 && monthIdx < 9) {
      quarter = 3;
    } else {
      quarter = 4;
    }
    return (
      <>
        <Chip
          label={`Q${quarter}`}
          variant="outlined"
          size="medium"
          sx={{
            border: 0,
            fontWeight: 500,
            fontSize: '110%',
            marginBottom: 0.5
          }}
          color={
            quarter === 1
              ? 'primary'
              : quarter === 2
                ? 'secondary'
                : quarter === 3
                  ? 'tertiary'
                  : quarter === 4
                    ? 'success'
                    : 'default'
          }
        />
        <span>{dayAndMonth}&nbsp;</span>
        <span style={{ fontWeight: isCurrentYear ? 'bold' : '', fontStyle: !isCurrentYear ? 'italic' : '' }}>
          {yearShort}
        </span>
      </>
    );
  } else {
    return value;
  }
};

/**
 * To use a Tooltip with custom React/HTML content just pass the content into the title Tag of HtmlTooltip
 * <HtmlTooltip title={<React.Fragment></React.Fragment>}>
 * </HtmlTooltip>
 */
export const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.default,
    maxWidth: 250,
    border: `2px solid ${theme.palette.mode === 'light' ? theme.palette.border.dark : theme.palette.border.light}`
  }
}));

/**
 * valueFormatter for AgGrid currency Columns
 * @param {*} params
 * @returns 2 digit Doubles with whitespace and Euro symbol.
 */
export const currencyFormatter = ({ value }: { value: number }): string | null => {
  return value ? value.toFixed(2) + ' ' + res.CURRENCY_EURO : null;
};

/**
 * valueFormatter for AgGrid kcal Columns
 * @param {*} params
 * @returns Number with 0 digits and whitespace and kcal added
 */
export const kcalFormatter = ({ value }: { value: number }): string | null => {
  return value ? value.toFixed(0) + ' ' + res.KCAL : null;
};

/**
 * valueFormatter for AgGrid grams Columns
 * @param {*} params
 * @returns Number with 0 digits and whitespace and g added
 */
export const gramsFormatter = ({ value }: { value: number }): string | null => {
  return value ? value.toFixed(0) + ' ' + res.GRAMS : null;
};

/**
 * helper function to validate decimal numbers
 * @param value
 * @returns true for Numbers, false otherwise
 */
export function isNumeric(value: any) {
  return /^-?\d+(\.\d+)?$/.test(value);
}

/**
 * helper function to validate dates in the format YYYY/MM/DD
 * @param dateStr
 * @returns Object containing valid flag and provided date
 */
export function dateValidation(dateStr: Date | string) {
  const date = new Date(dateStr);
  let dateValid: boolean = true;
  if (isNaN(date.getTime())) {
    dateValid = false;
  }
  if ((!isNaN(date.getFullYear()) && date.getFullYear() < 2022) || date.getFullYear() > new Date().getFullYear() + 1) {
    // Datum zwischen 2022 und Folgejahr
    dateValid = false;
  }
  return { isValid: dateValid, date: date };
}

/**
 * React INPUT element with type="date" expects first 10 characters of ISO formatted dates
 * @param {*} date
 * @returns
 */
export function initializeReactDateInput(date: Date) {
  return date.toISOString().substring(0, 10);
}

/**
 * Regular Expression testing for alphabetic characters in either case
 * @param {*} str
 * @returns
 */
export function stringAlphabeticOnly(str: string) {
  const regExAlphabetic = /^[a-zA-Z]+$/;
  return regExAlphabetic.test(str);
}

/**
 * * Regular Expression testing for alphaNumeric characters in either case as well as dots underscores and hyphens
 * @param {*} str
 * @returns
 */
export function stringAlphaNumericOnly(str: string) {
  const regExAlphaNumeric = /^[a-zA-Z0-9._-]*$/;
  return regExAlphaNumeric.test(str);
}

/**
 * returns width for page content based on current window width extracted from supplied breakpoints.
 * @param breakpoints extracted via useTheme()
 * @returns width to use for outer content containers
 */
export const getBreakPointWidth = (breakpoints: Breakpoints) => {
  const isXs = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'));
  const isSm = useMediaQuery((theme: Theme) => theme.breakpoints.only('sm'));
  const isMd = useMediaQuery((theme: Theme) => theme.breakpoints.only('md'));
  const isLg = useMediaQuery((theme: Theme) => theme.breakpoints.only('lg'));
  const isXl = useMediaQuery((theme: Theme) => theme.breakpoints.only('xl'));
  const breakpointWidth = isXs
    ? '90%'
    : isSm
      ? breakpoints.values.sm - 256
      : isMd
        ? breakpoints.values.md - 256
        : isLg
          ? breakpoints.values.lg - 256
          : isXl
            ? breakpoints.values.xl - 256
            : 0;
  return breakpointWidth;
};

export const currentMode = window.localStorage.getItem(localStorageKeys.selectedMode) === 'light' ? 'light' : 'dark';

export const toastOptions = {
  theme: currentMode
};

export const axiosErrorToastOptions: ToastOptions = {
  position: 'top-center' as ToastPosition,
  autoClose: 8000, // milliseconds
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
  transition: Zoom
};
