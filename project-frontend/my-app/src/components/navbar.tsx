import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';

import { getToken, getUserId } from '../index';
import AlertsDrawer from './alertsDrawer';

type pageObj = {
    id: number,
    url: string;
    label: string;
}

const pageName : string = "webCMS";

function ResponsiveAppBar() {
    const pageObjs : pageObj[] = (getToken() && getUserId()) ? [
        {id: 1, url: "/",label: "Home"},
        {id: 2, url: "/all_users",label: "All Users"},
        {id: 6, url: "/dashboard",label: "Dashboard"},
        {id: 7, url: "/search",label: "Search"},
        {id: 8, url: "/messages",label: "Messages"},
    ] :
    [
        {id: 1, url: "/",label: "Home"},
        {id: 3, url: "/register",label: "Register"},
        {id: 4, url: "/login",label: "Login"},
        {id: 5, url: "/verify",label: "Verification"},
    ];
    
    let settings = [
        {
            name: "Register",
            link: "/register"
        },
        {
            name: "Login",
            link: "/login"
        },
    ];

    if (getToken() && getUserId()) {
        settings = [
            {
                name: "Profile",
                link: "/profile/" + getUserId()
            },
            {
                name: "Logout",
                link: "/logout"
            },
        ]
    };

    const navigate = useNavigate();
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = (event: any) => {
        setAnchorElUser(null);
        const settingsObj = settings.filter((item) => {
            return (item.name === event.target.innerText)})
        navigate(settingsObj[0].link);
    };


    return (
        <AppBar position="static">
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                        mr: 2,
                        display: { xs: 'none', md: 'flex' },
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                        }}
                    >
                        {pageName}
                    </Typography>

                    {/* Small Screen Nav Bar */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                            >
                            {pageObjs.map((page:pageObj) => (
                                <MenuItem key={page.id} onClick={() => navigate(page.url)}>
                                <Typography textAlign="center">{page.label}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    {/* Big Screen Nav Bar */}
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href=""
                        sx={{
                        mr: 2,
                        display: { xs: 'flex', md: 'none' },
                        flexGrow: 1,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                        }}
                    >
                        {pageName}
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pageObjs.map((page:pageObj) => (
                            <Tooltip title={`Visit ${page.label} page`} enterDelay={500} leaveDelay={200}>
                                <Button
                                    key={page.id}
                                    onClick={() => navigate(page.url)}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    {page.label}
                                </Button>
                            </Tooltip>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <AlertsDrawer />
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings" enterDelay={500} leaveDelay={200}>
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="A" src="" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                            >
                            {settings.map((setting) => (
                                <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                                <Typography textAlign="center">{setting.name}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;