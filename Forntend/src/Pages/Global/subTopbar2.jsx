import React from "react";
import { useTheme } from "@emotion/react";
import { Box, Grid } from "@mui/material";
import { Card, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import { FormControl, InputLabel, Select, Button } from "@mui/material";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { tokens } from "../../theme";

const SubTopbar2 = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const [dayType, setDayType] = React.useState("Normal");

  const handleDateChange = (dayjsDate) => {
    setSelectedDate(dayjsDate);
  };

  const handleDayTypeChange = (event) => {
    setDayType(event.target.value);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <div
        style={{
          position: "fixed",
          marginTop: "100px",
          zIndex: 1000,
          width: "107%",
        }}
      >
        <Card
          sx={{
            display: "flex", // Apply flex to the card container
            alignItems: "center",
            justifyContent: "space-between", // Distribute items with spacing
            borderRadius: "20px",
            width: "70%",
            marginRight: "80px",
            marginTop: "0px",
            boxShadow: "4",
            outlineOffset: "-1px",
            height: "80px",
            backgroundColor:
              theme.palette.mode === "dark" ? colors.grey[400] : "white",
            "@media (max-width: 1200px)": {
              width: "80%",
              height: "500px",
              overflow: "scroll",
              // Modify styles for screens with width up to 1200px
            },
            "@media (max-width: 992px)": {
              width: "90%", // Modify styles for screens with width up to 992px
            },
            "@media (max-width: 768px)": {
              width: "100%", // Modify styles for screens with width up to 768px
            },
            "@media (max-width: 576px)": {
              width: "100%", // Additional media query for screens up to 576px wide
              marginRight: "40px", // Adjust other styles as needed
            },
            "@media (max-width: 480px)": {
              width: "100%", // Additional media query for screens up to 480px wide
              marginRight: "20px", // Adjust other styles as needed
            },
            "@media (max-width: 375px)": {
              width: "90%", // Media query for iPhone 6/7/8 and SE
              marginRight: "10px", // Adjust other styles as needed
            },
            "@media (max-width: 414px)": {
              width: "90%", // Media query for iPhone 6/7/8 Plus
              marginRight: "10px", // Adjust other styles as needed
            },
            "@media (max-width: 390px)": {
              width: "90%", // Media query for iPhone X/XS/11 Pro
              marginRight: "10px", // Adjust other styles as needed
            },
            "@media (max-width: 375px)": {
              width: "90%", // Media query for iPhone 6/7/8 and SE
              marginRight: "10px", // Adjust other styles as needed
            },
            "@media (max-width: 360px)": {
              width: "90%", // Media query for smaller screens
              marginRight: "10px", // Adjust other styles as needed
            },
            // "@media (max-width: 1475)": {
            //   Card: {
            //     maxHeight : "500px"
            //   }
            // },
          }}
        >
          <Grid
            container
            sx={{
              "@media (max-width: 1200px)": {
                width: "80%",
                height: "500px",
                // overflow: "scroll",
              },
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid item>
                <Typography
                  sx={{
                    marginTop: "15px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginLeft: "5px",
                    color: theme.palette.mode === "dark" ? "white" : "black",
                    marginRight: "10px",
                    width: "130px",
                  }}
                >
                  Forecast For
                </Typography>
              </Grid>
              <Grid item>
                <Box
                  sx={{
                    width: "230px",
                    backgroundColor: "#d1d1d1",
                    borderRadius: 2,
                    mx: 1,
                  }}
                >
                  <FormControl
                    fullWidth
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      border: "none",
                    }}
                  >
                    <InputLabel
                      sx={{ marginRight: "10px", marginBottom: "40px" }}
                    >
                      Date:
                    </InputLabel>
                    <DatePicker
                      value={selectedDate}
                      onChange={handleDateChange}
                      sx={{
                        borderRadius: "25px",
                        width: "165px", // Adjust as needed
                        border: "none",
                        fontSize: "10px",

                        marginLeft: "auto", // Push to the right
                        "& .MuiInputLabel-root": {
                          display: "none", // Hide the default label
                        },
                        "& .css-nxo287-MuiInputBase-input-MuiOutlinedInput-input":
                          {
                            height: "15px !important",
                          },
                      }}
                      renderInput={(params) => (
                        <input
                          {...params.inputProps}
                          style={{
                            height: ".1em",
                            border: "none",
                            width: "10%",
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </Box>
              </Grid>
              <Grid item>
                <Box
                  sx={{
                    width: "200px",
                    backgroundColor: "#d1d1d1",
                    borderRadius: 2,
                    mx: 1,
                    height: "50px",
                  }}
                >
                  {selectedDate && (
                    <Grid item xs={2}>
                      <Box
                        sx={{
                          borderRadius: "20px",

                          padding: "10px",
                          height: "38px",
                          width: "190px",

                          marginLeft: "18px",
                        }}
                      >
                        <Typography variant="body1" color="black">
                          Day: {dayjs(selectedDate).format("dddd")}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Box>
              </Grid>
              <Grid item>
                <Box
                  sx={{
                    width: "230px",
                    backgroundColor: "#d1d1d1",
                    borderRadius: "10px",
                    ml: "5px",
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: "10px",
                      padding: "7px",
                      width: "260px",
                      height: "50px",
                      backgroundColor: "#d1d1d1",
                      display: "flex",
                    }}
                  >
                    <InputLabel
                      sx={{ color: "black", marginTop: "4px", pr: "0px" }}
                    >
                      DayType:
                    </InputLabel>
                    <FormControl
                      sx={{
                        color: "transparent",
                        justifySelf: "end",
                        borderColor: "#d1d1d1",
                      }}
                    >
                      <Select
                        value={dayType}
                        onChange={handleDayTypeChange}
                        sx={{
                          marginTop: "0px",
                          marginBottom: "5px",
                          height: "35px",
                          width: "150px",
                          color: "black",
                          border: "1px solid #d1d1d1",
                          lineHeight: "none",
                          // borderColor: '#d1d1d1',
                          justifySelf: "end",
                          ml: "5px",
                        }}
                      >
                        <MenuItem value="Normal">Normal</MenuItem>
                        <MenuItem value="Weekday">Weekday </MenuItem>
                        <MenuItem value="Weekend">Weekend</MenuItem>
                        <MenuItem value="Holiday">Holiday</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>
              <Grid item>
                <Button
                  className="hey"
                  variant="contained"
                  sx={{
                    backgroundColor: "black",
                    width: "200px",
                    height: "40px",
                    ml: "50px",
                    borderRadius: "10px",
                    mt: "5px",
                    p: "5px",
                    color: colors.primary["light"],
                    fontSize: "12px",
                    "@media (max-width: 718px)": {
                      ml: "0px",
                      // overflow: "scroll",
                    },
                  }}
                >
                  Compare with Past Results
                </Button>
              </Grid>
            </LocalizationProvider>
          </Grid>
        </Card>
      </div>
    </div>
  );
};

export default SubTopbar2;
