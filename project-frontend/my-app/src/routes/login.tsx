import { Box, Button, Grid, Link, TextField } from "@mui/material";
import { useState } from "react";
import './main.css';
import { getUserId, setToken, setUserId} from '../index'
import { useNavigate } from "react-router-dom";
import { gridBoxGen, httpFunc, typogItemGen } from "../functions";

export default function Login () {
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
    email: string,
    password:string,
    formSubmitted: boolean,
    success: boolean
}

const initialValues: pageValues = {
    email: "",
    password:"",
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
            const response = await postLoginData(values)
            if (response === '/error') navigate('/nomatch');
            else {
                setToken(response.token);
                setUserId(response.user_id);
                if (response.permissions === 1) navigate('/admin');
                else navigate(`/profile/${getUserId()}`);
            }
        }
    }
    const formIsValid: any = (formValues = values) => {
        const isValid = formValues.email && formValues.password &&
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
    email: string,
    password: string
}

async function postLoginData (formValues: pageValues) {
    const submission: submissionValues = {
        email: formValues.email,
        password: formValues.password,
    };
    const postData = JSON.stringify(submission);
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: postData
    };
    return httpFunc("http://127.0.0.1:6969/auth/login",requestOptions);
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

    ]

    return (
        <>
        <Box component="form" noValidate onSubmit={handleFormSubmit} sx={{maxWidth:'50%',margin:'auto'}}>
        <Grid container spacing={1}>
            {gridBoxGen(12,typogItemGen("h4","Login"))}
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
                sx={{ mt: 3, mb: 2 , maxWidth: "30%"}}>
                Sign In
            </Button>)}
            {gridBoxGen(12,<Link href="/forgot_password" variant="body2">
                Forgot Password? Click Here
            </Link>)}
        </Grid>
        </Box>
        </>
    )
}
