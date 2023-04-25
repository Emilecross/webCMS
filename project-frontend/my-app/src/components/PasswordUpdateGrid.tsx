import { Box, Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { gridBoxGen, httpFunc, typogItemGen } from "../functions";
import {getToken} from '../index';

type passwordFormValues = {
    oldPassword: string,
    newPassword: string,
}

const initialPasswordFormValues: passwordFormValues = {
    oldPassword: "",
    newPassword: ""
}

type requestOptions = {
    method: string;
    headers: {
        'Content-Type': string;
    };
    body: string;
};

async function postNewPasswordData (oldPassword: string, newPassword: string) {
    const putData = JSON.stringify({token: getToken(), old_password: oldPassword, new_password: newPassword});
    const requestOptions: requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: putData
    };

    const url ='http://localhost:6969/user/update_password';

    return httpFunc(url, requestOptions);
}

export default function PasswordUpdateGrid(navigate: NavigateFunction) {
    const varToString = (varObj: {}) => Object.keys(varObj);
    const [values, setValues] = useState(initialPasswordFormValues);
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

    const passwordInputValueHandler: any = (object: any) => {
        let { name, value} = object.target;
        setValues({...values,[name]: value});
        validateInputValues({ [name]: value });
    }

    const passwordIsValid: any = (formValues = values) => {
        const isValid =
        formValues.oldPassword &&
        formValues.newPassword &&
        Object.values(errors).every((x) => x === "");

        return isValid;
    }

    const passwordFormSubmissionHandler = async (submission: any) => {
        const urlParams = new URLSearchParams(window.location.search);
        const getUsername = urlParams.has('username') ? urlParams.get('username')! : "";
        submission.preventDefault();
        if (passwordIsValid()) {
            const reqResponse = await postNewPasswordData(values.oldPassword, values.newPassword);
            if (reqResponse !== '/error') navigate('/update_profile');
        }
    }

    const passwordInputFieldValues = [
        {
            autoComplete:"oldPassword",
            name:"oldPassword",
            id:"oldPassword",
            label:"Current Password",
            type:"password",
            required:true,
            fullWidth:true,
            autoFocus:false
        },
        {
            autoComplete:"newPassword",
            name:"newPassword",
            id:"newPassword",
            label:"New Password",
            type:"password",
            required:true,
            fullWidth:true,
            autoFocus:false
        }
    ];

    return (
        <>
        <Box component="form" noValidate onSubmit={passwordFormSubmissionHandler} sx={{maxWidth:'50%',margin:'auto'}}>
            <Grid container spacing={2}>
            {gridBoxGen(12,typogItemGen("h5","Update your Password"))}
            {gridBoxGen(12,"")}
            {passwordInputFieldValues.map((passwordInputFieldValue, index) => {
                return (
                    gridBoxGen(12,<TextField
                        key={index}
                        autoComplete={passwordInputFieldValue.autoComplete}
                        name={passwordInputFieldValue.name}
                        id={passwordInputFieldValue.id}
                        label={passwordInputFieldValue.label}
                        type={passwordInputFieldValue.type}
                        required={passwordInputFieldValue.required}
                        fullWidth={passwordInputFieldValue.fullWidth}
                        autoFocus={passwordInputFieldValue.autoFocus}
                        onBlur={passwordInputValueHandler}
                        onChange={passwordInputValueHandler}
                        {...(errors[passwordInputFieldValue.name] && { error: true, helperText: errors[passwordInputFieldValue.name] })}
                    />)
                )
            })}
            {gridBoxGen(12,<Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 , maxWidth: "51%"}}>
                Change Password
            </Button>)}
            {gridBoxGen(12,<></>)}
            </Grid>
        </Box>
        </>
    )
}