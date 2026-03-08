import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Modal from '@mui/material/Modal';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import LocalCafeTwoToneIcon from '@mui/icons-material/LocalCafeTwoTone';
import LiquorTwoToneIcon from '@mui/icons-material/LiquorTwoTone';
import TodayTwoToneIcon from '@mui/icons-material/TodayTwoTone';
import EggAltTwoToneIcon from '@mui/icons-material/EggAltTwoTone';
import BakeryDiningTwoToneIcon from '@mui/icons-material/BakeryDiningTwoTone';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import EuroSymbolIcon from '@mui/icons-material/EuroSymbol';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import { resourceProperties as res } from '../../resources/resource_properties';
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  IconButton,
  Palette,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { isNumeric, dateValidation, initializeReactDateInput, stringAlphabeticOnly } from '../../utils/sharedFunctions';
import { locales } from '../../utils/localeConfiguration';

type VariableExpensePreset = {
  id: string;
  color: string;
  tooltip: string;
  icon: JSX.Element;
};

/**
 * Contains different variations of common purchases to initialize the dialog modal and reduce manual typing effort.
 * Preset data is based on frequency of past purchases and are manually added.
 * @param palette
 * @returns
 */
function initializePresetData(palette: Palette): VariableExpensePreset[] {
  return [
    {
      id: res.MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_TODAY,
      color: palette.tertiary.main,
      tooltip: locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_TOOLTIP_TODAY,
      icon: <TodayTwoToneIcon fontSize="large" />
    },
    {
      id: res.MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_COFFEE,
      color: palette.error.light,
      tooltip: locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_TOOLTIP_COFFEE,
      icon: <LocalCafeTwoToneIcon fontSize="large" />
    },
    {
      id: res.MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_COLA,
      color: palette.error.light,
      tooltip: locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_TOOLTIP_COLA,
      icon: <LiquorTwoToneIcon fontSize="large" />
    },
    {
      id: res.MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_CHOCO_CROISSANT,
      color: palette.secondary.main,
      tooltip: locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_TOOLTIP_CHOCO_CROISSANT,
      icon: <BakeryDiningTwoToneIcon fontSize="large" />
    },
    {
      id: res.MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_BREAKFAST,
      color: palette.secondary.main,
      tooltip: locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_TOOLTIP_BREAKFAST,
      icon: <EggAltTwoToneIcon fontSize="large" />
    }
  ];
}
interface InputVariableExpenseModalProps {
  setAddedItemId: React.Dispatch<React.SetStateAction<number | undefined>>;
  storeAutoCompleteItemArray: string[];
  categoryAutoCompleteItemArray: string[];
  indulgencesAutoCompleteItemArray: string[];
}
/**
 * Dialog Modal to insert a new variable expense, typically initialized with common presets.
 * @param {InputVariableExpenseModalProps} props
 * @returns
 */
