import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import { Theme, Tooltip } from '@mui/material';
import { IconButton } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import ClearIcon from '@mui/icons-material/Clear';
import InputFoodItemModal from '../minor/Modal_InputFoodItem';
import { resourceProperties as res } from '../../resources/resource_properties';
import { getAllFoodPricesAndDiscounts, getFoodPricesForExport } from '../../services/pgConnections';
import { Button, Stack } from '@mui/material';
import { ColDef } from '@ag-grid-community/core';
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import { updateFoodItemPrice, deleteFoodItem } from '../../services/pgConnections';
import { toast } from 'react-toastify';
import { themeMaterial } from 'ag-grid-community';
import {
  DateCellFormatter,
  currencyFormatter,
  kcalFormatter,
  gramsFormatter,
  isNumeric,
  dateValidation,
  initializeReactDateInput,
  toastOptions
} from '../../utils/sharedFunctions';
import ConfirmationDialog from '../minor/Dialog_Confirmation';
import { RouteInfo, FoodItem, FoodItemKeys } from '../../types/custom/customTypes';
import { locales } from '../../utils/localeConfiguration';

interface Deals_OverviewProps {
  routeInfo: RouteInfo;
}

/**
 * All Food Items relevant to the user that are saved in the db are shown in an ag-grid table to be filtered, sorted, deleted and their price updated.
 * @param {Deals_OverviewProps} _props
 * @returns Interactive AG-Grid in a parent container.
 */
