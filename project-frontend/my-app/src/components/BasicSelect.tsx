import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type Label = {
    label: string,
    choices: string[],
    onChange: (choice: string) => void,
    value: string,
}

export default function BasicSelect({label, choices, onChange, value}: Label) {

    const handleChange = (event: SelectChangeEvent) => {
        onChange(event.target.value as string);
    };

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">{label}</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={value}
                    label={label}
                    onChange={handleChange}
                >
                {choices.map((name, i) => (
                    <MenuItem key={i} value={name}>{name}</MenuItem>
                ))}
                </Select>
            </FormControl>
        </Box>
    );
}