import axios, { AxiosError } from 'axios';
import { localStorageKeys } from '../resources/resource_properties';
import {
  DividendsRelatedInvestmentsAndTaxes,
  FoodItem,
  FoodItemDiscount,
  FoodItemUpdateObject,
  InvestmentAndTaxes,
  UserCredentials,
  UserSettingObject
} from '../types/custom/customTypes';
import { toast } from 'react-toastify';
import { axiosErrorToastOptions, toastOptions } from '../utils/sharedFunctions';
import { axiosClient } from './axiosErrorHandler';
import { locales } from '../utils/localeConfiguration';
/**
 *
 */
export class FileSizeError extends Error {
  /**
   *
   * @param message
   */
  constructor(message: string) {
    super(message);
    this.name = 'FileSizeError';
  }
}

/***
 *      ___  _   _ _____ _   _  _____ _   _ _____ _____ _____   ___ _____ _____ _____ _   _
 *     / _ \| | | |_   _| | | ||  ___| \ | |_   _|_   _/  __ \ / _ \_   _|_   _|  _  | \ | |
 *    / /_\ \ | | | | | | |_| || |__ |  \| | | |   | | | /  \// /_\ \| |   | | | | | |  \| |
 *    |  _  | | | | | | |  _  ||  __|| . ` | | |   | | | |    |  _  || |   | | | | | | . ` |
 *    | | | | |_| | | | | | | || |___| |\  | | |  _| |_| \__/\| | | || |  _| |_\ \_/ / |\  |
 *    \_| |_/\___/  \_/ \_| |_/\____/\_| \_/ \_/  \___/ \____/\_| |_/\_/  \___/ \___/\_| \_/
 */

// set from local storage variable on each request, to avoid caching of local variable in this file between logouts
let token: string;

const setToken = () => {
  token = window.localStorage.getItem(localStorageKeys.token)!;
};

/**
 * UNPROTECTED ROUTE for Login Page.
 * username and password is mandatory, email is currently optional
 * userschema is created in the backend for database isolation between each user
 * @param {UserCredentials} credentials {username, email, password}
 * @returns JSON Web Token with the following structure:
 * {
    "user": {
      "userId": 1,
      "userName": "admin",
      "userEmail": "herp_derp@hotmail.com"
      "userShema": "private_admin"
    },
    "iat": 1758049728,
    "exp": 1758136128
  }
 */
export const login = async (credentials: UserCredentials) => {
  try {
    const response = await axiosClient.post('/um/login', credentials);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * 1) performs DB INSERTION into um_users
 * 2) initializes um_user_settings such as mode (light) and palette(default) and selected_language(en_US)
 * @param {UserCredentials} credentials  {username, email, password}
 * @returns username if successful OR error otherwise
 */
