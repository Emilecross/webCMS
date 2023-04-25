import { Box, Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { gridBoxGen, httpFunc, typogItemGen } from "../functions";
import { getToken } from '../index';

const initialDescriptionValue: descriptionFormValues = {
    description: ""
};

type descriptionFormValues = {
    description: string;
}

type requestOptions = {
    method: string;
    headers: {
        'Content-Type': string;
    };
    body: string;
};

async function postNewDescriptionData (description: string) {
    const putData = JSON.stringify({token: getToken(), description: description});
    const requestOptions: requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: putData
    };

    const url ='http://localhost:6969/user/update_description';

    return httpFunc(url, requestOptions);
}

export default function DescriptionUpdateGrid(navigate: NavigateFunction, oldDescription: string) {
    const varToString = (varObj: {}) => Object.keys(varObj);
    const [values, setValues] = useState(initialDescriptionValue);
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

    const descriptionInputValueHandler: any = (object: any) => {
        let { name, value} = object.target;
        setValues({...values,[name]: value});
        validateInputValues({ [name]: value });
    }

    const formSubmissionHandler = async (submission: any) => {
        submission.preventDefault();
        const reqResponse = await postNewDescriptionData(values.description);
        if (reqResponse !== '/error') navigate('/update_profile');
    }

    const descriptionInputFieldValues = [
        {
            autoComplete:"description",
            name:"description",
            id:"description",
            label:"New Description",
            type:"",
            required:true,
            fullWidth:true,
            autoFocus:false,
            defaultValue: oldDescription
        }
    ];

    return (
        <>
        <Box component="form" noValidate onSubmit={formSubmissionHandler} sx={{maxWidth:'50%',margin:'auto'}}>
            <Grid container spacing={2}>
            {gridBoxGen(12,typogItemGen("h5","Update your Description"))}
            {gridBoxGen(12,"")}
            {descriptionInputFieldValues.map((descriptionInputFieldValue, index) => {
                return (
                    gridBoxGen(12,<TextField
                        key={index}
                        autoComplete={descriptionInputFieldValue.autoComplete}
                        name={descriptionInputFieldValue.name}
                        id={descriptionInputFieldValue.id}
                        type={descriptionInputFieldValue.type}
                        required={descriptionInputFieldValue.required}
                        fullWidth={descriptionInputFieldValue.fullWidth}
                        autoFocus={descriptionInputFieldValue.autoFocus}
                        onBlur={descriptionInputValueHandler}
                        onChange={descriptionInputValueHandler}
                        defaultValue={descriptionInputFieldValue.defaultValue}
                        multiline
                        {...(errors[descriptionInputFieldValue.name] && { error: true, helperText: errors[descriptionInputFieldValue.name] })}
                    />)
                )
            })}
            {gridBoxGen(12,<Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 , maxWidth: "60%"}}>
                Update Description
            </Button>)}
            {gridBoxGen(12,<></>)}
            </Grid>
        </Box>
        </>
    )
}