export default function Deals_Overview(_props: Deals_OverviewProps) {
  const { palette } = useTheme();
  const [foodPricesAndDiscounts, setFoodPricesAndDiscounts] = useState<any>(null);
  const [foodPricesRowData, setFoodPriceRowData] = useState([]);
  const [foodPricesColumnDefinitions, setFoodPriceColumnDefinitions] = useState<any>();
  // to refresh table based on added food item after DB insertion
  const [addedOrUpdatedFoodItems, setAddedOrUpdatedFoodItems] = useState<string>('');
  // to refresh table based on deleted food item after DB deletion
  const [deletedFoodItem, setDeletedFoodItem] = useState<React.SetStateAction<number>>();
  // Reference to grid API
  const foodPricesGridRif = useRef<AgGridReact>(null);
  const quickFilterText = '';

  // EXPORT TSV File of all food prices with a german formatted date of their last update
  const handleFoodPriceTsvExport = async () => {
    if (!foodPricesAndDiscounts || !Array.isArray(foodPricesAndDiscounts)) return;
    try {
      const foodPrices = await getFoodPricesForExport();
      const headers = [...FoodItemKeys];
      const rows = foodPrices?.results
        ? foodPrices.results.map((item: FoodItem) => {
            const date = new Date(item.last_update);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
            return [
              item.food_item,
              item.brand,
              item.store,
              item.main_macro,
              item.kcal_amount,
              item.weight,
              item.price,
              formattedDate
            ].join('\t');
          })
        : null;
      if (rows) {
        const tsvContent = [headers.join('\t'), ...rows].join('\n');
        const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hr = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        a.href = url;
        a.download = `food_prices_${yyyy}-${mm}-${dd}-${hr}hr${min}min.tsv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(locales().NOTIFICATIONS_DEALS_OVERVIEW_EXPORT_TSV_TOAST_SUCCESS_MSG, toastOptions);
      } else {
        toast.error(locales().NOTIFICATIONS_DEALS_OVERVIEW_EXPORT_TSV_TOAST_ERROR_MSG, toastOptions);
      }
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(`TSV export failed with ${error.name} - ${error.message}`, toastOptions);
    }
  };

  useEffect(() => {
    const getAllPricesAndDiscounts = async () => {
      const allFoodPricesAndDiscounts = await getAllFoodPricesAndDiscounts();
      setFoodPricesAndDiscounts(allFoodPricesAndDiscounts.results);
      setFoodPriceRowData(allFoodPricesAndDiscounts.results);
    };
    getAllPricesAndDiscounts();
  }, [addedOrUpdatedFoodItems, deletedFoodItem]);

  interface DeleteRowBtnProps {
    data: any;
    refreshParent: React.Dispatch<React.SetStateAction<number>>;
  }
  const DeleteRowBtn = (props: DeleteRowBtnProps) => {
    const { data, refreshParent } = props;
    const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

    const deleteRow = async () => {
      const response = await deleteFoodItem(data.id);
      if ((response?.results[0]?.id && response.results[0].id) === data.id) {
        toast.success(locales().NOTIFICATIONS_FOOD_ITEM_DELETED_SUCCESSFULLY(data.id), toastOptions);
        // to refresh parent's table based on returned id after successful DELETE request
        refreshParent(response.results[0].id);
      } else {
        toast.error(locales().NOTIFICATIONS_FOOD_ITEM_DELETED_ERROR, toastOptions);
      }
    };
    return (
      <React.Fragment>
        <Tooltip placement="left" title={locales().GENERAL_DELETE_ROW_TOOLTIP}>
          <IconButton
            color="error"
            sx={{ paddingY: 0.2, paddingX: 1, marginRight: 0, marginY: 0, marginLeft: 0.5, align: 'right' }}
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>
        <ConfirmationDialog
          title={locales().CONFIRMATION_DIALOG_TITLE_DELETE}
          text={data.food_item + ' - ' + data.store}
          textColor="secondary"
          confirmBtnText={locales().GENERAL_DELETE}
          open={confirmDeleteOpen}
          setOpen={setConfirmDeleteOpen}
          handleConfirm={deleteRow}
        />
      </React.Fragment>
    );
  };

  interface UpdatePriceBtnProps {
    id: number;
    refreshParent: React.Dispatch<React.SetStateAction<string>>;
  }
  /**
   * WARNING: Extraction into individual REACT COMPONENT has failed. Perhaps because of AG-Grid cellRenderer implementation.
   * Custom Cell Renderer for AG-GRID displaying a button with Modal Input to update food price information in the db
   * @param {UpdatePriceBtnProps} props
   * @returns
   */
  const UpdatePriceBtn = (props: UpdatePriceBtnProps) => {
    const { palette } = useTheme();
    const [priceUpdateOpen, setPriceUpdateOpen] = useState(false);
    const [isLastUpdateValidationError, setIsLastUpdateValidationError] = React.useState(false);
    const [lastUpdateDateErrorMessage, setLastUpdateDateErrorMessage] = React.useState('');
    const [isPriceValidationError, setIsPriceValidationError] = React.useState(false);
    const [priceValidationErrorMessage, setPriceValidationErrorMessage] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [lastUpdateDate, setLastUpdateDate] = React.useState(initializeReactDateInput(new Date()));
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

    const inputChangeListener = (e: React.ChangeEvent<HTMLInputElement>): void => {
      e.preventDefault();
      switch (e.target.id) {
        case 'price':
          setPrice(e.target.value.replace(',', '.'));
          break;
        case 'last_update':
          setLastUpdateDate(e.target.value);
          break;
      }
    };

    const validateInput = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      let errorPresent = false;
      // Price Validation
      if (!isNumeric(price)) {
        errorPresent = true;
        setIsPriceValidationError(true);
        setPriceValidationErrorMessage(locales().MINOR_INPUT_FOOD_ITEM_MODAL_PRICE_VALIDATION_ERROR_MSG);
      } else {
        setIsPriceValidationError(false);
        setPriceValidationErrorMessage('');
      }
      // Generic Date Validation
      if (!dateValidation(lastUpdateDate).isValid) {
        errorPresent = true;
        setIsLastUpdateValidationError(true);
        setLastUpdateDateErrorMessage(locales().MINOR_INPUT_FOOD_ITEM_MODAL_GENERIC_DATE_VALIDATION_ERROR_MSG);
      } else {
        setIsLastUpdateValidationError(false);
        setLastUpdateDateErrorMessage('');
      }
      if (errorPresent) {
        // Errors present => return
        return;
      } else {
        // Errors missing => save to db
        saveUserInput();
      }
    };

    const saveUserInput = async () => {
      const foodItemUpdateObject = {
        price: parseFloat(Number(price).toFixed(2)),
        lastUpdate: new Date(lastUpdateDate)
      };
      const response = await updateFoodItemPrice(props.id, foodItemUpdateObject);
      if (response?.results[0]?.id && response.results[0].id === props.id) {
        toast.success(locales().NOTIFICATIONS_FOOD_ITEM_PRICE_UPDATED_SUCCESSFULLY, toastOptions);
        // this setter is called to force the frontend to update and refetch the data from db
        setPriceUpdateOpen(false);
        // to refresh parent's table based on updated food item after successfull PUT request
        // concatenating id to price guarantees that refresh is only triggered if price changes compared to a prior update
        props.refreshParent(String(response.results[0].id).concat(String(response?.results[0]?.price)));
      } else {
        toast.error(locales().NOTIFICATIONS_FOOD_ITEM_PRICE_UPDATED_ERROR, toastOptions);
      }
    };

    return (
      <React.Fragment>
        <Tooltip placement="left" title={locales().DEALS_OVERVIEW_UPDATE_FOOD_PRICE}>
          <IconButton
            color="secondary"
            sx={{ paddingY: 0.2, paddingX: 1, marginRight: 0, marginY: 0, marginLeft: 0.5, align: 'right' }}
            onClick={() => setPriceUpdateOpen(true)}
          >
            <SyncIcon />
          </IconButton>
        </Tooltip>
        <Modal open={priceUpdateOpen} onClose={() => setPriceUpdateOpen(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              border: `2px solid ${palette.mode === 'light' ? palette.border.light : palette.border.dark}`,
              padding: 4,
              width: isSmallScreen ? '80%' : '25%',
              boxShadow: 24
            }}
          >
            {/* PREIS */}
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="price">{locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_INPUT_PRICE}</InputLabel>
              <Input
                id="price"
                value={price}
                onChange={inputChangeListener}
                type="text"
                error={isPriceValidationError}
                startAdornment={<InputAdornment position="start">{res.CURRENCY_EURO}</InputAdornment>}
              />
              <FormHelperText sx={{ color: palette.error.main }}>{priceValidationErrorMessage}</FormHelperText>
            </FormControl>
            {/* UPDATE DATUM */}
            <FormControl fullWidth sx={{ marginX: 1, mt: 2 }} variant="standard">
              <InputLabel shrink={true} htmlFor="last_update">
                {locales().MINOR_INPUT_FOOD_ITEM_MODAL_INPUT_LAST_UPDATE}
              </InputLabel>
              <Input
                id="last_update"
                value={lastUpdateDate}
                type="date"
                error={isLastUpdateValidationError}
                onChange={inputChangeListener}
              />
              <FormHelperText sx={{ color: palette.error.main }}>{lastUpdateDateErrorMessage}</FormHelperText>
            </FormControl>
            {/* SPEICHERN */}
            <Button
              onClick={validateInput}
              sx={{
                borderRadius: 0,
                margin: '0 auto',
                ml: 1,
                mt: 1.5,
                border: `1px solid ${palette.border.dark}`,
                width: '100%',
                boxShadow: '3px 3px 5px 2px rgba(64,64,64, 0.7)'
              }}
              variant="contained"
              endIcon={<FileDownloadDoneIcon />}
            >
              {locales().GENERAL_SAVE}
            </Button>
          </Box>
        </Modal>
      </React.Fragment>
    );
  };
  /**
   * Resets the Grid to the initial state after page load.
   */
  const resetAgGridToInitialState = useCallback((gridRef: any) => {
    gridRef.current.api.setFilterModel(null); // Reset Filters
    gridRef.current.api.resetColumnState(); // Reset Sorting
  }, []);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      filter: true,
      floatingFilter: true,
      flex: 1,
      resizable: false,
      minWidth: 90,
      wrapText: false,
      autoHeight: false
    }),
    []
  );

  // AFTER foodPricesAndDiscounts have been filled on page load
  useEffect(() => {
    setFoodPriceColumnDefinitions([
      {
        field: 'id',
        headerName: '',
        cellRenderer: (p: any) => <UpdatePriceBtn id={p.data.id} refreshParent={setAddedOrUpdatedFoodItems} />,
        minWidth: 60,
        flex: 0.4,
        filter: false,
        floatingFilter: false,
        sortable: false
      },
      { field: 'food_item', headerName: locales().DEALS_OVERVIEW_THEADER_FOODITEM, minWidth: 200, flex: 1.5 },
      { field: 'brand', headerName: locales().DEALS_OVERVIEW_THEADER_BRAND },
      { field: 'store', headerName: locales().DEALS_OVERVIEW_THEADER_STORE },
      { field: 'main_macro', headerName: locales().DEALS_OVERVIEW_THEADER_MAIN_MACRO },
      {
        field: 'kcal_amount',
        headerName: locales().DEALS_OVERVIEW_THEADER_KCAL_AMT_TOP,
        valueFormatter: kcalFormatter,
        filter: false,
        floatingFilter: false
      },
      {
        field: 'weight',
        headerName: locales().DEALS_OVERVIEW_THEADER_WEIGHT_TOP,
        valueFormatter: gramsFormatter,
        filter: false,
        floatingFilter: false
      },
      {
        field: 'price',
        headerName: locales().DEALS_OVERVIEW_THEADER_PRICE_TOP,
        valueFormatter: currencyFormatter,
        filter: false,
        floatingFilter: false
      },
      {
        field: 'last_update',
        headerName: locales().DEALS_OVERVIEW_THEADER_LAST_UPDATE_TOP,
        cellRenderer: DateCellFormatter,
        minWidth: 160
      },
      {
        field: 'normalized_price',
        headerName: locales().DEALS_OVERVIEW_THEADER_NORMALIZED_PRICE_TOP,
        valueFormatter: currencyFormatter,
        filter: false,
        floatingFilter: false
      },
      {
        headerName: '',
        cellRenderer: (p: any) => <DeleteRowBtn data={p.data} refreshParent={setDeletedFoodItem} />,
        filter: false,
        floatingFilter: false,
        minWidth: 60,
        flex: 0.4
      }
    ]);
  }, [foodPricesAndDiscounts]);

  return (
    <>
      <Stack>
        <InputFoodItemModal refreshParent={setAddedOrUpdatedFoodItems} />
      </Stack>
      <div
        style={{ position: 'relative' }}
        data-ag-theme-mode={palette.mode} // applying light or dark mode
      >
        <Button
          sx={{
            display: 'block',
            borderRadius: 0.5,
            position: 'absolute',
            backgroundColor: palette.error.light,
            zIndex: 10,
            top: 8,
            left: 5,
            px: 1,
            '&:hover': {
              bgcolor: palette.primary.dark,
              color: 'rgba(248,204,116,0.9)'
            }
          }}
          variant="contained"
          onClick={() => resetAgGridToInitialState(foodPricesGridRif)}
        >
          {res.RESET}
        </Button>
        {foodPricesAndDiscounts ? (
          <AgGridReact
            theme={themeMaterial} // themeMaterial, themeQuartz, themeAlpine, themeBalham
            ref={foodPricesGridRif}
            rowData={foodPricesRowData}
            columnDefs={foodPricesColumnDefinitions}
            defaultColDef={defaultColDef as any}
            quickFilterText={quickFilterText}
            domLayout="autoHeight"
            pagination={true}
            paginationPageSize={50}
            paginationPageSizeSelector={[50, 75, 100]}
          />
        ) : null}
      </div>
      <Button
        sx={{
          width: 1,
          borderRadius: 0,
          fontFamily: 'Hack',
          fontSize: '16px',
          letterSpacing: 3,
          textTransform: 'uppercase',
          fontWeight: 'bold',
          mb: 1
        }}
        variant="contained"
        size="small"
        color="info"
        onClick={() => handleFoodPriceTsvExport()}
      >
        {locales().DEALS_OVERVIEW_EXPORT_TSV_BTN}
      </Button>
    </>
  );
}
