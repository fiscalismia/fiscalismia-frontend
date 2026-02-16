import { paths } from '../../resources/router_navigation_paths';
import SavingsIcon from '@mui/icons-material/Savings';
import EuroIcon from '@mui/icons-material/Euro';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LiquorIcon from '@mui/icons-material/Liquor';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import PercentIcon from '@mui/icons-material/Percent';
import CottageIcon from '@mui/icons-material/Cottage';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { locales } from '../../utils/localeConfiguration';
export const menuEntries = [
  {
    id: locales().MENU_VARIABLE_EXPENSES,
    children: [
      { id: locales().MENU_OVERVIEW, path: paths.VARIABLE_EXPENSES_OVERVIEW, icon: <AnalyticsIcon /> },
      { id: locales().MENU_STORES, path: paths.VARIABLE_EXPENSES_STORES, icon: <StorefrontIcon /> },
      { id: locales().MENU_INDULGENCES, path: paths.VARIABLE_EXPENSES_INDULGENCES, icon: <LiquorIcon /> }
    ]
  },
  {
    id: locales().MENU_FIXED_COSTS,
    children: [
      { id: locales().MENU_OVERVIEW, path: paths.FIXED_COSTS_OVERVIEW, icon: <AnalyticsIcon /> },
      { id: locales().MENU_LIVING_ESSENTIALS, path: paths.FIXED_COSTS_LIVING_ESSENTIALS, icon: <CottageIcon /> },
      {
        id: locales().MENU_RECREATION_RELAXATION,
        path: paths.FIXED_COSTS_RECREATION_RELAXATION,
        icon: <SportsEsportsIcon />
      }
    ]
  },
  {
    id: locales().MENU_INCOME,
    children: [
      { id: locales().MENU_OVERVIEW, path: paths.INCOME_OVERVIEW, icon: <AnalyticsIcon /> },
      { id: locales().MENU_MONTHLY_BUDGET, path: paths.INCOME_MONTHLY_BUDGET, icon: <EuroIcon /> },
      { id: locales().MENU_INVESTMENTS, path: paths.INCOME_INVESTMENTS, icon: <SavingsIcon /> },
      { id: locales().MENU_PORTFOLIO, path: paths.INCOME_PORTFOLIO, icon: <ShowChartIcon /> },
      { id: locales().MENU_SALES, path: paths.INCOME_SALES, icon: <CreditScoreIcon /> }
    ]
  },
  {
    id: locales().MENU_DEALS,
    children: [
      { id: locales().MENU_OVERVIEW, path: paths.DEALS_OVERVIEW, icon: <PercentIcon /> },
      { id: locales().MENU_FOOD_PRICES, path: paths.DEALS_FOOD_PRICES, icon: <ShoppingCartIcon /> },
      { id: locales().MENU_GROCERY_DEALS, path: paths.DEALS_GROCERY_DEALS, icon: <AddShoppingCartIcon /> }
    ]
  },
  {
    id: locales().MENU_ADMIN_PANEL,
    children: [
      { id: locales().MENU_UPLOAD_MANUAL, path: paths.MENU_UPLOAD_MANUAL, icon: <FileUploadIcon /> },
      { id: locales().MENU_ETL_RAW_DATA, path: paths.MENU_ETL_RAW_DATA, icon: <FileUploadIcon /> }
    ]
  }
];
