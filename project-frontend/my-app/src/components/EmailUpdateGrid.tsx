import { Box, Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { gridBoxGen, httpFunc, typogItemGen } from "../functions";
import { getToken } from '../index';

type emailFormValues = {
    oldEmail: string,
    newEmail: string,
    password: string
}

const initialEmailFormValues: emailFormValues = {
    oldEmail: "",
    newEmail: "",
    password: ""
}

type requestOptions = {
    method: string;
    headers: {
        'Content-Type': string;
    };
    body: string;
};


async function postNewEmailData (password: string, email: string) {
    const putData = JSON.stringify({token: getToken(), password: password, email: email});
    const requestOptions: requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: putData
    };

    const url ='http://localhost:6969/user/update_email';

    return httpFunc(url, requestOptions);
}

export default function EmailUpdateGrid(navigate: NavigateFunction) {
    const varToString = (varObj: {}) => Object.keys(varObj);
    const [values, setValues] = useState(initialEmailFormValues);
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
                if (key === "oldEmail" || key === "newEmail") boolVal = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formValues[myVar2])
                if (key in formValues) currData[myVar] = boolVal ? "" : errMsg;
            }
        })
        setErrors({...currData});
    }

    const emailInputValueHandler: any = (object: any) => {
        let { name, value} = object.target;
        setValues({...values,[name]: value});
        validateInputValues({ [name]: value });
    }

    const emailIsValid: any = (formValues = values) => {
        const isValid =
        formValues.newEmail &&
        formValues.password &&
        Object.values(errors).every((x) => x === "");

        return isValid;
    }

    const formSubmissionHandler = async (submission: any) => {
        const urlParams = new URLSearchParams(window.location.search);
        const getUsername = urlParams.has('username') ? urlParams.get('username')! : "";
        submission.preventDefault();
        if (emailIsValid()) {
            const reqResponse = await postNewEmailData(values.password, values.newEmail);
            if (reqResponse !== '/error') navigate('/update_profile');
        }
    }

    const emailInputFieldValues = [
        {
            autoComplete:"newEmail",
            name:"newEmail",
            id:"newEmail",
            label:"New Email Address",
            type:"",
            required:true,
            fullWidth:true,
            autoFocus:true
        },
        {
            autoComplete:"password",
            name:"password",
            id:"password",
            label:"Password",
            type:"password",
            required:true,
            fullWidth:true,
            autoFocus:false
        }
    ];

    return (
        <>
        <Box component="form" noValidate onSubmit={formSubmissionHandler} sx={{maxWidth:'50%',margin:'auto'}}>
            <Grid container spacing={2}>
            {gridBoxGen(12,typogItemGen("h5","Update your Email"))}
            {gridBoxGen(12,"")}
            {emailInputFieldValues.map((emailInputFieldValue, index) => {
                return (
                    gridBoxGen(12,<TextField
                        key={index}
                        autoComplete={emailInputFieldValue.autoComplete}
                        name={emailInputFieldValue.name}
                        id={emailInputFieldValue.id}
                        label={emailInputFieldValue.label}
                        type={emailInputFieldValue.type}
                        required={emailInputFieldValue.required}
                        fullWidth={emailInputFieldValue.fullWidth}
                        autoFocus={emailInputFieldValue.autoFocus}
                        onBlur={emailInputValueHandler}
                        onChange={emailInputValueHandler}
                        {...(errors[emailInputFieldValue.name] && { error: true, helperText: errors[emailInputFieldValue.name] })}
                    />)
                )
            })}
            {gridBoxGen(12,<Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 , maxWidth: "40%"}}>
                Change Email
            </Button>)}
            {gridBoxGen(12,<></>)}
            </Grid>
        </Box>
        </>
    )
}