export const createUserCredentials = async (credentials: UserCredentials) => {
  try {
    const response = await axiosClient.post('/um/credentials', credentials);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/***
 *     _____  _____ _____      ___   _      _
 *    |  __ \|  ___|_   _|    / _ \ | |    | |
 *    | |  \/| |__   | |     / /_\ \| |    | |
 *    | | __ |  __|  | |     |  _  || |    | |
 *    | |_\ \| |___  | |     | | | || |____| |____
 *     \____/\____/  \_/     \_| |_/\_____/\_____/
 */

/**
 * @returns Object containing a results array with all fixed costs from the db
 * @route /api/fiscalismia/fixed_costs
 */
export const getAllFixedCosts = async () => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/fixed_costs', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * @returns Object containing a results array with all sensitivities within variable expenses in db
 * @route /api/fiscalismia/sensitivity
 */
export const getAllVariableExpenseSensitivities = async () => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/sensitivity', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * @returns Object containing a results array with all stores within variable expenses in db
 * @route /api/fiscalismia/store
 */
export const getAllVariableExpenseStores = async () => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/store', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * @returns Object containing a results array with all categories within variable expenses in db
 * @route /api/fiscalismia/category
 */
export const getAllVariableExpenseCategories = async () => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/category', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * @returns Object containing a results array with all variable Expenses from the db
 * @route /api/fiscalismia/variable_expenses
 */
export const getAllVariableExpenses = async () => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/variable_expenses', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * @returns Object containing a results array with all investments from the db
 * @route /api/fiscalismia/investments
 */
export const getAllInvestments = async () => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/investments', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * @returns Object containing a results array with all dividends of investments from the db
 * @route /api/fiscalismia/investment_dividends
 */
export const getAllDividends = async () => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/investment_dividends', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * @returns Object containing a results array with all fixed income data from the db
 * @route /api/fiscalismia/fixed_costs
 */
export const getAllFixedIncome = async () => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/fixed_income', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * Returns food prices and discounts valid at the time of request (current_date)
 * @returns Object containing a results array with all food prices and discounts from the db
 * @route /api/fiscalismia/food_prices_and_discounts
 */
export const getAllFoodPricesAndDiscounts = async () => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/food_prices_and_discounts', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * Returns discounted foods valid at the time of request (current_date)
 * @returns Object containing a results array with all active discounts from the db
 * @route /api/fiscalismia/discounted_foods_current
 */
export const getCurrentFoodDiscounts = async () => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/discounted_foods_current', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};
/***
 *     _____  _____ _____     ___________ _____ _____ ___________ _____ _____
 *    |  __ \|  ___|_   _|   /  ___| ___ \  ___/  __ \_   _|  ___|_   _/  __ \
 *    | |  \/| |__   | |     \ `--.| |_/ / |__ | /  \/ | | | |_    | | | /  \/
 *    | | __ |  __|  | |      `--. \  __/|  __|| |     | | |  _|   | | | |
 *    | |_\ \| |___  | |     /\__/ / |   | |___| \__/\_| |_| |    _| |_| \__/\
 *     \____/\____/  \_/     \____/\_|   \____/ \____/\___/\_|    \___/ \____/
 */

/**
 *
 * @param username
 * @returns
 */
export const getUserSpecificSettings = async (username: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get(`/um/settings/${username}`, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * Returns fixed costs valid for a specific provided date in the format (yyyy-mm-dd)
 * @param {*} validDate Date currently required to be in english date format (yyyy-mm-dd)
 * @returns Object containing a results array with all fixed costs valid at provided date from the db
 * @route /api/fiscalismia/fixed_costs/valid/:date
 */
export const getFixedCostsByEffectiveDate = async (validDate: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get(`/fixed_costs/valid/${validDate}`, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * Returns variable expenses dependent on provided category description as string
 * @param {*} category category description string
 * @returns Object containing a results array with all variable expenses with provided category
 * @route /api/fiscalismia/variable_expenses/category/:category
 */
export const getVariableExpenseByCategory = async (category: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get(`/variable_expenses/category/${category}`, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * Returns fixed income valid for a specific provided date in the format (yyyy-mm-dd)
 * @param {*} validDate Date currently required to be in english date format (yyyy-mm-dd)
 * @returns Object containing a results array with all fixed income data valid at provided date from the db
 * @route /api/fiscalismia/fixed_income/valid/:date
 */
export const getFixedIncomeByEffectiveDate = async (validDate: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get(`/fixed_income/valid/${validDate}`, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/***
 *    ______ _____ _____ _____
 *    | ___ \  _  /  ___|_   _|
 *    | |_/ / | | \ `--.  | |
 *    |  __/| | | |`--. \ | |
 *    | |   \ \_/ /\__/ / | |
 *    \_|    \___/\____/  \_/
 */

/**
 * performs db UPSERT statement for um_user_settings for:
 * SET setting_value='value'
 * WHERE user_id = (subselect loginUserName) AND setting_key='key'
 * @param {*} username SELECT id FROM public.um_users WHERE username = 'loginUserName'
 * @param {*} settingKey setting_key column of um_user_settings
 * @param {*} settingValue setting_value column of um_user_settings
 * @returns username associated with updated row
 */
export const postUpdatedUserSettings = async (username: string, settingKey: string, settingValue: string) => {
  const userSettingObj: UserSettingObject = { username, settingKey, settingValue };
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.post('/um/settings', userSettingObj, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * User Upload of images such as jpg/webp/png requiring:
 * - <input type="file" /> within a <Button component='label'/>
 * @param event
 * @param foodItemId
 * @returns persistence filepath of the stored image
 */

export const postFoodItemImg = async (event: React.ChangeEvent<HTMLInputElement>, foodItemId: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
    };
    if (!event.target.files) {
      toast.error(locales().CONTENT_CARD_DISCOOUNT_NOTIFICATION_MESSAGE_FILE_MISSING, axiosErrorToastOptions);
      return;
    }
    const file = event.target.files[0];
    if (file?.size > 1 * 1024 * 1024) {
      return new FileSizeError(locales().CONTENT_CARD_DISCOOUNT_NOTIFICATION_MESSAGE_FILE_SIZE_EXCEEDED);
    }
    if (file?.type !== 'image/png' && file?.type !== 'image/jpeg' && file?.type !== 'image/webp') {
      return new axios.AxiosError(locales().CONTENT_CARD_DISCOOUNT_NOTIFICATION_MESSAGE_INVALID_FILE_TYPE);
    }
    const formData = new FormData();
    formData.append('foodItemImg', file);
    formData.append('id', foodItemId);
    const response = await axiosClient.post('/upload/food_item_img', formData, config);
    return response;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
    return;
  }
};
/**
 * performs db insertion of provided object
 * @param {*} foodItemDiscountObj with fields: id,price,startDate,endDate
 * @returns
 */
export const postFoodItemDiscount = async (foodItemDiscountObj: FoodItemDiscount) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
    const response = await axiosClient.post('/food_item_discount', foodItemDiscountObj, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * performs db insertion of provided object
 * @param {*} foodItemObj with fields: food_item | brand | store | main_macro | kcal_amount | weight | price | last_update
 * @returns dimension_key of inserted object or ERROR
 */
export const postNewFoodItem = async (foodItemObj: FoodItem) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
    const response = await axiosClient.post('/food_item', foodItemObj, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * performs db insertion of provided object
 * @param {*} investmentAndTaxesObject with fields: execution_type, description, isin, investment_type, marketplace, units, price_per_unit, total_price, fees, execution_date, pct_of_profit_taxed, profit_amt
 * @returns id of inserted investment row in results
 * id(fk) of inserted taxes row in taxesResults or ERROR
 */
export const postInvestments = async (investmentAndTaxesObject: InvestmentAndTaxes) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
    const response = await axiosClient.post('/investments', investmentAndTaxesObject, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * performs db insertion of provided object
 * @param {*} dividendsObject with fields: isin, dividendAmount, dividendDate, pctOfProfitTaxed, profitAmount
 * @returns id of inserted dividend row in results
 * id(fk) of inserted taxes row in taxesResults or ERROR
 */
export const postDividends = async (dividendsObject: DividendsRelatedInvestmentsAndTaxes) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
    const response = await axiosClient.post('/investment_dividends', dividendsObject, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/***
 *    ______ _____ _      _____ _____ _____
 *    |  _  \  ___| |    |  ___|_   _|  ___|
 *    | | | | |__ | |    | |__   | | | |__
 *    | | | |  __|| |    |  __|  | | |  __|
 *    | |/ /| |___| |____| |___  | | | |___
 *    |___/ \____/\_____/\____/  \_/ \____/
 *
 */

/**
 * deletes server side images and removes filepath entry from db
 * @param id
 * @returns filepath string if deletion was successful
 */
export const deleteFoodItemImg = async (id: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.delete(`/public/img/uploads/${id}`, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * deletes the corresponding food item rows 1-n from the db. One row per effective date.
 * @param id
 * @returns id(s) of the deleted food item
 */
export const deleteFoodItem = async (id: number) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.delete(`/food_item/${id}`, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * DELETE request to delete the row with supplied food_prices_dimension_key discount_start_date from food_price_discounts
 * against API_BASE_URL/food_item_discount/:food_prices_dimension_key/:discount_start_date
 * @param {string} food_prices_dimension_key
 * @param {string} discount_start_date
 * @returns id of the deleted food item discount
 */
export const deleteFoodItemDiscount = async (food_prices_dimension_key: string, discount_start_date: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.delete(
      `/food_item_discount/${food_prices_dimension_key}/${discount_start_date}`,
      config
    );
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * deletes the corresponding investment and taxes in case of sale from the database by providing its id
 * @param id
 * @returns id of the deleted investment
 */
export const deleteInvestment = async (id: number) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.delete(`/investment/${id}`, config);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response && error.response.status === 409) {
      // custom status from backend. Foreign Key ON DELETE RESTRICT violation for dividend
      toast.warn(error.response.data.errorMsg, toastOptions);
    }
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/**
 * deletes the corresponding dividend and taxes and the bridge relationship to investments by providing its id
 * @param id
 * @returns id of the deleted dividend
 */
export const deleteDividend = async (id: number) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.delete(`/investment_dividend/${id}`, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/***
 *     _   _____________  ___ _____ _____
 *    | | | | ___ \  _  \/ _ \_   _|  ___|
 *    | | | | |_/ / | | / /_\ \| | | |__
 *    | | | |  __/| | | |  _  || | |  __|
 *    | |_| | |   | |/ /| | | || | | |___
 *     \___/\_|   |___/ \_| |_/\_/ \____/
 */

export const updateFoodItemPrice = async (id: number, updatedFoodPriceObj: FoodItemUpdateObject) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.put(`/food_item/price/${id}`, updatedFoodPriceObj, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/***
 *     _____     _        _____                            _           _    _   _       _
 *    |_   _|   | |      /  ___|                          | |         | |  | | | |     | |
 *      | | __ _| |__    \ `--.  ___ _ __   __ _ _ __ __ _| |_ ___  __| |  | | | | __ _| |_   _  ___
 *      | |/ _` | '_ \    `--. \/ _ \ '_ \ / _` | '__/ _` | __/ _ \/ _` |  | | | |/ _` | | | | |/ _ \
 *      | | (_| | |_) |  /\__/ /  __/ |_) | (_| | | | (_| | ||  __/ (_| |  \ \_/ / (_| | | |_| |  __/
 *      \_/\__,_|_.__/   \____/ \___| .__/ \__,_|_|  \__,_|\__\___|\__,_|   \___/ \__,_|_|\__,_|\___|
 *                                  | |
 *                                  |_|
 */
/** receives TSV as input from admin
 * MANDATORY HEADER STRUCTURE:
 * category, description,  monthly_interval,  billed_cost, monthly_cost,  effective_date,  expiration_date
 * @param {*} fixedCostsTsvInput
 * @returns INSERT INTO statements for manual validation and loading of db table
 * or ERROR data
 */
export const postFixedCostTsv = async (fixedCostsTsvInput: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }
    };
    const response = await axiosClient.post('/texttsv/fixed_costs', fixedCostsTsvInput, config);
    return response;
  } catch (error) {
    return error;
  }
};
/** receives TSV as input from admin
 * MANDATORY HEADER STRUCTURE:
 * description,  category,  store cost,  date,  is_planned,  contains_indulgence, sensitivities
 * @param {*} variableExpensesTsvInput
 * @returns INSERT INTO statements for manual validation and loading of db table
 * or ERROR data
 */
export const postVariableExpensesTsv = async (variableExpensesTsvInput: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }
    };
    const response = await axiosClient.post('/texttsv/variable_expenses', variableExpensesTsvInput, config);
    return response;
  } catch (error) {
    return error;
  }
};

/** receives TSV as input from admin
 * MANDATORY HEADER STRUCTURE:
 * description,	type,	monthly_interval,	value,	effective_date,	expiration_date
 * @param {*} fixedIncomeTsvInput
 * @returns INSERT INTO statements for manual validation and loading of db table
 * or ERROR data
 */
export const postFixedIncomeTsv = async (fixedIncomeTsvInput: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }
    };
    const response = await axiosClient.post('/texttsv/fixed_income', fixedIncomeTsvInput, config);
    return response;
  } catch (error) {
    return error;
  }
};

/** receives TSV as input from admin
 * MANDATORY HEADER STRUCTURE:
 * execution_type,	description,	isin,	investment_type,	marketplace,	units,	price_per_unit,	total_price,	fees,	execution_date
 * @param {*} investmentsTsvInput
 * @returns INSERT INTO statements for manual validation and loading of db table
 * or ERROR data
 */
export const postInvestmentsTsv = async (investmentsTsvInput: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }
    };
    const response = await axiosClient.post('/texttsv/investments', investmentsTsvInput, config);
    return response;
  } catch (error) {
    return error;
  }
};

/**
 * receives TSV as input from admin
 * MANDATORY HEADER STRUCTURE:
 * food_item, brand, store,  main_macro, kcal_amount, weight, price, last_update
 * @param {*} foodItemTsvInput
 * @returns INSERT INTO statements for manual validation and loading of db table
 * or ERROR data
 */
export const postAllFoodItemTsv = async (foodItemTsvInput: string) => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }
    };
    const response = await axiosClient.post('/texttsv/new_food_items', foodItemTsvInput, config);
    return response;
  } catch (error) {
    return error;
  }
};

export const postRawDataEtlInvocation = async (): Promise<any> => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
    const response = await axiosClient.post('admin/raw_data_etl', { asd: 'asd' }, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

/***
 *     _____ _____ _____ _____
 *    |_   _|  ___/  ___|_   _|
 *      | | | |__ \ `--.  | |
 *      | | |  __| `--. \ | |
 *      | | | |___/\__/ / | |
 *      \_/ \____/\____/  \_/
 */

export const getTest = async (): Promise<any> => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.get('/', config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

export const postTest = async (newObject: any): Promise<any> => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
    const response = await axiosClient.post('/', newObject, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

export const putTest = async (id: number, newObject: any): Promise<any> => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.put(`/${id}`, newObject, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};

export const deleteTest = async (id: number): Promise<any> => {
  setToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axiosClient.delete(`/${id}`, config);
    return response.data;
  } catch (_error) {
    // error handling logic is defined in src/services/axiosErrorHandler.ts
  }
};
