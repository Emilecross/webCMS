import { Box, Grid, Typography, Link, Tooltip } from "@mui/material";

export async function httpFunc(actionUrl: string, requestOptions: any) {
    const response = await fetch(actionUrl, requestOptions);
    switch(Math.floor(response.status/100)) {
        case 4:
        case 5:
            return '/error'
        default:
            break;
    }
    const requestResponse : any = await response.json();
    console.log(requestResponse)
    return requestResponse;
}

export async function httpFuncError(actionUrl: string, requestOptions: any) {
    const response = await fetch(actionUrl, requestOptions);
    const requestResponse : any = await response.json();
    return requestResponse;
}

export function gridBoxGen(size:number,content:any) {
    return (
        <>
            <Grid item xs={size}>
                <Box sx={{margin:'auto',textAlign:'center'}}>
                    {content}
                </Box>
            </Grid>
        </>
    )
}

export function typogItemGen(type:any, text:string) {
    return (
        <>
            <Box sx={{verticalAlign:'center'}}>
                <Typography style={{wordWrap: "break-word"}} variant={type}>
                    {text}
                </Typography>
            </Box>
        </>
    )
}

export function typogLinkGen(type:any, text:string, url:string) {
    return (
        <>
            <Tooltip title={`${text}'s profile`} followCursor={true}>
                <Box sx={{verticalAlign:'center'}}>
                    <Link href={url} style={{wordWrap: "break-word"}}  variant={type}>
                        {text}
                    </Link>
                </Box>
            </Tooltip>
        </>
    )
}