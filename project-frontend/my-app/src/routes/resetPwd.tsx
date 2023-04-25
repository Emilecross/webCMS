import { Box, Button, Grid, IconButton, Snackbar, TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gridBoxGen, httpFunc, httpFuncError, typogItemGen } from "../functions";
import './main.css';
import React from "react";
import CloseIcon from '@mui/icons-material/Close';

export default function ResetPwd () {
    return (
        <>
        <Box className="divBuffer">
            <Box className="mainBoxWidth">
                <InputGrid />
            </Box>
        </Box>
        </>
    )
}

const initialValues = {
    password:"",
    formSubmitted: false,
    success: false
}

const useFormControls = () => {
    const navigate = useNavigate();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const getResetCode = urlParams.has('code') ? urlParams.get('code')! : "";
    const varToString = (varObj: {}) => Object.keys(varObj);
    const [values, setValues] = useState(initialValues);
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
                let boolVal = formValues[myVar2];
                if (key in formValues) currData[myVar] = boolVal ? "" : errMsg;
            }
        })
        setErrors({...currData});
    }
    const inputValueHandler: any = (object: any) => {
        let { name, value } = object.target;
        setValues({...values,[name]: value});
        validateInputValues({ [name]: value });
    }
    const formSubmissionHandler = async (submission: any) => {
        submission.preventDefault();
        if (formIsValid()) {
            const regResponse = await postResetPasswordData(getResetCode,values.password);
            const respCode = Math.floor(regResponse.code/100);
            if (respCode === 4 || respCode === 5) {
                return "Error: " + regResponse.message.replace('<p>','').replace('</p>','');
            } else {
                navigate('/success?type=reset_successful');
            }
        }
    }
    const formIsValid: any = (formValues = values) => {
        const isValid = formValues.password && Object.values(errors).every((x) => x === "");
        return isValid;
    }
    return {
        handleInputValue: inputValueHandler,
        handleFormSubmit: formSubmissionHandler,
        formIsValid,
        errors
    };
}

type requestOptions = {
    method: string;
    headers: {
        'Content-Type': string;
    };
    body: string;
};

async function postResetPasswordData (code: string, password: string) {
    const getToken = code;
    const postData = JSON.stringify({code: getToken, new_password: password});
    const requestOptions: requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: postData
    };

    const url ='http://localhost:6969/auth/reset_password';

    return httpFuncError(url, requestOptions);
}

function InputGrid () {
    const {
        handleInputValue,
        handleFormSubmit,
        formIsValid,
        errors
      } = useFormControls();

    const inputFieldValues = [
        {
            autoComplete:"password",
            name:"password",
            id:"password",
            label:"New Password",
            type:"password",
            required:true,
            fullWidth:true,
            autoFocus:true
        }
    ]

    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMsg, setSnackbarMsg] = React.useState("");

    const handleSnackbarClick = async (submission: any) => {
        const subResp = await handleFormSubmit(submission);
        if (subResp?.includes('Error')) setSnackbarMsg(subResp);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
        return;
        }

        setSnackbarOpen(false);
    };

    const action = (
        <React.Fragment>
        <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
        >
            <CloseIcon fontSize="small" />
        </IconButton>
        </React.Fragment>
    );

    return (
        <>
        <Box component="form" noValidate onSubmit={handleSnackbarClick} sx={{maxWidth:'50%',margin:'auto'}}>
        <Grid container spacing={1}>
            {gridBoxGen(12,typogItemGen("h4","Reset Password"))}
            {gridBoxGen(12,<></>)}
            {gridBoxGen(12,typogItemGen("body1","Please enter your new password:"))}
            {gridBoxGen(12,"")}
            {inputFieldValues.map((inputFieldValue, index) => {
                return (
                    gridBoxGen(12,<TextField
                        key={String(index) + 'textfield'}
                        autoComplete={inputFieldValue.autoComplete}
                        name={inputFieldValue.name}
                        id={inputFieldValue.id}
                        label={inputFieldValue.label}
                        type={inputFieldValue.type}
                        required={inputFieldValue.required}
                        fullWidth={inputFieldValue.fullWidth}
                        autoFocus={inputFieldValue.autoFocus}
                        onBlur={handleInputValue}
                        onChange={handleInputValue}
                        {...(errors[inputFieldValue.name] && { error: true, helperText: errors[inputFieldValue.name] })}
                    />)
                )
            })}
            {gridBoxGen(12,<Button
                key={'reset-button'}
                disabled={!formIsValid()}
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 , maxWidth: "42%"}}>
                Reset Password
            </Button>)}
        </Grid>
        </Box>
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message={snackbarMsg}
            action={action}
        />
        </>
    )
}
