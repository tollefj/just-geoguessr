import { Autocomplete, Box, TextField } from "@mui/material";
import { countries } from "../assets/countries";


const CountrySelector = ({ handleChange, value }) => {
    return (
        <Autocomplete
            id="country-select-demo"
            options={countries}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option ? option.label : ''}
            // value when is null
            defaultValue={countries[0]}
            isOptionEqualToValue={
                (option, value) => option && option.code === value.code}
            renderOption={(props, option) => (
                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                    <img
                        id='flag'
                        loading="lazy"
                        width="20"
                        src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                        alt={option.label}
                    />
                    {option.label} ({option.code}) +{option.phone}
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Choose a country"
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // disable autocomplete and autofill
                    }}
                />
            )}
            onChange={(event, value) => {
                handleChange(value);
            }}
        />
    );
}

export default CountrySelector;
