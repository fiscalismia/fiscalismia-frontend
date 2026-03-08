import { JwtPayload } from 'jwt-decode';
/**
 * Guarantee that user is authenticated before accessing protected routes.
 * Also provides a token to add to http requests against the express server to access protected API endpoints
 * @property {number} token JWT Auth token to put in request.Authorization headers concatenated to 'Bearer '
 * @property {string} setToken set returned and decoded string jwt token for authentication of http requests
 * @property {string} loginUserName SELECT username FROM public.um_users
 * @property {string} setLoginUserName setter for a username string
 */
export type AuthInfo = {
  token: string | null;
  setToken: (token: string | null) => void;
  loginUserName: string | null;
  setLoginUserName: (username: string | null) => void;
};

/**
 * @table public.um_users
 * @property {number} userId SELECT id FROM public.um_users
 * @property {string} userName SELECT username FROM public.um_users
 * @property {string} userEmail SELECT email FROM public.um_users
 * @property {string} userSchema SELECT schema FROM public.um_users
 */
export type User = {
  userId: number;
  userName: string;
  userEmail: string;
  userSchema: string;
};

/**
 * Extending the JWT Auth Payload Object with my User type to be able to directly access
 * - user.userId
 * - user.userName
 * - user.userEmail
 * - user.userSchema
 */
export type CustomJwtToken = JwtPayload & {
  user: User;
};

/**
 * User Credentials Object used for e.g. Account Creation and INSERT into table public.um_users.
 * INFO: The userSchema is created in backend based on username
 * @property {string} username
 * @property {string | null} email
 * @property {string} password
 */
export type UserCredentials = {
  username: string;
  email: string | null;
  password: string;
};

/**
 * Username for subsequently querying id from public.um_users and the setting key value pairs to insert into table public.um_user_settings
 * @table public.um_users, public.um_user_settings
 * @property {string} username SELECT id FROM public.um_users WHERE username = 'username'
 * @property {string} settingKey setting_key column of um_user_settings
 * @property {string} settingValue setting_value column of um_user_settings
 */
export type UserSettingObject = {
  username: string;
  settingKey: string;
  settingValue: string;
};

/**
 * Contains navigation info such as header, subHeader and relative path
 * @property {string} header
 * @property {string} subHeader
 * @property {string} path
 */
export type RouteInfo = {
  header: string;
  subHeader: string;
  path: string;
};
/**
 * id, price and date range for a temporarily discounted food item
 * @table food_price_discounts
 * @property {number} id discount id
 * @property {number} price discount price
 * @property {Date} startDate begin date of discount
 * @property {Date} endDate end date of discount
 */
export type FoodItemDiscount = {
  id: number;
  price: number;
  startDate: Date;
  endDate: Date;
};

/**
 * id, price and date range for a temporarily discounted food item
 * @description For DB INSERTION via Frontend manual data entry, rather than TSV bulk Inserts directly handled in the backend.
 * @see https://github.com/fiscalismia/fiscalismia-backend/blob/main/utils/customTypes.ts
 * @table food_price_discounts
 * @property {string} food_item string of a food item
 * @property {string} brand Brand of the food item
 * @property {string} store Store where the food item is purchased
 * @property {string} main_macro Main macronutrient of the food item
 * @property {number} kcal_amount Caloric amount of the food item
 * @property {number} weight Weight of the food item
 * @property {number} price Price of the food item
 * @property {Date} last_update DIFFERENT FROM BACKEND WHERE IT IS A STRING - Date of last price check
 */
export type FoodItem = {
  food_item: string;
  brand: string;
  store: string;
  main_macro: string;
  kcal_amount: number;
  weight: number;
  price: number;
  last_update: Date; // DIFFERENT FROM BACKEND WHERE IT IS A STRING
};

export type TwelveCharacterString = `${string & { length: 12 }}`;
/**
 * Complex Type for inserting into 3 tables that have relations to each other.
 * @table investment_dividends, investment_taxes, bridge_investment_dividends
 * @property {TwelveCharacterString} isin International Security Identification Number -> 12 character string beginning with country short
 * @property {number} dividendAmount Amount of dividend received
 * @property {Date} dividendDate Date of dividend payment
 * @property {number} pctOfProfitTaxed Percentage of profit taxed
 * @property {number} profitAmount Total profit amount
 * @property {{ investmentId: number; remainingUnits: number; }} investmentIdsAndRemainingUnits Object containing investment ID and remaining units
 */
export type DividendsRelatedInvestmentsAndTaxes = {
  isin: TwelveCharacterString;
  dividendAmount: number;
  dividendDate: Date;
  pctOfProfitTaxed: number;
  profitAmount: number;
  investmentIdsAndRemainingUnits: {
    investmentId: number;
    remainingUnits: number;
  }[];
};

