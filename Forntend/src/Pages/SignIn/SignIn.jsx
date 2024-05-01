import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import day from "./Assests/Bg.png";
import "./SignIn.css";
import somaiya from "./Assests/Logo1.png";
import { InputLabel, FormHelperText } from "@mui/material";
import { IconButton, InputAdornment } from "@mui/material";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import { useNavigate } from "react-router-dom";
import night from "./Assests/night.jpg";
import axios from "axios";

// function Copyright(props) {
//   return (
//     <Typography variant="body2" color="text.secondary" align="center" {...props}>
//       {'Copyright © '}
//       <Link color="inherit" href="https://mui.com/">
//         Your Website
//       </Link>{' '}
//       {new Date().getFullYear()}
//       {'.'}
//     </Typography>
//   );
// }

// TODO remove, this demo shouldn't need to reset the theme.




function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevents the default form submission

    const data = new FormData(document.querySelector("form"));
    const email = data.get("email");
    const password = data.get("password");
    console.log("Email:", email);
    console.log("Password:", password);

    // Reset previous errors
    setEmailError("");
    setPasswordError("");

    // Validation logic
    if (!email || !password) {
      setEmailError("Email and password are required.");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    const formData = new FormData();
    formData.append('name',email);
    formData.append('pwd',password);
    const response =await axios.post("http://127.0.0.1:8000/userlogin",
        formData,
    )
    if(response.data.message==='Welcome'){
    navigate("/forecast");
    }
    else{
      setPasswordError(response.data.message);
    }
  };

  const buttonStyle = {
    textTransform: 'none', // or 'capitalize' or 'lowercase'
  };
  const [imageSrc, setImageSrc] = useState(day); // Initially set to the daytime image

  useEffect(() => {
    // Set interval to change the image every 5 seconds
    const interval = setInterval(() => {
      // Toggle between day and night image
      setImageSrc((prevSrc) => (prevSrc === day ? night : day));
    }, 5000);

    return () => clearInterval(interval); // Cleanup function to clear the interval
  }, []);

  return (
    <Grid container sx={{width: "96rem"}}>
      <Grid item sx={{width:"53.738rem"}} >
        <Box
          id="imgBox"
          component="img"
          alt="Daytime Image"
        
          src={imageSrc}
        />
        <img src={somaiya} alt="somaiya" id="somaiya" />

        <figcaption id="top">Weather-Based</figcaption>
        <p id="bottom">Short-Term Load Forecasting</p>

        <Box
          id="footer"
          sx={{
            // position: 'absolute',
            // width: '25rem',
            // padding: '1.25rem',
            // backgroundColor: 'rgba(173, 216, 230, 0.7)', // Light Blue with 70% transparency
            // borderRadius: '24px',
          }}
        >
          <p id="foot">Developed By</p>
          <p id="foot2">
            <b>K. J. Somaiya Institute of Technology  </b>
          </p>
        </Box>
      </Grid>
      <Grid item id="signInGridItem" sx={{
        width: "41.055rem"
      }}>
        <Box
          id="signInBox"
          sx={{
            mx:'8.625rem',
            // marginLeft: '140px',
            // marginRight:'140px',
            marginY: '10.625rem',//og:9.375
            // alignItems: "center",
            // justifyContent: "center",
            // display: "flex",
          }}
          
        >
          <Typography
            component="h1"
            variant="h4"
            id="signInTitle"
            sx={{
              // mr: 43,
              fontWeight: "400",
              fontFamily: 'Poppins, sans-serif',
              fontStyle: 'normal',
              fontSize: '2rem',
              lineHeight: 'normal',
              color: '#2C2C2C',
              mb: "2.5rem",
            }}
          >
            Sign In
          </Typography>
          <Box component="form">
            <InputLabel size="normal"
            id="emailInputLabel"
              sx={{
                color: "#4A4A4A",
                fontFamily: "Poppins, sans-serif",
                fontSize: "1rem",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: "1rem",
                mb: "0.813rem",
              }}
            >
              Email *
            </InputLabel>
            <TextField
              required
            
              id="email"
              name="email"
              placeholder="mail@simple.com"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? (
                      <VisibilityRounded />
                    ) : (
                      <VisibilityOffRounded />
                    )}
                  </IconButton>
                </InputAdornment>
              }
              InputProps={{
                sx: {
                  // borderRadius: 5,
                  // marginBottom: 3,
                  // backgroundColor: "#f2f2f2",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  alignSelf: "stretch",
                  borderRadius: "16px",

                  background: "#F2F2F2",
                  mb: "1.5rem",
                  // padding: "0px 24px",
                  // paddingX: "24px",
                  width: "25rem",
                  height:"3rem",
                  "& .css-1d3z3hw-MuiOutlinedInput-notchedOutline": {
                    borderWidth: "0px",
                  }
                },
              }}
              error={!!emailError}
            />
            
            <InputLabel size="normal"
            id="passwordInputLabel"
              sx={{
                color: "#4A4A4A",
                fontFamily: "Poppins, sans-serif",
                fontSize: "1rem",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: "1rem",
                mb: "0.813rem",
              }}
            >
              Password *
            </InputLabel>
            <TextField
              id="passwordTextField"
              name="password"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none', // Remove the border
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none', // Remove the hover effect
                },
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                alignSelf: "stretch",
                borderRadius: "16px",

                background: "#F2F2F2",
                // padding: "0px 24px",
                // paddingX: "24px",
                width: "25rem",
                height:"3rem"
              }}
              placeholder="Min. 8 characters"
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityRounded />
                      ) : (
                        <VisibilityOffRounded />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              type={showPassword ? 'text' : 'password'}
              error={!!passwordError}
            />
            <FormHelperText error>{passwordError}</FormHelperText>

            <Grid container
            id="forgotGridContainer"
              sx={{
                width: "25rem",
              }}>
              <Grid item
              sx={{float: "right"}}
              >
                <Link
                id="forgotLink"
                  href="#"
                  variant="body2"
                  sx={{
                    float: "right",
                    textDecoration: "none",
                    color: "black",
                    color: "#2C2C2C",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "0.875rem",
                    fontStyle: "normal",
                    fontWeight: "400",
                    lineHeight: "normal",
                    float: 'right',
                    mb: "2.5rem",
                    ml:"17rem"
                  }}
                >
                  Forgot password?
                </Link>
              </Grid>
            </Grid>
            <FormHelperText error>{emailError}</FormHelperText>
            <Button
              style={buttonStyle}
              onClick={handleSubmit}
              fullWidth
              variant="contained"
              id="signInButton"
              sx={{
                // mt: 3,
                // mb: 2,
                // backgroundColor: "black",
                // borderRadius: 4,
                // color: 'white',
                display: "flex",
                width: "25rem",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.625rem",
                borderRadius: "16px",
                background: "#2C2C2C",
                color: "#FFF",
                textAlign: "center",
                fontFamily: "Poppins, sans-serif",
                fontSize: "1.125rem",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: "1rem",
                paddingY: "1rem",
                paddingX: "0.5rem",
                height:"3rem"
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default SignIn;