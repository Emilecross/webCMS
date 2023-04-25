import { Box, Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { gridBoxGen, httpFunc, typogItemGen } from "../functions";
import {getToken} from '../index';

type usernameFormValues = {
    username: string;
}

const initialUsernameValues: usernameFormValues = {
    username: ""
};

type requestOptions = {
    method: string;
    headers: {
        'Content-Type': string;
    };
    body: string;
};

async function postNewUsernameData (username: string) {
    const putData = JSON.stringify({token: getToken(), username: username});
    const requestOptions: requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: putData
    };

    const url ='http://localhost:6969/user/update_username';

    return await httpFunc(url, requestOptions);
}

export default function UsernameUpdateGrid(navigate: NavigateFunction) {
    const varToString = (varObj: {}) => Object.keys(varObj);
    const [values, setValues] = useState(initialUsernameValues);
    const [errors, setErrors] = useState({} as any);

    const validateInputValues: any = (formValues = values) => {
        const errMsg = "This field is required.";
        let currData: any = { ...errors }

        const formValueKeys = varToString(values);
        formValueKeys.forEach((key) => {
            type objKey = keyof typeof currData;
            type objKey2 = keyof typeof formValues;
            const myVar = key as objKey;
            const myVar2 = key as objKey2;

            if (key in formValues) {
                let boolVal = formValues[myVar2] ? true : false;
                if (key in formValues) currData[myVar] = boolVal ? "" : errMsg;
            }
        })
        setErrors({...currData});
    }

    const usernameInputValueHandler: any = (object: any) => {
        let { name, value} = object.target;
        setValues({...values,[name]: value});
        validateInputValues({ [name]: value });
    }

    const usernameIsValid: any = (formValues = values) => {
        // TO DO: Username constraints on FE

        // const isValid =
        // formValues.username &&
        // Object.values(errors).every((x) => x === "");
        return true;
    }

    const formSubmissionHandler = async (submission: any) => {
        submission.preventDefault();
        if (usernameIsValid()) {
            const reqResponse = await postNewUsernameData(values.username);
            console.log(reqResponse);
            if (reqResponse !== '/error') navigate('/update_profile');
        }
    }

    const usernameInputFieldValues = [
        {
            autoComplete:"username",
            name:"username",
            id:"username",
            label:"New Username",
            type:"",
            required:true,
            fullWidth:true,
            autoFocus:false
        }
    ];

    return (
        <>
        <Box component="form" noValidate onSubmit={formSubmissionHandler} sx={{maxWidth:'50%',margin:'auto'}}>
            <Grid container spacing={2}>
            {gridBoxGen(12,typogItemGen("h5","Update your Username"))}
            {gridBoxGen(12,"")}
            {usernameInputFieldValues.map((usernameInputFieldValue, index) => {
                return (
                    gridBoxGen(12,<TextField
                        key={index}
                        autoComplete={usernameInputFieldValue.autoComplete}
                        name={usernameInputFieldValue.name}
                        id={usernameInputFieldValue.id}
                        label={usernameInputFieldValue.label}
                        type={usernameInputFieldValue.type}
                        required={usernameInputFieldValue.required}
                        fullWidth={usernameInputFieldValue.fullWidth}
                        autoFocus={usernameInputFieldValue.autoFocus}
                        onBlur={usernameInputValueHandler}
                        onChange={usernameInputValueHandler}
                        {...(errors[usernameInputFieldValue.name] && { error: true, helperText: errors[usernameInputFieldValue.name] })}
                    />)
                )
            })}
            {gridBoxGen(12,<Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 , maxWidth: "51%"}}>
                Change Username
            </Button>)}
            {gridBoxGen(12,<></>)}
            </Grid>
        </Box>
        </>
    )
}