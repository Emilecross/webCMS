import { Box, Button, Checkbox, FormControl, FormControlLabel, FormLabel, Grid, IconButton, Link, Radio, RadioGroup, Snackbar, TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gridBoxGen, httpFunc, httpFuncError, typogItemGen } from "../functions";
import './main.css';
import React from "react";
import CloseIcon from '@mui/icons-material/Close';

export default function Register () {
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

type pageValues = {
    userName: string,
    email: string,
    password:string,
    accountType:string,
    termsAndConds: boolean,
    formSubmitted: boolean,
    success: boolean
}

const initialValues : pageValues = {
    userName: "",
    email: "",
    password: "",
    accountType: "charity",
    termsAndConds: false,
    formSubmitted: false,
    success: false
}

const useFormControls = () => {
    const navigate = useNavigate();
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
                if (key === "email") boolVal = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formValues.email)
                if (key in formValues) currData[myVar] = boolVal ? "" : errMsg;
            }
        })
        setErrors({...currData});
    }
    const inputValueHandler: any = (object: any) => {
        let { name, value, checked } = object.target;
        if (name === "termsAndConds") {
            value = checked;
            object.target.color = checked ? 'default' : 'error'
        }
        setValues({...values,[name]: value});
        validateInputValues({ [name]: value });
    }
    const formSubmissionHandler = async (submission: any) => {
        submission.preventDefault();
        if (formIsValid()) {
            const regResponse = await postRegisterData(values);
            const respCode = Math.floor(regResponse.code/100);
            if (respCode === 4 || respCode === 5) {
                return "Error: " + regResponse.message.replace('<p>','').replace('</p>','');
            } else {
                navigate('/success?type=register');
            }
        } 
    }
    const formIsValid: any = (formValues = values) => {
        const isValid =
        formValues.userName &&
        formValues.email &&
        formValues.password &&
        formValues.termsAndConds &&
        Object.values(errors).every((x) => x === "");

        return isValid;
    }
    return {
        handleInputValue: inputValueHandler,
        handleFormSubmit: formSubmissionHandler,
        formIsValid,
        errors
    };
}

type submissionValues = {
    username: string,
    password: string,
    email: string,
    is_charity: boolean
}

async function postRegisterData (formValues: pageValues) {
    const submission: submissionValues = {
        username: formValues.userName,
        password: formValues.password,
        email: formValues.email,
        is_charity: formValues.accountType === "charity" ? true : false
    };
    const postData = JSON.stringify(submission);
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: postData
    };
    const response = await httpFuncError("http://localhost:6969/auth/register", requestOptions);
    return response;
}
  

function InputGrid () {
    const {
        handleInputValue,
        handleFormSubmit,
        formIsValid,
        errors
    } = useFormControls();

    
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

    const inputFieldValues = [
        {
            autoComplete:"username",
            name:"userName",
            id:"userName",
            label:"Username",
            type:"",
            required:true,
            fullWidth:true,
            autoFocus:true
        },
        {
            autoComplete:"email",
            name:"email",
            id:"email",
            label:"Email Address",
            type:"",
            required:true,
            fullWidth:true,
            autoFocus:false
        },
        {
            autoComplete:"new-password",
            name:"password",
            id:"password",
            label:"Password",
            type:"password",
            required:true,
            fullWidth:true,
            autoFocus:false
        }

    ]

    return (
        <>
        <Box component="form" noValidate onSubmit={handleSnackbarClick} sx={{maxWidth:'50%',margin:'auto'}}>
        <Grid container spacing={1}>
            {gridBoxGen(12,typogItemGen("h4","Register an account"))}
            {gridBoxGen(12,"")}
            {inputFieldValues.map((inputFieldValue, index) => {
                return (
                    gridBoxGen(12,<TextField
                        key={index}
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
            {gridBoxGen(12,<></>)}
            {gridBoxGen(12,<></>)}
            {CharitySponsorRadioButton(handleInputValue)}
            {gridBoxGen(12,<FormControlLabel
                control={<Checkbox name="termsAndConds" value="termsAndConds" id="termsAndConds" color="primary" />}
                label="I agree to the terms and conditions"
                {...(errors["termsAndConds"] && { error: true, helperText: errors["termsAndConds"] })}
                required
                color='error'
                onChange={handleInputValue}
            />)}
            {gridBoxGen(12,<Button
                disabled={!formIsValid()}
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 , maxWidth: "30%"}}>
                Sign Up
            </Button>)}
            {gridBoxGen(12,<Link href="/login" variant="body2">
                Already have an account? Sign in
            </Link>)}
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

function CharitySponsorRadioButton(handleInputValue: any) {
    const [value, setValue] = useState('charity');
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
        handleInputValue({target:{name:"accountType",value:(event.target as HTMLInputElement).value}});
    };
    return (
        <>
        <Box sx={{margin:'auto'}}>
           <FormControl onChange={handleChange}>
                <FormLabel id="accountType">Account Type</FormLabel>
                <RadioGroup
                    name="accountType"
                    value={value}
                >
                    <FormControlLabel value="charity" control={<Radio />} label="Charity" />
                    <FormControlLabel value="sponsor" control={<Radio />} label="Sponsor" />
                </RadioGroup>
            </FormControl> 

        </Box>
        </>
    )
}