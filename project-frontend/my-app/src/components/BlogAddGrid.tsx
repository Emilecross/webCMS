import { Box, Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { gridBoxGen, httpFunc, typogItemGen } from "../functions";
import { getToken } from '../index';

type blogFormValues = {
    title: string,
    content: string
}

const initialBlogValues: blogFormValues = {
    title: "",
    content: ""
};

type requestOptions = {
    method: string;
    headers: {
        'Content-Type': string;
    };
    body: string;
};

async function postNewBlog (title:string, content: string) {
    const putData = JSON.stringify({token: getToken(), title: title, content: content});
    const requestOptions: requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: putData
    };
    const url ='http://localhost:6969/user/add_blog';
    return httpFunc(url, requestOptions);
}

export default function BlogAddGrid(navigate: NavigateFunction) {
    const varToString = (varObj: {}) => Object.keys(varObj);
    const [values, setValues] = useState(initialBlogValues);
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
    const blogInputValueHandler: any = (object: any) => {
        let { name, value} = object.target;
        setValues({...values,[name]: value});
        validateInputValues({ [name]: value });
    }

    const formSubmissionHandler = async (submission: any) => {
        submission.preventDefault();
        const reqResponse = await postNewBlog(values.title, values.content);
        if (reqResponse !== '/error') navigate('/success?type=blog_add');
    }

    const blogInputFieldValues = [
        {
            autoComplete:"title",
            name:"title",
            id:"title",
            label:"Title",
            type:"",
            required:true,
            fullWidth:true,
            autoFocus:false,
            onBlur: blogInputValueHandler,
            onChange: blogInputValueHandler,
            multiline: true,
            maxRows: Infinity
        },
        {
            autoComplete:"content",
            name:"content",
            id:"content",
            label:"Content",
            type:"",
            required:true,
            fullWidth:true,
            autoFocus:false,
            onBlur: blogInputValueHandler,
            onChange: blogInputValueHandler,
            multiline: true,
            maxRows: Infinity
        }
    ];

    return (
        <>
        <Box component="form" noValidate onSubmit={formSubmissionHandler} sx={{maxWidth:'50%',margin:'auto'}}>
            <Grid container spacing={2}>
            {gridBoxGen(12,typogItemGen("h5","Write a Blog!"))}
            {gridBoxGen(12,"")}
            {blogInputFieldValues.map((blogInputFieldValue, index) => {
                return (
                    gridBoxGen(12,<TextField
                        key={index}
                        autoComplete={blogInputFieldValue.autoComplete}
                        name={blogInputFieldValue.name}
                        id={blogInputFieldValue.id}
                        label={blogInputFieldValue.label}
                        type={blogInputFieldValue.type}
                        required={blogInputFieldValue.required}
                        fullWidth={blogInputFieldValue.fullWidth}
                        autoFocus={blogInputFieldValue.autoFocus}
                        onBlur={blogInputFieldValue.onBlur}
                        onChange={blogInputFieldValue.onChange}
                        multiline={blogInputFieldValue.multiline}
                        maxRows={blogInputFieldValue.maxRows}
                        {...(errors[blogInputFieldValue.name] && { error: true, helperText: errors[blogInputFieldValue.name] })}
                    />)
                )
            })}
            {gridBoxGen(12,<Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 , maxWidth: "60%"}}>
                Post Blog
            </Button>)}
            {gridBoxGen(12,<></>)}
            </Grid>
        </Box>
        </>
    )
}