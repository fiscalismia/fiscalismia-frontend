/**
 * Contains predominantly hardcoded strings not requiring translation based on user locale.
 * For any language specific strings use src/resources/locales_
 */
export const resourceProperties = {
  APP_NAME: 'Fiscalismia',
  GITHUB_REPO: 'Github Repository',
  GITHUB_REPOS: 'Github Repositories',
  FRONTEND: 'fiscalismia-frontend',
  BACKEND: 'fiscalismia-backend',
  INFRASTRUCTURE: 'fiscalismia-infrastructure',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  HOME: 'Home',
  ALL: 'All',
  RESET: 'Reset',
  GRAMS: 'g',
  NO_IMG: 'no-img',
  SYMBOL_PERCENT: '%',
  CURRENCY_EURO: '\u20AC',
  PIECES_SHORT: 'pcs',
  KCAL: 'kcal',
  BUDGET: 'Budget',
  GITHUB_FRONTEND_URL: 'https://github.com/hangrybear666/fiscalismia-frontend',
  GITHUB_BACKEND_URL: 'https://github.com/hangrybear666/fiscalismia-backend',
  GITHUB_INFRASTRUCTURE_URL: 'https://github.com/hangrybear666/fiscalismia-infrastructure',
  FALLBACK_DATE: '2024-01-01',
  BAD_REQUEST: 'Bad Request',
  ERROR_MSG_INCOME_DATA_REQUIRED: 'Fixed Income data required to extract effective_dates',
  ERROR_FALLBACK_MESSAGE: 'Error has not been handled explicitly. Implementation should catch this properly.',
  STATUS: 'Status',
  STATUSTEXT: 'StatusText',
  DATA: 'Data',
  FOOTER_TEXT: 'Built /w React, TypeScript & Material UI',
  STATUS_NOT_DEFINED: 'Status Not defined',
  STATUSTEXT_NOT_DEFINED: 'StatusText Not defined',
  GENERIC_ERROR_MESSAGE: 'Sorry, an unexpected error has occurred.',
  ERROR_USER_SETTINGS_NOT_DEFINED: 'User Settings could not be loaded. loginUserName not set.',
  ERROR_USER_SETTINGS_CHANGE_DENIED_LOGINUSER_NOT_DEFINED: 'User Settings change denied. loginUserName not set.',
  ERROR_INVESTMENT_DIVIDENDS_CRITICAL_ERROR: 'WRONG DATA IN DB. OWNED UNITS NEGATIVE? FIX ASAP.',
  NOT_DEFINED: 'Not defined',
  // Functions with placeholder vars
  USER_ALREADY_LOGGED_IN: (pos1: string) => `User ${pos1} is already logged in.`,
  PATH_DOES_NOT_EXIST: (pos1: string) => `Sorry, the requested path ${pos1} does not exist.`,

  AG_GRID_STYLE_DARK: 'ag-theme-quartz-dark',
  AG_GRID_STYLE_LIGHT: 'ag-theme-quartz',

  INDULGENCES_KEY_CAFFEINE: 'caffeine',
  INDULGENCES_KEY_ASPARTAME_SACCHARIN: 'aspartame/saccharin',

  INCOME_NET_SALARY_KEY: 'net salary',
  INCOME_GROSS_SALARY_KEY: 'gross salary',

  MINOR_INPUT_ALL_FOOD_ITEMS_MODAL_OPEN: 'TSV Import Food Items',
  MINOR_INPUT_ALL_FOOD_ITEMS_MODAL_INPUT_TEXT_AREA_DESCRIPTION: 'TSV Input/Output',
  MINOR_INPUT_ALL_FOOD_ITEMS_MODAL_INPUT_TEXT_AREA_HELPER:
    'MANDATORY HEADERS: food_item, brand, store,  main_macro, kcal_amount, weight, price, last_update',

  MINOR_INPUT_FIXED_COSTS_MODAL_OPEN: 'TSV Import Fixed Costs',
  MINOR_INPUT_FIXED_COSTS_MODAL_INPUT_TEXT_AREA_DESCRIPTION: 'TSV Input/Output',
  MINOR_INPUT_FIXED_COSTS_MODAL_INPUT_TEXT_AREA_HELPER:
    'MANDATORY HEADERS: category, description,  monthly_interval,  billed_cost, monthly_cost,  effective_date,  expiration_date',

  MINOR_INPUT_VARIABLE_EXPENSES_MODAL_OPEN: 'TSV Import Variable Expenses',
  MINOR_INPUT_VARIABLE_EXPENSES_MODAL_INPUT_TEXT_AREA_DESCRIPTION: 'TSV Input/Output',
  MINOR_INPUT_VARIABLE_EXPENSES_MODAL_INPUT_TEXT_AREA_HELPER:
    'MANDATORY HEADERS: description,  category,  store cost,  purchasing_date,  is_planned,  contains_indulgence, sensitivities',

  MINOR_INPUT_FIXED_INCOME_MODAL_OPEN: 'TSV Import Fixed Income',
  MINOR_INPUT_FIXED_INCOME_MODAL_INPUT_TEXT_AREA_DESCRIPTION: 'TSV Input/Output',
  MINOR_INPUT_FIXED_INCOME_MODAL_INPUT_TEXT_AREA_HELPER:
    'MANDATORY HEADERS: description,	type,	monthly_interval,	value,	effective_date,	expiration_date',

  MINOR_INPUT_INVESTMENTS_MODAL_OPEN: 'TSV Import Investments',
  MINOR_INPUT_INVESTMENTS_MODAL_INPUT_TEXT_AREA_DESCRIPTION: 'TSV Input/Output',
  MINOR_INPUT_INVESTMENTS_MODAL_INPUT_TEXT_AREA_HELPER:
    'MANDATORY HEADERS: execution_type,	description,	isin,	investment_type,	marketplace,	units,	price_per_unit,	total_price,	fees,	execution_date',

  // database columns, do not rename
  INCOME_INVESTMENTS_EXECUTION_TYPE_SELL_KEY: 'sell',
  INCOME_INVESTMENTS_EXECUTION_TYPE_BUY_KEY: 'buy',
  INCOME_INVESTMENTS_DB_COL_NAME_DESCRIPTION: 'description',
  INCOME_INVESTMENTS_DB_COL_NAME_ID: 'id',
  INCOME_INVESTMENTS_DB_COL_NAME_COUNT: 'cnt',
  INCOME_INVESTMENTS_DB_COL_NAME_ISIN: 'isin',
  INCOME_INVESTMENTS_DB_COL_NAME_INVESTMENT_TYPE: 'investment_type',
  INCOME_INVESTMENTS_DB_COL_NAME_UNITS: 'units',
  INCOME_INVESTMENTS_DB_COL_NAME_PRICE_PER_UNIT: 'price_per_unit',
  INCOME_INVESTMENTS_DB_COL_NAME_FEES: 'fees',
  INCOME_INVESTMENTS_DB_COL_NAME_TOTAL_PRICE: 'total_price',
  INCOME_INVESTMENTS_DB_COL_NAME_EXECUTION_DATE: 'execution_date',
  INCOME_INVESTMENTS_DB_COL_NAME_EXECUTION_TYPE: 'execution_type',
  INCOME_INVESTMENTS_DB_COL_NAME_MARKETPLACE: 'marketplace',
  INCOME_INVESTMENTS_DB_COL_NAME_DIVIDEND_AMOUNT: 'dividend_amount',
  INCOME_INVESTMENTS_DB_COL_NAME_PCT_OF_TOTAL: 'pct_of_total',
  INCOME_INVESTMENTS_DB_COL_NAME_AVG_PPU: 'avg_ppu',
  INCOME_INVESTMENTS_DB_COL_NAME_DIVIDEND_DATE: 'dividend_date',

  // hardcoded IDs
  MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_TODAY: 'date_today',
  MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_COFFEE: 'coffee_in_shop',
  MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_COLA: 'cola_in_kiosk',
  MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_CHOCO_CROISSANT: 'chocolate_croissant',
  MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_BREAKFAST: 'eggs_and_shrimp'
};