/**
 * Bought investments are stored in investments table, if the execution type is sell, tax information is added for investment_taxes table.
 * @description For DB INSERTION via Frontend manual data entry, rather than TSV bulk Inserts directly handled in the backend.
 * @see https://github.com/fiscalismia/fiscalismia-backend/blob/main/utils/customTypes.ts
 * @table investments, investment_taxes
 * @property {string} execution_type string containing the type of execution -> 'buy' or 'sell' *
 * @property {string} description Description of the investment
 * @property {TwelveCharacterString} isin DIFFERENT FROM BACKEND WHERE IT IS A STRING - International Security Identification Number -> 12 character string beginning with country short
 * @property {string} investment_type Type of investment
 * @property {string} marketplace Marketplace where the investment was bought from or sold at
 * @property {number} units Number of shares purchased or sold
 * @property {number} price_per_unit Price per unit of the share
 * @property {number} total_price Total price of the investment including fees
 * @property {number} fees Fees paid for the investment execution
 * @property {Date} execution_date DIFFERENT FROM BACKEND WHERE IT IS A STRING - Date of the investment transaction execution
 * @property {number | null} pct_of_profit_taxed Percentage of profit taxed (nullable for execution_type buy)
 * @property {number | null} profit_amt Amount of profit generated from the investment (nullable for execution_type buy)
 */
export type InvestmentAndTaxes = {
  execution_type: string;
  description: string;
  isin: TwelveCharacterString; // DIFFERENT FROM BACKEND WHERE IT IS A STRING
  investment_type: string;
  marketplace: string;
  units: number;
  price_per_unit: number;
  total_price: number;
  fees: number;
  execution_date: Date; // DIFFERENT FROM BACKEND WHERE IT IS A STRING
  pct_of_profit_taxed: number | null;
  profit_amt: number | null;
};

/**
 * Object sent to the server for updating the price and last_update date of a food item entry.
 * @table table_food_prices
 * @property {number} price
 * @property {Date} lastUpdate
 */
export type FoodItemUpdateObject = {
  price: number;
  lastUpdate: Date;
};

export type BooleanPieColors = {
  backgroundColor: {
    pieColor1: string;
    pieColor2: string;
  };
  borderColor: {
    borderColor1: string;
    borderColor2: string;
  };
};

export type ContentChartBooleanPieObject = {
  chartTitle: string;
  skipTitle?: boolean;
  labels: string[];
  dataSetCount: number;
  dataSet1: number[];
  dataSet1Name: string;
  dataSet1Colors: BooleanPieColors;
  dataSet2: number[];
  dataSet2Name: string;
  dataSet2Colors: BooleanPieColors;
};

export type ContentChartHorizontalBarObject = {
  chartTitle: string;
  skipTitle?: boolean;
  labels: string[];
  dataSetCount: number;
  dataSet1: any;
  dataSet2: any;
  dataSet3: any;
  dataSet4: any;
  dataSet5: any;
  dataSet6: any;
  dataSet1Name: string;
  dataSet2Name: string;
  dataSet3Name: string;
  dataSet4Name: string;
  dataSet5Name: string;
  dataSet6Name: string;
  color1?: any;
  color2?: any;
  color3?: any;
  color4?: any;
  color5?: any;
  color6?: any;
};

export type ContentChartVerticalBarObject = {
  chartTitle: string;
  labels: string[];
  dataSet1: any;
  dataSet2: any;
  dataSet3: any;
  dataSet4?: any;
  dataSet1Name: any;
  dataSet2Name: any;
  dataSet3Name: any;
  dataSet4Name?: any;
  color1: any;
  color2: any;
  color3: any;
  color4?: any;
};

export type ContentChartLineObject = {
  chartTitle: string;
  labels: string[];
  dataSet1: any;
  dataSet1Name: string;
  pointColor1: string;
  lineColor1: string;
  dataSet2?: any;
  dataSet2Name?: string;
  pointColor2?: string;
  lineColor2?: string;
  selectionColor: string;
};

export type ContentCardObject = {
  header: string;
  amount: number | null;
  subtitle: string;
  details: string[] | null;
  img: string | null;
  icon: React.ReactNode;
};

/**
 * @description Tracks simple mouseclicks from the user for sending canvas browser window inputs to backends
 * @property {custom_mouse_click} type
 * @property {number} x
 * @property {number} y
 * @property {'left' | 'middle' | 'right'} button
 */
export interface MouseClickInput {
  type: 'custom_mouse_click';
  x: number;
  y: number;
  button: 'left' | 'middle' | 'right';
}

/**
 * @description Tracks simple mouseWHeel events from the user for sending canvas browser window inputs to backends
 * @property {mouseWheel} type
 * @property {number} deltaX
 * @property {number} deltaY
 * @property {number} x
 * @property {number} y
 * @property {'none'} button
 */
export interface MouseWheelInput {
  type: 'mouseWheel';
  deltaX: number;
  deltaY: number;
  x: number;
  y: number;
  button: 'none';
}

/**
 * Real-time mouse move forwarded from canvas.
 * Throttled client-side before sending.
 * @property {mouseMoved} type
 * @property {number} x
 * @property {number} y
 * @property {'none'} button
 */
export interface MouseMoveInput {
  type: 'mouseMoved';
  x: number;
  y: number;
  button: 'none';
}

// interface MouseMoveInput extends BaseInput { type: 'mousemove'; x: number; y: number }
// interface KeyDownInput extends BaseInput { type: 'keydown'; key: string; modifiers: number }
export type CDPUserInput = MouseClickInput | MouseWheelInput | MouseMoveInput;
