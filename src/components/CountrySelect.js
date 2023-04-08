import { Autocomplete, Box, TextField } from "@mui/material";
import { countries } from "../assets/countries";

const CountrySelector = ({ handleChange }) => {
    return (
        <Autocomplete
            id="country-select-demo"
            options={countries}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => (
                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                    <img
                        id='flag'
                        loading="lazy"
                        width="20"
                        src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                        alt=""
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
                console.log(value)
                handleChange(value);
            }}
        />
    );
}

export default CountrySelector;
