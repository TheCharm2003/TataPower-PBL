import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, useNavigate } from "react-router-dom";
import Logo1 from '../../assets/Logo1.png';
import { tokens } from "../../theme";
import "react-pro-sidebar/dist/css/styles.css";
import LogoutTwoToneIcon from "@mui/icons-material/LogoutTwoTone";
import GridViewSharpIcon from "@mui/icons-material/GridViewSharp";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import { useMsal } from "@azure/msal-react";
// import './global.css'

const Item = ({ title, to, icon, selected, setSelected, onClick }) => {
  const theme = useTheme();

  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
        marginBottom: "15px",
        backgroundColor: selected === title ? "#444444" : "transparent",
        width: selected === title ? "240px" : "240px",
        borderRadius: selected === title ? "10px" : "0",
      }}
      onClick={() => {
        setSelected(title);
        if (onClick) onClick();
      }}
      icon={icon}
    >
      <Typography sx={{ color: colors.sidebar[200] }}>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar1 = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("dashboard");

  const { instance, accounts } = useMsal();

  const findAccountByHomeAccountId = (homeAccountId) => {
    return accounts.find((account) => account.homeAccountId === homeAccountId);
  };




  useEffect(() => {
    const storedSelected = localStorage.getItem("selectedItem");
    if (storedSelected) {
      setSelected(storedSelected);
    }
  }, []);

  const handleItemClick = (title) => {
    if (title === "Dashboard") {
      // If the user is on the "/" route, do not store "Dashboard" in localStorage
      if (window.location.pathname === "/" || window.location.pathname === "/signin") {
        setSelected(title);
        localStorage.removeItem("selectedItem");
      } else {
        setSelected(title);
        localStorage.setItem("selectedItem", title);
        window.dispatchEvent(new Event("storage"));
      }
    } else {
      setSelected(title);
      localStorage.setItem("selectedItem", title);
      window.dispatchEvent(new Event("storage"));
    }
  };
  const logOut = async () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "94vh",
        zIndex: 5,
        marginLeft: "10px",
        marginTop: "10px",
        position: "absolute",
        "& .pro-sidebar .pro-menu.square .pro-menu-item > .pro-inner-item > .pro-icon-wrapper": {
          color: colors.sidebar[200],
        },
        "& .pro-sidebar > .pro-sidebar-inner": {
          borderRadius: "24px",
          backgroundColor: colors.sidebar[100],
        },
        "&. pro-sidebar-inner": {
          backgroundColor: `${colors.purple[300]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !transparent",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#ffffff !important",
          backgroundColor: "#444444 !important",
          borderRadius: "10px",
        },
        "& .pro-inner-item:active": {
          color: "#ffffff !important",
        },
        "& .pro-icon-wrapper": {
          background: "none !important",
        },
      }}
    >
      <ProSidebar
        collapsed={isCollapsed}
        style={{
          height: "96vh",
          margin: "0px",
          padding: "0px",
          position: "fixed",

        }}
      ><Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          {/* <MenuItem
        onClick={() => setIsCollapsed(!isCollapsed)}
        icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
        style={{
          margin: "0px",
          color: colors.grey[100],
        }}
      > */}
          {/* {!isCollapsed && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            ml="15px"
          >
            <Typography variant='h3' color={colors.grey[100]} sx={{ marginBottom: '30px' }}>Tata Power</Typography>
            <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
              <MenuOutlinedIcon style={{ color: "white", marginBottom: '30px' }} />
            </IconButton>
          </Box>
        )} */}
          {/* </MenuItem> */}
          {!isCollapsed && (
            <Box mb="25px">
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{ pt: 2 }}
              >
                <img
                  width="200px"
                  // height="80px"
                  src={Logo1}
                />
              </Box>

            </Box>
          )}
          <Box paddingLeft={isCollapsed ? undefined : "5%"}
            sx={{ height: '77vh', display: 'flex', flexDirection: 'column', position: 'relative' }}
          >
            {/* <Item
              title="Dashboard"
              to="/dash2"
              icon={<GridViewSharpIcon sx={{ backgroundColor: "" }} />}
              selected={selected}
              setSelected={handleItemClick}
            /> */}
            {/* <Item
              title="Upload Data"
              to="/upload"
              icon={<UploadFileOutlinedIcon />}
              selected={selected}
              setSelected={handleItemClick}
            /> */}
            <Item
              title="Forecast"
              to="/forecast"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={handleItemClick}
            />
            {/* <Item
              title="7 Days Forecast"
              to="/nday"
              icon={<QueryStatsIcon/>}
              selected={selected}
              setSelected={handleItemClick}
            /> */}
            <Item
              title="Verify Prediction"
              to="/pastresult"
              icon={<PollOutlinedIcon />}
              selected={selected}
              setSelected={handleItemClick}
            />
            {/* <Item
              title="Insight Board"
              to="https://app.powerbi.com/view?r=eyJrIjoiMTZjNDVlMGYtM2I1MC00MjlkLThlNjQtOWRhOGYwNzAxYmJhIiwidCI6IjNiNWUwMmI5LWQ2MjMtNGJhNy1hNzRhLTEyZDc0YmM1MjE3YyJ9"
              icon={<StackedBarChartIcon/>}
              selected={selected}
              setSelected={handleItemClick}
            /> */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'end'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', position: 'absolute', bottom: '0px' }}>
                <Item

                  title="Logout"
                  to="/"
                  icon={<LogoutTwoToneIcon />}
                  selected={selected}
                  setSelected={handleItemClick}
                  onClick={logOut}


                />
              </div>
            </Box>
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar1;