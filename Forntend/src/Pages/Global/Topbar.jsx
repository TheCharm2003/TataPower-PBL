import IconButton from "@mui/material/IconButton";

import { useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

import { Card, Typography, Grid, Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useMsal } from "@azure/msal-react";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  // const uname = localStorage.getItem('userName')
  const { instance } = useMsal();
  const [activeAccount, setActiveAccount] = useState(null);
  const [tname, setTname] = useState();
  let uname;
  useEffect(() => {
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      setActiveAccount(accounts[0]);
     uname = accounts[0].name;
      console.log("accounts2112",uname)
      
      setTname(uname);
    }
  }, [instance]);
  console.log("tname",tname)

  return (
    <Box sx={{
      position: "sticky",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    }}>

      <div
        style={{
          position: "fixed",
          top: 0,
          // zIndex: 1000,
          width: "75rem",
          marginLeft: "305px",
          display: "flex",
          // display: "flex",
          // padding: "32px",
          // alignItems: "flex-start",
          // gap: "48px",
          // alignSelf: "stretch",
          // bordeadius: "24px",
          // background: "#FFF",
          // boxShadow: "0rem 0.625rem 2.5rem 0rem rgba(222, 230, 237, 0.40)",
        }}
      >
        <Box
          sx={{

            borderRadius: "1.25rem",
            width: "75.914rem",
            // zIndex: 1000,
            boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[100]}`,
            height: "4.375rem",
            mt: "0.938rem",
            display: "flex",
            backgroundColor:colors.primary['main'],
            // "@media (max-width: 1200px)": {
            //   width: "70%", // Modify styles for screens with width up to 1200px
            // },
            // "@media (max-width: 992px)": {
            //   width: "70%", // Modify styles for screens with width up to 992px
            // },
            // "@media (max-width: 768px)": {
            //   width: "65%", // Modify styles for screens with width up to 768px
            // },
            // "@media (max-width: 576px)": {
            //   width: "60%", // Additional media query for screens up to 576px wide\
            //   // Adjust other styles as needed
            // },
            // "@media (max-width: 480px)": {
            //   width: "55%"
            //   // Additional media query for screens up to 480px wide
            //   // Adjust other styles as needed
            // },
            // "@media (max-width: 414px)": {
            //   width: "53%", // Media query for iPhone 6/7/8 Plus
            //   // Adjust other styles as needed
            // },
            // "@media (max-width: 390px)": {
            //   width: "52%", // Media query for iPhone X/XS/11 Pro
            //   // Adjust other styles as needed
            // },
            // "@media (max-width: 375px)": {
            //   width: "50%", // Media query for iPhone 6/7/8 and SE
            //   // Adjust other styles as needed
            // },
            // "@media (max-width: 360px)": {
            //   width: "49%", // Media query for smaller screens
            //   // Adjust other styles as needed
            // },
          }}
        >
          <Grid container sx={{display:"flex" , justifyContent:'space-between' }}>
            <Grid item sx={{display:"flex"}}>
            <Typography
            sx={{
              marginTop: "0.938rem",
              fontSize: "1.8rem",
              fontWeight: "600",
              marginLeft: "1.25rem",
              color:colors.grey[900],
              fontFamily:'Poppins,sans-serif'
              // "@media (max-width: 480px)": {
              //   fontSize: 27,
              // },
              // "@media (max-width: 428px)": {
              //   fontSize: 25,
              // },
              // "@media (max-width: 414px)": {
              //   fontSize: 24,
              // },
              // "@media (max-width: 390px)": {
              //   fontSize: 23,
              // },
              // "@media (max-width: 375px)": {
              //   fontSize: 22,
              // },
              // "@media (max-width: 360px)": {
              //   fontSize: 21,
              // },
            }}
          >
            AI Based Short Term Load Forecasting 
          </Typography>
            </Grid>
            <Grid item sx={{display:"flex"}}>
            <Box 
            sx={{
              
              mt: "0.925rem"
            }}
          >
            {/* {tname}&nbsp; */}
            <IconButton
              onClick={colorMode.toggleColorMode}
            >
              {theme.palette.mode === "dark" ? (
                <DarkModeOutlinedIcon />
              ) : (
                <LightModeOutlinedIcon />
              )}
            </IconButton>
          </Box>
            </Grid>
          </Grid>
          
          

        </Box>
      </div>
      {/* <Grid item>
          <Box>
            <IconButton
              onClick={colorMode.toggleColorMode}
            // style={{

            //   marginLeft: "1450px"

            // }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkModeOutlinedIcon />
              ) : (
                <LightModeOutlinedIcon />
              )}
            </IconButton>
          </Box>
        </Grid>
      </Grid> */}
      {/* <Grid container sx={{
      position: "fixed",
      zIndex: 1000,

    }}> */}
      {/* <Grid item>
        <div
          style={{
            position: "fixed",
            top: 0,
            zIndex: 1000,
            width: "100%",
            marginLeft: "300px",
          }}
        >
          <Box
            sx={{

              borderRadius: "20px",
              width: "75%",

              boxShadow: "4",
              height: "70px",
              marginTop: "4px",
              backgroundColor:
                theme.palette.mode === "dark" ? colors.grey[400] : "white",
              "@media (max-width: 1200px)": {
                width: "70%", // Modify styles for screens with width up to 1200px
              },
              "@media (max-width: 992px)": {
                width: "70%", // Modify styles for screens with width up to 992px
              },
              "@media (max-width: 768px)": {
                width: "65%", // Modify styles for screens with width up to 768px
              },
              "@media (max-width: 576px)": {
                width: "60%", // Additional media query for screens up to 576px wide
                marginRight: "40px", // Adjust other styles as needed
              },
              "@media (max-width: 480px)": {
                width: "55%"
               // Additional media query for screens up to 480px wide
                // Adjust other styles as needed
              },
              "@media (max-width: 414px)": {
                width: "53%", // Media query for iPhone 6/7/8 Plus
                 // Adjust other styles as needed
              },
              "@media (max-width: 390px)": {
                width: "52%", // Media query for iPhone X/XS/11 Pro
               // Adjust other styles as needed
              },
              "@media (max-width: 375px)": {
                width: "50%", // Media query for iPhone 6/7/8 and SE
              // Adjust other styles as needed
              },
              "@media (max-width: 360px)": {
                width: "49%", // Media query for smaller screens
                 // Adjust other styles as needed
              },
            }}
          >

            <Typography
              sx={{
                marginTop: "15px",
                fontSize: "30px",
                fontWeight: "bold",
                marginLeft: "0px",
                color: theme.palette.mode === "dark" ? "white" : "black",
                "@media (max-width: 480px)": {
                  fontSize: 27 ,
                },
                "@media (max-width: 428px)": {
                  fontSize: 25 ,
                },
                "@media (max-width: 414px)": {
                  fontSize: 24 ,
                },
                "@media (max-width: 390px)": {
                  fontSize: 23 ,
                },
                "@media (max-width: 375px)": {
                  fontSize: 22 ,
                },
                "@media (max-width: 360px)": {
                  fontSize: 21 ,
                },
              }}
            >
              Short Term Load ForeCasting
            </Typography>



          </Box>
        </div>
      </Grid> */}
      {/* <Grid item>
        <Box>
          <IconButton
            onClick={colorMode.toggleColorMode}
            // style={{

            //   marginLeft: "1450px"

            // }}
          >
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon />
            ) : (
              <LightModeOutlinedIcon />
            )}
          </IconButton>
        </Box>
      </Grid> */}
    </Box>

  );
};
export default Topbar;