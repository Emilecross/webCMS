import { Box, Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import './main.css';
import { useNavigate } from "react-router-dom";
import { gridBoxGen, httpFunc, typogItemGen } from "../functions";

export default function ForgotPwd () {
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
    email: "",
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
        let { name, value } = object.target;
        setValues({...values,[name]: value});
        validateInputValues({ [name]: value });
    }
    const formSubmissionHandler = async (submission: any) => {
        submission.preventDefault();
        if (formIsValid()) {
            const redirectUrl = await postForgotPasswordData(values.email);
            if (redirectUrl !== '/error') navigate('/success?type=forgot_reset')
        }
    }
    const formIsValid: any = (formValues = values) => {
        const isValid = formValues.email && Object.values(errors).every((x) => x === "");
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

async function postForgotPasswordData (email: string) {
    const putData = JSON.stringify({email: email});
    const requestOptions: requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: putData
    };

    const url ='http://localhost:6969/auth/request_reset';

    return httpFunc(url, requestOptions);
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
            autoComplete:"email",
            name:"email",
            id:"email",
            label:"Email Address",
            type:"",
            required:true,
            fullWidth:true,
            autoFocus:true
        }

    ]

    return (
        <>
        <Box component="form" noValidate onSubmit={handleFormSubmit} sx={{maxWidth:'50%',margin:'auto'}}>
        <Grid container spacing={1}>
            {gridBoxGen(12,typogItemGen("h4","Forgot Password"))}
            {gridBoxGen(12,<></>)}
            {gridBoxGen(12,typogItemGen("body1","Enter the email associated with the account and a password reset link will be sent to the email if an account exists."))}
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
            {gridBoxGen(12,<Button
                disabled={!formIsValid()}
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 , maxWidth: "50%"}}>
                Send Reset Email
            </Button>)}
        </Grid>
        </Box>
        </>
    )
}
