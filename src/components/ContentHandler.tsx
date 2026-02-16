import React from 'react';
import { menuEntries } from './minor/MenuEntries';
import { paths } from '../resources/router_navigation_paths';
import { Route, Routes } from 'react-router-dom';
import TestData from './content/TestData';
import FixedCosts_Overview from './content/fixedCosts_Overview';
import FixedCosts_LivingEssentials from './content/fixedCosts_LivingEssentials';
import FixedCosts_Leisure from './content/fixedCosts_Leisure';
import Deals_Overview from './content/deals_Overview';
import Deals_FoodPrices from './content/deals_FoodPrices';
import Deals_GroceryDeals from './content/deals_GroceryDeals';
import Box from '@mui/material/Box';
import { contentMaxWidth } from './styling/Theme';
import PaletteAndThemeTest from './content/PaletteAndThemeTest';
import Income_Overview from './content/income_Overview';
import Income_Monthly_Budget from './content/income_MonthlyBudget';
import Income_Investments from './content/income_Investments';
import Income_Sales from './content/income_Sales';
import Admin_RawDataDbInit from './content/admin_RawDataDbInit';
import VariableExpenses_Overview from './content/variableExpenses_Overview';
import { RouteInfo } from '../types/custom/customTypes';

interface ContentProps {}
/**
 * Changes content body depending on selected route in based on MenuEntries and router_navigation_paths in resources.
 * @param _props
 * @returns
 */
export default function Content(_props: ContentProps) {
  const renderedElement = (parentId: string, childId: string, path: string) => {
    const routeInfo: RouteInfo = {
      header: parentId,
      subHeader: childId,
      path: path
    };
    switch (path) {
      case paths.VARIABLE_EXPENSES_OVERVIEW:
        return <VariableExpenses_Overview routeInfo={routeInfo} />;
      case paths.VARIABLE_EXPENSES_STORES:
        return <TestData routeInfo={routeInfo} />;
      case paths.VARIABLE_EXPENSES_INDULGENCES:
        return <TestData routeInfo={routeInfo} />;
      case paths.FIXED_COSTS_OVERVIEW:
        return <FixedCosts_Overview routeInfo={routeInfo} />;
      case paths.FIXED_COSTS_LIVING_ESSENTIALS:
        return <FixedCosts_LivingEssentials routeInfo={routeInfo} />;
      case paths.FIXED_COSTS_RECREATION_RELAXATION:
        return <FixedCosts_Leisure routeInfo={routeInfo} />;
      case paths.INCOME_OVERVIEW:
        return <Income_Overview routeInfo={routeInfo} />;
      case paths.INCOME_MONTHLY_BUDGET:
        return <Income_Monthly_Budget routeInfo={routeInfo} />;
      case paths.INCOME_SALES:
        return <Income_Sales routeInfo={routeInfo} />;
      case paths.INCOME_INVESTMENTS:
        return <Income_Investments routeInfo={routeInfo} />;
      case paths.DEALS_OVERVIEW:
        return <Deals_Overview routeInfo={routeInfo} />;
      case paths.DEALS_FOOD_PRICES:
        return <Deals_FoodPrices routeInfo={routeInfo} />;
      case paths.DEALS_GROCERY_DEALS:
        return <Deals_GroceryDeals routeInfo={routeInfo} />;
      case paths.MENU_UPLOAD_MANUAL:
        return <TestData routeInfo={routeInfo} />;
      case paths.MENU_ETL_RAW_DATA:
        return <Admin_RawDataDbInit routeInfo={routeInfo} />;
      default:
        <React.Fragment></React.Fragment>;
        break;
    }
    return null;
  };

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        py: 3,
        px: 3
      }}
    >
      <Box id="content" sx={{ maxWidth: contentMaxWidth, margin: '0 auto' }}>
        <PaletteAndThemeTest show={false} />
        <Routes>
          {menuEntries.map((parent) => (
            <React.Fragment key={parent!.id}>
              {parent!.children.map((child) => (
                <Route
                  path={child!.path}
                  element={renderedElement(parent!.id, child!.id, child!.path)}
                  key={child!.id}
                />
              ))}
            </React.Fragment>
          ))}
        </Routes>
      </Box>
    </Box>
  );
}
