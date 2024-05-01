import * as React from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
  Checkbox,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Box,
  MenuItem,
  Select,
  Popover,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import Modal from "@mui/material/Modal";
import MultipleDatesPicker from "@ambiot/material-ui-multiple-dates-picker";
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
// import instance from "../middleware";
// import './multi.css';
import { toast } from "react-toastify";
import axios from "axios";

export default function FirstComponent({ onDateChange, onDayTypeChange }) {
  const navigate = useNavigate();
  const chartRef = React.useRef(null);
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    //modal styling baki hai

    width: 800,
    height: 700,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };
  const modStyle1 = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedDate, setSelectedDate] = React.useState(dayjs().add(1, "day"));
  const [fetchedDayType, setFetchedDayType] = React.useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubChecked, setisSubChecked] = useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [MultipleselectedDates, setMultipleselectedDates] = useState([]);
  const [dayType, setDayType] = React.useState("");

  const handleDateChange = (dayjsDate) => {
    setSelectedDate(dayjsDate);
  };

  const handleDayTypeChange = (event) => {
    const newDayType = event.target.value;
    setFetchedDayType(newDayType);
    setDayType(newDayType);
    onDayTypeChange(newDayType);
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleMainCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    setisSubChecked(isChecked);
    if (isChecked) {
      setContainerEl(event.currentTarget);
    } else {
      setContainerEl(null);
    }
  };

  const handleSubmit = (dates) => {
    const updatedDates = [...dates, selectedDate];
    setMultipleselectedDates(updatedDates);
    setOpen(false);
    localStorage.setItem("ComparisonDates", JSON.stringify(updatedDates));
    localStorage.setItem("ComparisonDaytype", JSON.stringify(dayType))
    window.dispatchEvent(new Event("storage"));
    handleNav();
  };

  const handleNav = () => {
    navigate("/compwa");
  };

  const [containerEl, setContainerEl] = useState(null);

  const handleClose1 = () => {
    setisSubChecked(false);
    setIsChecked(false);
  };

  useEffect(() => {
    if (isSubChecked === false) {
      setContainerEl(null);
    }
  }, [isSubChecked]);

  const open1 = Boolean(containerEl);
  const id = open1 ? "simple-popover" : undefined;
  const token = localStorage.getItem('authority2');
  const handleSubmit1 = async () => {
    if (isChecked) {
      try {
        handleClose1();
        // window.location.reload();
        const response = await axios.post(
          "/getDateDaytype", `DATE=${selectedDate.format("YYYY-MM-DD")}&DAY_TYPE=${dayType}`,

        );
        
        toast.success('Submitted Successfully');
        // window.location.reload(true);
      } catch (error) {
        toast.error("Internal Server Error");

      }
      
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await instance.get(
          // `/getDayType/${selectedDate.format("YYYY-MM-DD")}`,

        // );
        let Day_type_now;

        // if (response.data.length > 0) {
          // Day_type_now = response.data[0].dayType;
          // setFetchedDayType(response.data[0].dayType);
          // setDayType(response.data[0].dayType);
        // }
        // else {
          Day_type_now = "Normal Day";
          setFetchedDayType(null);
          setDayType("Normal Day");
        // }
        onDateChange([selectedDate, Day_type_now]);
      } catch (error) {
        toast.error("Error Fetching Day Type");
      }


    };
    fetchData();

  }, [selectedDate]);

  return (
    <Grid container sx={{ width: '63.625rem', display: 'flex', justifyContent: 'space-evenly' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid item sx={{ width: '20.25rem', display: 'flex' }}>
          <Box
            sx={{
              display: "flex", // Add flex display
              alignItems: "center", // Center align items vertically
              width: "20.875rem",
              backgroundColor: colors.grey[200],
              borderRadius: 2,
              mx: "1.25rem",
              height: "3rem",
            }}
          >
            <InputLabel
              sx={{
                lineHeight: "1.643rem !important",
                mb: "1.25rem !important",
                height: "2rem",
                marginRight: "0.5rem", // Add margin to separate from the icon
                ml: "0.5rem",
                fontSize: "1.125rem",
                mt: "1.688rem",
                color: colors.grey[850],
              }}
            >
              Date :
            </InputLabel>
            <DatePicker
              maxDate={dayjs().add(1, "day")}
              value={selectedDate}
              onChange={handleDateChange}
              format="YYYY/MM/DD"
              fontSize="18px"
              slotProps={{
                popper: {
                  sx: {
                    ".MuiPaper-root": {
                      //  border: "1px solid blue",
                      borderRadius: "4px",

                    },
                    " .css-1k4oq0i-MuiPaper-root-MuiPickersPopper-paper": {
                      boxShadow: "none",

                    },
                    'button.MuiButtonBase-root.MuiPickersDay-root.Mui-selected.MuiPickersDay-dayWithMargin.css-wwzkpf-MuiButtonBase-root-MuiPickersDay-root': {
                      borderRadius: '12px !important',
                      backgroundColor: colors.primary.black,
                      color: colors.primary.main
                    },
                    ' .css-10h2jil-MuiButtonBase-root-MuiPickersDay-root.Mui-selected': {
                      borderRadius: '12px !important',
                      backgroundColor: colors.primary.black,
                      color: colors.primary.main

                    },
                    ' .css-z34i7h-MuiButtonBase-root-MuiPickersDay-root.Mui-selected': {
                      borderRadius: '12px !important',
                      // background: colors.primary.light
                    },
                    ".css-1vhkp4d-MuiButtonBase-root-MuiPickersDay-root.Mui-selected":
                    {
                      backgroundColor: colors.primary.black,
                      color: colors.primary.main,
                      borderRadius: "10px",
                    },
                    '.css-10h2jil-MuiButtonBase-root-MuiPickersDay-root:not(.Mui-selected)': {
                      borderRadius: '12px'
                    },
                    '.css-z34i7h-MuiButtonBase-root-MuiPickersDay-root.Mui-selected': {
                      borderRadius: '12px',
                      backgroundColor: `${colors.grey[200]} !important`
                    },
                    '.css-z34i7h-MuiButtonBase-root-MuiPickersDay-root.Mui-selected:hover': {
                      borderRadius: '12px',
                      backgroundColor: colors.grey[200]
                    },
                    '.css-13urpcw-MuiButtonBase-root-MuiPickersDay-root': {
                      borderRadius: '12px'
                    },
                    ".css-tn4x24-MuiButtonBase-root-MuiPickersDay-root.Mui-selected":
                    {
                      backgroundColor: colors.primary.black,
                      color: colors.primary.main,
                      borderRadius: "10px",
                    },

                  },
                },
              }}
              sx={{
                borderRadius: "1.563rem",
                width: "8.75rem", // Adjust as needed
                border: "none",
                marginLeft: 'auto',
               
                "& .MuiInputLabel-root": {
                  display: "none", // Hide the default label
                },
                "& .css-nxo287-MuiInputBase-input-MuiOutlinedInput-input": {
                  height: "0.938rem !important",
                },
                "& .css-1h14m6r-MuiInputBase-root-MuiOutlinedInput-root": {
                  paddingRight: "0.625rem"
                },
                "& .css-1h9uykw-MuiInputBase-input-MuiOutlinedInput-input": {
                  padding:"0px !important" 

                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "transparent",
                  },
                  "&:hover fieldset": {
                    borderColor: "transparent",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "transparent",
                  },
                },
              }}
              renderInput={(params) => (
                <input
                  {...params.inputProps}
                  style={{
                    height: ".1em",
                    border: "none",
                    width: "100%", // Adjust to fill the available space
                  }}
                />
              )}
            />
          </Box>
        </Grid>
        <Grid item sx={{ width: '19rem', display: 'flex' }}>
          <Box
            sx={{
              width: "20rem",
              backgroundColor: colors.grey[200],
              borderRadius: 2,
              mx: "0.063rem",
              height: "3.125rem",
            }}
          >
            {selectedDate && (
              <Grid item>
                <Box
                  sx={{
                    borderRadius: "1.25rem",

                    padding: "0.625rem",
                    height: "2.375rem",
                    width: "11.875rem",

                    // marginLeft: "1.125rem",
                  }}
                >
                  <Typography
                    variant="body1"
                    color="black"
                    sx={{
                      fontFamily: "Poppins,sans-serif",
                      color: colors.grey[850],
                      fontSize: "1.063rem",
                    }}
                  >
                    Day : {dayjs(selectedDate).format("dddd")}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Box>
        </Grid>
        <Grid item sx={{ width: '20rem', display: 'flex'}}>
          <Box
            sx={{
              width: "18rem",
              backgroundColor: colors.grey[200],
              borderRadius: "0.625rem",
              ml: "1.25rem",
            }}
          >
            <Box
              sx={{
                borderRadius: "10px",
                padding: "0.438rem",
                width: "20rem",
                height: "3.125rem",
                backgroundColor: colors.grey[200],
                display: "flex",
              }}
            >
              <InputLabel
                sx={{
                  color: "black",
                  marginTop: "0.25rem",
                  pr: "0px",
                  fontFamily: "Poppins,sans-serif",
                  color: colors.grey[850],
                  fontSize: "1.063rem",
                  mt: "0.313rem",
                  ml: "0.313rem",
                }}
              >
                Day Type :
              </InputLabel>
              <FormControl
                sx={{
                  color: "transparent",
                  justifySelf: "end",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: "transparent",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "transparent",
                    },
                  },
                }}
              >
                <Select
                  value={fetchedDayType !== null ? fetchedDayType : "Normal Day"}
                  onChange={handleDayTypeChange}
                  sx={{
                    marginTop: "0px",
                    marginBottom: "0.313rem",
                    height: "2.188rem",
                    width: "12rem",
                    color: "black",
                    lineHeight: "none",
                    justifySelf: "end",
                    fontSize: "1.063rem",
                    color: colors.grey[850],
                    "& .css-13hrkwz-MuiFormLabel-root-MuiInputLabel-root": {
                      width: "5.95rem",
                      maxWidth: "40%",
                    },
                    "& .css-11u53oe-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.css-11u53oe-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.css-11u53oe-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input": {
                      paddingRight: "0px"
                    },
                    "& .css-v3zyv7-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.css-v3zyv7-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.css-v3zyv7-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input": {
                      paddingRight: "0px"
                    },
                    "& .css-11u53oe-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input, .css-v3zyv7-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input": {
                      padding: "1.031rem 0.313rem"
                    },
                    "& .css-hfutr2-MuiSvgIcon-root-MuiSelect-icon, .css-bpeome-MuiSvgIcon-root-MuiSelect-icon, .css-1wu7ecg-MuiSvgIcon-root-MuiSelect-icon, .css-gofekn-MuiSvgIcon-root-MuiSelect-icon": {
                      right: "12px"
                    },
                  }}
                >
                  <MenuItem value="Normal Day">Normal Day</MenuItem>
                  <MenuItem value="Medium Load Day">Medium Load Day</MenuItem>
                  <MenuItem value="Holiday"> Holiday</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Grid>
      </LocalizationProvider>
      {/* <Grid item sx={{ width: '2.375rem' }}>
        <Box>
          <Box>
            <Checkbox
              checked={isSubChecked}  // Ensure this is correctly bound to the state variable
              onChange={handleMainCheckboxChange}
              sx={{
                // marginLeft: "1.25rem",
                width: "18px",
                height: "18px",
                marginTop: "0.938rem",
                "& .css-i4bv87-MuiSvgIcon-root": {
                  fill: colors.primary.black
                }
              }}
            />
          </Box>
          {isSubChecked && (
            <Popover
              id={id}
              open={open1}
              // anchorEl={containerEl}
              onClose={handleClose1}
              sx={{
                position: 'absolute',
                top: "50%",
                left: "50%",
                transform: "translate(-20%, -30%)",

              }}


           
            >
              <Box sx={{ modStyle1 }}>
                <label
                  style={{
                    // display: "flex",
                    width: "400px",
                    textAlign: 'initial',
                    padding: "20px"
                  }}
                >
                  <Checkbox
                    onChange={handleCheckboxChange}

                    sx={{

                      // height: "0px !important",
                      // margin: "0px",
                      // padding: "0px"
                      // "& .css-1x51dt5-MuiInputBase-input-MuiInput-input": {
                      //   height: "15px !important"
                      // },
                      "& .css-i4bv87-MuiSvgIcon-root": {
                        fill: colors.primary.black
                      },
                    }}
                  />
                  Tick this checkbox if you permanently want to declare <strong>{selectedDate.format("YYYY-MM-DD")}</strong> as <strong>{dayType}</strong>
                </label>
                <Box
                  sx={{ marginBottom: "20px", ml: '3.125rem' }}
                >
                  <Button
                    sx={{
                      backgroundColor: colors.primary.black,
                      borderRadius: "12px",
                      width: "100px",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      lineHeight: 1.75,
                      textTransform: "uppercase",
                      minWidth: "64px",
                      paddingTop: "6px",
                      paddingBottom: "6px",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      marginLeft: "36px",
                      "&:hover": {
                        backgroundColor: colors.primary.black,
                      }
                    }}
                    onClick={handleClose1}

                  >
                    Close
                  </Button>
                  {isChecked ? (
                    <Button
                      sx={{
                        backgroundColor: colors.primary.black,
                        borderRadius: "12px",
                        width: "100px",
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        lineHeight: 1.75,
                        textTransform: "uppercase",
                        minWidth: "64px",
                        paddingTop: "6px",
                        paddingBottom: "6px",
                        paddingLeft: "8px",
                        paddingRight: "8px",
                        marginLeft: "36px",
                        "&:hover": {
                          backgroundColor: colors.primary.black,
                        }
                      }}

                      onClick={handleSubmit1}>
                      Submit
                    </Button>
                  ) : (
                    <Button disabled
                      onClick={handleSubmit1}
                      sx={{
                        backgroundColor: colors.grey[200],
                        borderRadius: "12px",
                        width: "100px",
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        lineHeight: 1.75,
                        textTransform: "uppercase",
                        minWidth: "64px",
                        paddingTop: "6px",
                        paddingBottom: "6px",
                        paddingLeft: "8px",
                        paddingRight: "8px",
                        marginLeft: "36px"
                      }}
                    >
                      Submit
                    </Button>
                  )}
                </Box>
              </Box>
            </Popover>
          )}
        </Box>
      </Grid> */}

      {/* <Grid item sx={{ width: '13.625rem' }}>
        <Button
          onClick={handleOpen}
          // style={buttonStyle}
          className="hey"
          variant="contained"
          sx={{
            backgroundColor: colors.primary["black"],
            width: "12.5rem",
            height: "2.9rem",
            ml: "1.125rem",
            borderRadius: "0.625rem",
            textTransform: "none",

            p: "0.313rem",
            color: colors.primary["light"],
            fontSize: "0.875rem",
            // display: "flex",
            // width: "225px",
            // flexDirection: "column",
            // justifyContent: "center",
            // alignSelf: "stretch",
            // color: "#FFF",
            // textAlign: "center",
            fontFamily: "Poppins, sans-serif",
            fontStyle: "normal",
            fontWeight: "400",
            lineHeight: "100%",
            "& .css-knqc4i-MuiDialogActions-root > :not(style) ~ :not(style) ":
            {
              backgroundColor: colors.primary["black"],
            },

            "& .css-8w2k8s-MuiButtonBase-root": {
              backgroundColor: colors.primary["black"],
            },
          }}
        >
          Compare with Past Results
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,

              boxShadow: 24,
              p: 4,
            }}
          >
            <MultipleDatesPicker
              open={open}
              // disabledDates={disableDatesFromTomorrow}
              selectedDates={MultipleselectedDates}

              onCancel={() => setOpen(false)}
              onSubmit={handleSubmit}
              slotProps={{
                popper: {
                  sx: {
                    "& .css-tdgrs5-MuiButtonBase-root": {
                      backgroundColor: "orange !important",
                    },
                  },
                },
              }}
            />
          </Box>
        </Modal>

      </Grid> */}
    </Grid>
  );
}