export const localStorageKeys = {
  token: 'jwt-token',
  loginUserName: 'loginUserName',
  authenticated: 'userAuthenticated',
  selectedMode: 'selected_mode',
  selectedPalette: 'selected_palette',
  selectedLanguage: 'selected_language'
};

export const fixedCostCategories = {
  LIVING_ESSENTIALS_KEY: 'LIVING_ESSENTIALS',
  LIVING_ESSENTIALS_VALUE: 'Miete & Nebenkosten',
  INTERNET_AND_PHONE_KEY: 'INTERNET_AND_PHONE',
  INTERNET_AND_PHONE_VALUE: 'Internet & Mobilfunk',
  INSURANCE_KEY: 'INSURANCE',
  INSURANCE_VALUE: 'Versicherungen',
  STUDENT_LOANS_KEY: 'STUDENT_LOANS',
  STUDENT_LOANS_VALUE: 'Studienkredite',
  LEISURE_MUSIC_PODCASTS_KEY: 'LEISURE_MUSIC_PODCASTS',
  LEISURE_MUSIC_PODCASTS_VALUE: 'Musik & Podcasts',
  LEISURE_TV_CINEMA_KEY: 'LEISURE_TV_CINEMA',
  LEISURE_TV_CINEMA_VALUE: 'Filme & Serien',
  LEISURE_GAMING_KEY: 'LEISURE_GAMING',
  LEISURE_GAMING_VALUE: 'Gaming',
  SPORTS_FACILITIES_KEY: 'SPORTS_FACILITIES',
  SPORTS_FACILITIES_VALUE: 'Studiomitgliedschaften',
  SUPPLEMENTS_HEALTH_KEY: 'SUPPLEMENTS_HEALTH',
  SUPPLEMENTS_HEALTH_VALUE: 'Supplemente: Gesundheit',
  SUPPLEMENTS_PERFORMANCE_KEY: 'SUPPLEMENTS_PERFORMANCE',
  SUPPLEMENTS_PERFORMANCE_VALUE: 'Supplemente: Leistung',
  PHYSIO_AND_HEALTH_COURSES_KEY: 'PHYSIO_AND_HEALTH_COURSES',
  PHYSIO_AND_HEALTH_COURSES_VALUE: 'Physio & Gesundheitskurse'
};

export const foodItemInputCategories = {
  ARRAY_STORES: [
    'Aldi Süd',
    'Lidl',
    'Kaufland',
    'Rewe',
    'Metro',
    'Amazon',
    'Netto',
    'Edeka',
    'Metzger',
    'Online',
    'All'
  ],
  JSON_STORES: {
    aldi: 'Aldi Süd',
    lidl: 'Lidl',
    kaufland: 'Kaufland',
    rewe: 'Rewe',
    metro: 'Metro',
    amazon: 'Amazon',
    netto: 'Netto',
    edeka: 'Edeka',
    butcher: 'Metzger',
    online: 'Online',
    all: 'All'
  },
  ARRAY_MACROS: ['Protein', 'Fat', 'Carbs', 'Fiber'],
  JSON_MACROS: {
    protein: 'Protein',
    fat: 'Fat',
    carbs: 'Carbs',
    fiber: 'Fiber'
  }
};
// refactor to have objects with key value pairs
export const investmentInputCategories = {
  ARRAY_ORDER_TYPE: ['buy', 'sell'],
  ARRAY_INVESTMENT_TYPE: ['stock', 'etf']
};

export const serverConfig = {
  API_BASE_URL: 'http://localhost:3002/api/fiscalismia'
};