export default function InputVariableExpenseModal(props: InputVariableExpenseModalProps) {
  const { palette }: { palette: Palette } = useTheme();
  const {
    // setAddedItemId,
    storeAutoCompleteItemArray,
    categoryAutoCompleteItemArray,
    indulgencesAutoCompleteItemArray
  } = props;
  const [open, setOpen] = React.useState(false);
  // Validation
  const [isIndulgencesValidationError, setIsIndulgencesValidationError] = React.useState(false);
  const [indulgencesValidationErrorMessage, setIndulgencesValidationErrorMessage] = React.useState('');
  const [isDateValidationError, setIsDateValidationError] = React.useState(false);
  const [dateValidationErrorMessage, setDateValidationErrorMessage] = React.useState('');
  const [isPriceValidationError, setIsPriceValidationError] = React.useState(false);
  const [priceValidationErrorMessage, setPriceValidationErrorMessage] = React.useState('');
  const [isDescriptionValidationError, setIsDescriptionValidationError] = React.useState(false);
  const [descriptionValidationErrorMessage, setDescriptionValidationErrorMessage] = React.useState('');
  const [isStoreAutoCompleteValidationError, setIsStoreAutoCompleteValidationError] = React.useState(false);
  const [storeAutoCompleteValidationErrorMessage, setStoreAutoCompleteValidationErrorMessage] = React.useState('');
  const [isCategoryAutoCompleteValidationError, setIsCategoryAutoCompleteValidationError] = React.useState(false);
  const [categoryAutoCompleteValidationErrorMessage, setCategoryAutoCompleteValidationErrorMessage] =
    React.useState('');

  // Inputs
  const [isPlanned, setIsPlanned] = React.useState(false);
  const [containsIndulgence, setContainsIndulgence] = React.useState(false);
  const [purchasingDate, setPurchaseDate] = React.useState(initializeReactDateInput(new Date()));
  const [price, setPrice] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Selection
  const [storeAutoComplete, setStoreAutoComplete] = React.useState<string>('');
  const [categoryAutoComplete, setCategoryAutoComplete] = React.useState<string>('');
  const [indulgencesAutoCompleteArray, setIndulgencesAutoCompleteArray] = React.useState<string[]>();
  const [sensitivitiesString, setSensitivitiesString] = React.useState<string>('');

  // Presets
  const [presetDataArray, setPresetDataArray] = React.useState<VariableExpensePreset[]>();
  React.useEffect(() => {
    setPresetDataArray(initializePresetData(palette));
  }, []);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'background.paper',
    border: `2px solid ${palette.primary.main}`,
    boxShadow: 24,
    p: 4
  };

  /**
   * queries DB for food item insertion via REST API
   */
  const saveUserInput = async () => {
    // const variableExpObj = {
    //   description: description.trim(),
    //   category: categoryAutoComplete,
    //   store: storeAutoComplete,
    //   cost: Number(price).toFixed(2),
    //   purchasing_date: new Date(purchasingDate),
    //   is_planned: isPlanned,
    //   contains_indulgence: containsIndulgence,
    //   sensitivities: sensitivitiesString
    // };
    // const response = await postNewFoodItem(variableExpObj); //TODO
    // if (response?.results[0]?.dimension_key) {
    //   // this setter is called to force the frontend to update and refetch the data from db
    //   console.log('SUCCESSFULLY added food item to DB:'); // TODO mit Growl und ID ersetzen
    //   console.log(response.results[0]);
    //   setOpen(false);
    //   // to refresh parent's table based on added food item after DB insertion
    //   setAddedItemId(response.results[0].id);
    // } else {
    //   // TODO User Notification
    //   console.error(response);
    // }
  };

  const validateInput = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let errorPresent = false;
    // TODO category autocomplete
    if (
      !categoryAutoComplete ||
      categoryAutoComplete == '' ||
      categoryAutoComplete?.length < 3 ||
      !stringAlphabeticOnly(categoryAutoComplete)
    ) {
      errorPresent = true;
      setIsCategoryAutoCompleteValidationError(true);
      setCategoryAutoCompleteValidationErrorMessage(
        locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_CATEGORY_AUTOCOMPLETE_VALIDATION_ERROR_MSG
      );
    } else {
      setIsCategoryAutoCompleteValidationError(false);
      setCategoryAutoCompleteValidationErrorMessage('');
    }
    // TODO store autocomplete
    if (!storeAutoComplete || storeAutoComplete == '' || storeAutoComplete?.length < 3) {
      errorPresent = true;
      setIsStoreAutoCompleteValidationError(true);
      setStoreAutoCompleteValidationErrorMessage(
        locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_STORE_AUTOCOMPLETE_VALIDATION_ERROR_MSG
      );
    } else {
      setIsStoreAutoCompleteValidationError(false);
      setStoreAutoCompleteValidationErrorMessage('');
    }
    // TODO variable expense description validation
    if (!description || description == '' || description?.length < 5) {
      errorPresent = true;
      setIsDescriptionValidationError(true);
      setDescriptionValidationErrorMessage(
        locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_DESCRIPTION_VALIDATION_ERROR_MSG
      );
    } else {
      setIsDescriptionValidationError(false);
      setDescriptionValidationErrorMessage('');
    }
    // TODO Indulgences
    if (containsIndulgence && (!sensitivitiesString || sensitivitiesString == '' || sensitivitiesString?.length < 4)) {
      errorPresent = true;
      setIsIndulgencesValidationError(true);
      setIndulgencesValidationErrorMessage(
        locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_INDULGENCE_VALIDATION_ERROR_MSG
      );
    } else {
      setIsIndulgencesValidationError(false);
      setIndulgencesValidationErrorMessage('');
    }
    // Price Validation
    if (!isNumeric(price)) {
      errorPresent = true;
      setIsPriceValidationError(true);
      setPriceValidationErrorMessage(locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRICE_VALIDATION_ERROR_MSG);
    } else {
      setIsPriceValidationError(false);
      setPriceValidationErrorMessage('');
    }
    // Generic Date Validation
    if (!dateValidation(purchasingDate).isValid) {
      errorPresent = true;
      setIsDateValidationError(true);
      setDateValidationErrorMessage(locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_GENERIC_DATE_VALIDATION_ERROR_MSG);
    } else {
      setIsDateValidationError(false);
      setDateValidationErrorMessage('');
    }
    if (errorPresent) {
      // Errors present => return
      return;
    } else {
      // Errors missing => save to db
      saveUserInput();
    }
  };

  const inputChangeListener = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    switch (e.target.id) {
      case 'description':
        setDescription(e.target.value);
        break;
      case 'price':
        setPrice(e.target.value.replace(',', '.'));
        break;
      case 'purchase_date':
        setPurchaseDate(e.target.value);
        break;
    }
  };

  const handleStoreInputChange = (_event: unknown, newValue: string) => {
    if (newValue && !storeAutoCompleteItemArray.includes(newValue)) {
      setStoreAutoComplete(newValue.trim());
    } else {
      setStoreAutoComplete(newValue);
    }
  };

  const handleCategoryAutoCompleteSelection = (_event: unknown, value: string | null) => {
    if (value && !categoryAutoCompleteItemArray.includes(value)) {
      // new Category to be added to db
      setCategoryAutoComplete(value.trim());
    } else if (value && categoryAutoCompleteItemArray.includes(value)) {
      setCategoryAutoComplete(value);
    } else {
      setCategoryAutoComplete('');
    }
  };

  const handleIndulgenceAutoCompleteSelection = (_event: unknown, newValue: string[]) => {
    setIndulgencesAutoCompleteArray(newValue);
    setSensitivitiesString(newValue.join(', '));
  };

  /**
   * WARNING: event.currentTarget always contains the element that has onClick Listener attached
   * whereas event.target can contain children elements that have been clicked
   * @param {} event
   */
  const handleModalValuePresets = (event: React.MouseEvent<HTMLButtonElement>) => {
    let indulgences;
    switch (event.currentTarget.id) {
      case res.MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_TODAY:
        setPurchaseDate(initializeReactDateInput(new Date()));
        break;
      case res.MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_COFFEE:
        setDescription('Kaffee mit Hafermilch');
        setCategoryAutoComplete(locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_LEISURE);
        setStoreAutoComplete('Cafè');
        setPrice('');
        setPurchaseDate(initializeReactDateInput(new Date()));
        setIsPlanned(false);
        setContainsIndulgence(true);
        indulgences = [];
        indulgences.push(res.INDULGENCES_KEY_CAFFEINE);
        setIndulgencesAutoCompleteArray(indulgences);
        setSensitivitiesString(indulgences.join(', '));
        break;
      case res.MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_COLA:
        setDescription('Cola Zero');
        setCategoryAutoComplete(locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_LEISURE);
        setStoreAutoComplete('Kiosk');
        setPrice('2');
        setPurchaseDate(initializeReactDateInput(new Date()));
        setIsPlanned(false);
        setContainsIndulgence(true);
        indulgences = [];
        indulgences.push(res.INDULGENCES_KEY_CAFFEINE);
        indulgences.push(res.INDULGENCES_KEY_ASPARTAME_SACCHARIN);
        setIndulgencesAutoCompleteArray(indulgences);
        setSensitivitiesString(indulgences.join(', '));
        break;
      case res.MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_CHOCO_CROISSANT:
        setDescription('Schokobrötchen');
        setCategoryAutoComplete('Gift');
        setStoreAutoComplete('Bäcker');
        setPrice('1.5');
        setPurchaseDate(initializeReactDateInput(new Date()));
        setIsPlanned(true);
        setContainsIndulgence(false);
        setIndulgencesAutoCompleteArray([]);
        setSensitivitiesString('');
        break;
      case res.MINOR_INPUT_VARIABLE_EXPENSE_MODAL_PRESET_ID_BREAKFAST:
        setDescription('Bio Eier, Eismeergarnelen TK');
        setCategoryAutoComplete(locales().VARIABLE_EXPENSES_OVERVIEW_CATEGORY_GROCERIES);
        setStoreAutoComplete('Netto');
        setPrice('');
        setPurchaseDate(initializeReactDateInput(new Date()));
        setIsPlanned(true);
        setContainsIndulgence(false);
        setIndulgencesAutoCompleteArray([]);
        setSensitivitiesString('');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        fullWidth
        color="secondary"
        sx={{
          borderRadius: 0,
          border: `1px solid  ${palette.border.dark}`,
          boxShadow: palette.mode === 'light' ? `3px 3px 8px 2px ${palette.grey[700]}` : '',
          mb: 0.8,
          paddingY: 2
        }}
        startIcon={<AddCircleIcon />}
      >
        {locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_OPEN}
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Stack direction="row" spacing={1}>
            {presetDataArray
              ? presetDataArray.map((e) => (
                  <Tooltip key={e.id} title={e.tooltip} placement="top">
                    <IconButton id={e.id} sx={{ color: e.color }} onClick={handleModalValuePresets}>
                      {e.icon}
                    </IconButton>
                  </Tooltip>
                ))
              : null}
          </Stack>
          {/* EXPENSE ITEM DESCRIPTION */}
          <FormControl fullWidth sx={{ m: 1 }} variant="standard">
            <InputLabel sx={{ letterSpacing: 2, fontWeight: 300, fontSize: 16 }} htmlFor="description">
              {locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_DESCRIPTION}
            </InputLabel>
            <Input
              id="description"
              value={description}
              onChange={inputChangeListener}
              type="text"
              error={isDescriptionValidationError}
            />
            <FormHelperText sx={{ color: palette.error.main }}>{descriptionValidationErrorMessage}</FormHelperText>
          </FormControl>
          {/*  AUTOCOMPLETE DROPDOWN FOR EXPENSE CATEGORY */}
          {categoryAutoCompleteItemArray ? (
            <Stack sx={{ mt: 3.5 }}>
              <Autocomplete
                disablePortal
                selectOnFocus
                freeSolo
                onInputChange={handleCategoryAutoCompleteSelection}
                inputValue={categoryAutoComplete}
                options={categoryAutoCompleteItemArray}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_CATEGORY}
                    sx={{ borderRadius: 0 }}
                  />
                )}
                sx={{ ml: 0.8, width: '100%' }}
              />
              <Typography
                sx={{
                  color: palette.error.main,
                  fontSize: 12,
                  ml: 1,
                  mt: 0.5,
                  display: isCategoryAutoCompleteValidationError ? 'inline' : 'none'
                }}
              >
                {categoryAutoCompleteValidationErrorMessage}
              </Typography>
            </Stack>
          ) : null}
          {/* AUTOCOMPLETE DROPDOWN FOR STORES */}
          {storeAutoCompleteItemArray ? (
            <Stack sx={{ mt: 2.5 }}>
              <Autocomplete
                freeSolo
                selectOnFocus
                onInputChange={handleStoreInputChange}
                inputValue={storeAutoComplete}
                options={storeAutoCompleteItemArray}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_STORE}
                    sx={{ borderRadius: 0 }}
                  />
                )}
                sx={{ ml: 0.8, width: '100%' }}
              />
              <Typography
                sx={{
                  color: palette.error.main,
                  fontSize: 12,
                  ml: 1,
                  mt: 0.5,
                  display: isStoreAutoCompleteValidationError ? 'inline' : 'none'
                }}
              >
                {storeAutoCompleteValidationErrorMessage}
              </Typography>
            </Stack>
          ) : null}
          {/* PRICE */}
          <FormControl fullWidth sx={{ m: 1, mt: 2.5 }} variant="standard">
            <InputLabel htmlFor="price">{locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_INPUT_PRICE}</InputLabel>
            <Input
              id="price"
              value={price}
              onChange={inputChangeListener}
              type="text"
              error={isPriceValidationError}
              startAdornment={
                <InputAdornment position="start">
                  <EuroSymbolIcon />
                </InputAdornment>
              }
            />
            <FormHelperText sx={{ color: palette.error.main }}>{priceValidationErrorMessage}</FormHelperText>
          </FormControl>
          {/* DATE OF VARIABLE EXPENSE */}
          <FormControl fullWidth sx={{ marginX: 1, mt: 2 }} variant="standard">
            <InputLabel shrink={true} htmlFor="purchase_date">
              {locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_INPUT_DATE_OF_PURCHASE}
            </InputLabel>
            <Input
              id="purchase_date"
              value={purchasingDate}
              type="date"
              error={isDateValidationError}
              onChange={inputChangeListener}
            />
            <FormHelperText sx={{ color: palette.error.main }}>{dateValidationErrorMessage}</FormHelperText>
          </FormControl>
          {/* IS_PLANNED FLAG*/}
          <FormControl fullWidth sx={{ marginX: 1, mt: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={isPlanned} onChange={() => setIsPlanned(!isPlanned)} />}
              label={
                <Typography
                  sx={{
                    letterSpacing: 2,
                    fontWeight: 300,
                    fontSize: 14
                  }}
                >
                  {locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_IS_PLANNED_LABEL}
                </Typography>
              }
            />
          </FormControl>
          {/* CONTAINS_INDULGENCE FLAG*/}
          <FormControl fullWidth sx={{ marginX: 1, mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox checked={containsIndulgence} onChange={() => setContainsIndulgence(!containsIndulgence)} />
              }
              label={
                <Typography
                  sx={{
                    letterSpacing: 2,
                    fontWeight: 300,
                    fontSize: 14
                  }}
                >
                  {locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_CONTAINS_INDULGENCE_LABEL}
                </Typography>
              }
            />
          </FormControl>
          {/* INDULGENCES */}
          {indulgencesAutoCompleteItemArray && containsIndulgence ? (
            <Stack sx={{ mt: 1.5 }}>
              <Autocomplete
                multiple
                filterSelectedOptions
                value={indulgencesAutoCompleteArray}
                onChange={handleIndulgenceAutoCompleteSelection}
                options={indulgencesAutoCompleteItemArray}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={locales().MINOR_INPUT_VARIABLE_EXPENSE_MODAL_INPUT_INDULGENCE}
                    sx={{ borderRadius: 0 }}
                  />
                )}
                sx={{ ml: 0.8, width: '100%' }}
              />
              <Typography
                sx={{
                  color: palette.error.main,
                  fontSize: 12,
                  ml: 1,
                  mt: 0.5,
                  display: isIndulgencesValidationError ? 'inline' : 'none'
                }}
              >
                {indulgencesValidationErrorMessage}
              </Typography>
            </Stack>
          ) : null}
          {/* MODAL SAVE BUTTON */}
          <Button
            onClick={validateInput}
            sx={{
              borderRadius: 0,
              margin: '0 auto',
              mt: 2,
              ml: 1,
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
    </>
  );
}
