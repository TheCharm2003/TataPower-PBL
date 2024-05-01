import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Box,
  Modal,
  IconButton,
  useTheme,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from '@mui/icons-material/Close';
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import Thermostat from "@mui/icons-material/Thermostat";
import LineChart from "../../Components/LineChart";
import Calculation from "../../Components/Calculation";
import dayjs from "dayjs";
import "./pastresult.css";
import { tokens } from "../../theme";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
// import instance from "../../middleware";
import { toast } from "react-toastify";
import axios from "axios";


const Pastresult = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 900,
    height: 600,
    backgroundColor: colors.primary.main,
    boxShadow: 24,
    p: 4,
  };

  const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, "day"));
  const [dayType, setDayType] = useState(null);
  const [maeData, setMaeData] = useState(0);
  const [maxError, setMaxError] = useState(null);
  const [minError, setMinError] = useState(null);
  const [data, setData] = useState({ getData: null, predictLoad: null });
  const [chartData, setChartData] = useState(null);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isTempModalOpen, setIsTempModalOpen] = useState(false);
  const [isHumidityModalOpen, setIsHumidityModalOpen] = useState(false);
  const [mape, setMape] = useState(null);
  const handleMinErrorChange = (minErrorValue) => {
    setMinError(minErrorValue);
  };

  const handleMaxErrorChange = (maxErrorValue) => {
    setMaxError(maxErrorValue);
  };
  const handleMapeError = (MapeErr) => {
    setMape(MapeErr)
  }
  const toggleLoadModal = () => {
    setIsLoadModalOpen(!isLoadModalOpen);
  };

  const toggleTempModal = () => {
    setIsTempModalOpen(!isTempModalOpen);
  };

  const toggleHumidityModal = () => {
    setIsHumidityModalOpen(!isHumidityModalOpen);
  };


  const fetchChartData = async (selectedDate, dayType) => {
    if (selectedDate && dayType !== null) {
      try {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD")
        const getDataResponse = await axios.post(
          "http://127.0.0.1:8000/getData",
          `DATE=${formattedDate}&SPECIALDAY=${dayType}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        const predictLoadResponse = await axios.post(
          "http://127.0.0.1:8000/predictLoad",
          `DATE=${formattedDate}&SPECIALDAY=${dayType}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        const jsonData1 = getDataResponse.data.blocks;
        const jsonData = predictLoadResponse.data.blocks;
        setData({ getData: jsonData1, predictLoad: jsonData });
        setChartData(jsonData, jsonData1);
      } catch (error) {
        toast.error("No Data Available:", error);
      }
    }
  };

  useEffect(() => {
    fetchChartData(selectedDate, dayType);
  }, [dayType]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await axios.get(
        //   `http://127.0.0.1:8000/getDayType/${selectedDate.format("YYYY-MM-DD")}`,
        // );
        // if (response.data.length > 0) {
        //   setDayType(response.data[0].dayType)
        // } else {
        setDayType("Normal Day")
        // };
      } catch (error) {
        toast.error("No Data Available");
      }
    };
    fetchMaeRange(selectedDate);
    fetchData();
  }, [selectedDate]);

  const fetchMaeRange = async (selectedDate) => {
    try {
      const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
      console.log(selectedDate);

      const response = await axios.post(
        "http://127.0.0.1:8000 /getMAERange",
        `FROM=${formattedDate}&TO=${formattedDate}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      if (response.data && response.data.maes) {
        setMaeData(response.data.maes[0]);
      }
    } catch (error) {
      toast.error("Error Fetching MAE Range:", error);
      setMaeData(0);
    }
  };

  const handleDateChange = (newDate) => {
    const startDate = dayjs("2020-01-01");
    const endDate = dayjs().subtract(1, "day");
    const selected = dayjs(newDate);
    if (selected.isBefore(startDate) || selected.isAfter(endDate)) {
      console.log("Selected date is out of range");
      return;
    }
    setDayType(null);
    setSelectedDate(newDate);

  };

  const handleDayTypeChange = (event) => {
    const newDayType = event.target.value;
    setDayType(newDayType);
  };

  return (
    <div style={{
      marginLeft: '0.313rem'
    }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          borderRadius: "20px",
          width: "75rem",
          alignItems: "center",
          marginTop: "7.2rem",
          position: "relative",
          top: 0,
          zIndex: 0,
          height: "5rem",
          backgroundColor: colors.primary.main,
          boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[100]}`,
        }}
      >
        <Grid container>
          <Grid item>
            <div style={{ display: "flex", alignItems: "center", marginLeft: "0rem" }}>
              <Typography
                sx={{
                  marginTop: "0.313rem",
                  marginRight: "0.625rem",
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  marginLeft: "1.3rem",
                  fontFamily: "Poppins,sans-serif",
                  color: colors.primary.dark,
                }}
              >
                Previous Result
              </Typography>

            </div>
          </Grid>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid item>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "18.8rem",
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
                    marginRight: "0.5rem",
                    ml: "0.5rem",
                    fontSize: "1.125rem",
                    mt: "1.688rem",
                    color: colors.grey[850],
                  }}
                >
                  Date :
                </InputLabel>
                <DatePicker
                  maxDate={dayjs()}
                  value={selectedDate}
                  onChange={handleDateChange}
                  format="YYYY/MM/DD"
                  fontSize="1.125rem"
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
                    width: "14.5rem",
                    border: "none",
                    marginTop: '0.188rem',
                    "& .MuiInputLabel-root": {
                      display: "none",
                    },
                    "& .css-nxo287-MuiInputBase-input-MuiOutlinedInput-input": {
                      height: "0.938rem !important",
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
                    " & .css-nxo287-MuiInputBase-input-MuiOutlinedInput-input ": {
                      padding: '0rem !important'
                    },
                    "& .css-10iautd-MuiFormControl-root-MuiTextField-root ": {
                      marginLeft: '0rem !important'
                    }
                  }}
                  renderInput={(params) => (
                    <input
                      {...params.inputProps}
                      style={{
                        height: ".1em",
                        border: "none",
                        width: "100%",
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid item>
              <Box
                sx={{
                  width: "18.8rem",
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
                        width: "14.875rem",

                        marginLeft: "1.125rem",
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
            <Grid item>
              <Box
                sx={{
                  width: "14.375rem",
                  backgroundColor: colors.grey[200],
                  borderRadius: "0.625rem",
                  ml: "1rem",
                }}
              >
                <Box
                  sx={{
                    borderRadius: "10px",
                    padding: "0.438rem",
                    width: "18.8rem",
                    height: "3.125rem",
                    backgroundColor: colors.grey[200],
                    display: "flex",
                  }}
                >
                  <InputLabel
                    sx={{
                      color: "black",
                      marginTop: "0.25rem",
                      paddingRight: "0rem",
                      fontFamily: "Poppins,sans-serif",
                      color: colors.grey[850],
                      fontSize: "1.063rem",
                      marginTop: "0.313rem",
                      marginLeft: "0.313rem",
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
                      value={dayType !== null ? dayType : "Normal Day"}
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
                          right: "-10px"
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
        </Grid>
      </Box>
      <Grid container sx={{ marginTop: "1.875rem", width: '76.388rem' }}>
        <Grid item sx={{ width: '24rem' }}>
          <Box
            sx={{
              backgroundColor: colors.primary.main,
              display: "flex",
              flexDirection: "column",
              borderRadius: "1.25rem",
              width: "24rem",
              justifyContent: 'flex-start',
              alignItems: "center",
              position: "relative",
              top: 0,
              height: "21.875rem",
              boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[100]}`,
            }}
          >
            <Typography
              display="flex"
              variant="h2"
              style={{
                fontSize: "1.563rem",
                fontWeight: "600",
                marginTop: "1.75rem",
                fontFamily: "Poppins,sans-serif",
                color: colors.grey[900],
                display: "flex",
              }}
            >Load
            </Typography>

            <IconButton
              onClick={toggleLoadModal}
              sx={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
              }}
            >
              <FullscreenIcon />
            </IconButton>
            <LineChart
              selectedDate={selectedDate}
              dayType={dayType}
              metric="wdLoad"
              margins={{ top: 10, right: 30, bottom: 90, left: 70 }}
              yDomain={[0, 100]}
              legend="Load"
              color1={["#FF8080", "#919191", colors.primary.dark]}
              pointColor=" rgba(0,0,0,0)"
              actualData={data.getData}
              predictedData={data.predictLoad}
              chartData={chartData}
              expandedView
              pointFaceColor="rgba(255,255,255)"
              pointSize={2}
              lineWidth={1}
              pointWidth={1}
              pointBorderColor={{ from: "serieColor" }}
            />
            <Typography
              sx={{
                fontSize: "15px",
                lineHeight: "2px",
                fontWeight: "600",
                position: 'relative',
              }}
            >
              {selectedDate.format("YYYY-MM-DD")}
            </Typography>
          </Box>
          <Box>
            <Modal
              open={isLoadModalOpen}
              onClose={toggleLoadModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              sx={{
                "& .css-i9fmh8-MuiBackdrop-root-MuiModal-backdrop": {
                  backdropFilter: "blur(2px)",
                },
              }}
            >
              <Box sx={modalStyle} >
                <Typography
                  sx={{
                    fontSize: "20px",
                    lineHeight: "2px",
                    fontWeight: "600",
                    display: 'flex',
                    justifyContent: "center"
                  }}
                >
                  {selectedDate.format("YYYY-MM-DD")}
                </Typography>
                <LineChart
                  selectedDate={selectedDate}
                  dayType={dayType}
                  metric="wdLoad"
                  margins={{ top: 80, right: 10, bottom: 90, left: 50 }}
                  yDomain={[0, 100]}
                  legend="Load"
                  color1={["#FF8080", "#919191", colors.primary.dark]}
                  pointColor=" rgba(0,0,0,0)"
                  pointFaceColor="rgba(255,255,255)"
                  pointSize={2}
                  lineWidth={1}
                  pointWidth={1}
                  pointBorderColor={{ from: "serieColor" }}
                  actualData={data.getData}
                  predictedData={data.predictLoad}
                  chartData={chartData}

                  expandedView
                />
                <IconButton
                  onClick={toggleLoadModal}
                  sx={{
                    position: "absolute",
                    top: "0.625rem",
                    right: "0.625rem",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Modal>
          </Box>
        </Grid>
        <Grid item sx={{ ml: 2, width: '25rem' }}>
          <Box
            sx={{
              backgroundColor: colors.primary.main,
              display: "flex",
              flexDirection: "column",
              borderRadius: "1.25rem",
              width: "25rem",
              justifyContent: "flex-start",
              alignItems: "center",
              position: "relative",
              top: 0,
              height: "21.875rem",
              boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[100]}`,
            }}
          >
            <Typography
              display="flex"
              variant="h2"
              style={{
                fontSize: "1.563rem",
                fontWeight: "600",
                marginTop: "1.75rem",
                fontFamily: "Poppins,sans-serif",
                color: colors.grey[900],
                display: "flex",
                // marginBottom: "1.5rem"
              }}
            >
              Temperature
            </Typography>
            <IconButton
              onClick={toggleTempModal}
              sx={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
              }}
            >
              <FullscreenIcon />
            </IconButton>
            <LineChart
              selectedDate={selectedDate}
              dayType={dayType}
              metric="temp"
              actualData={data.getData}
              predictedData={data.predictLoad}
              margins={{ top: 10, right: 30, bottom: 90, left: 70 }}
              legend="Temperature"
              color1={["#FF8080", "#F3C699", "#E07001"]}
              pointColor=" rgba(0,0,0,0)"
              pointFaceColor="rgba(255,255,255)"
              pointSize={2}
              lineWidth={1}
              pointWidth={1}
              pointBorderColor={{ from: "serieColor" }}
              chartData={chartData}
              containercolor={["#FF8080", "#F3C699", "#E07001"]}
            />
            <Typography
              sx={{
                fontSize: "15px",
                lineHeight: "2px",
                fontWeight: "600",
                position: 'relative',
              }}
            >
              {selectedDate.format("YYYY-MM-DD")}
            </Typography>
          </Box>
          <Box>
            <Modal
              open={isTempModalOpen}
              onClose={toggleTempModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              sx={{
                "& .css-i9fmh8-MuiBackdrop-root-MuiModal-backdrop": {
                  backdropFilter: "blur(2px)",
                },
              }}
            >
              <Box sx={modalStyle}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    lineHeight: "2px",
                    fontWeight: "600",
                    display: 'flex',
                    justifyContent: "center"
                  }}
                >
                  {selectedDate.format("YYYY-MM-DD")}
                </Typography>
                <LineChart
                  selectedDate={selectedDate}
                  dayType={dayType}
                  metric="temp"
                  actualData={data.getData}
                  predictedData={data.predictLoad}
                  margins={{ top: 80, right: 0, bottom: 70, left: 50 }}
                  legend="Temperature"
                  color1={["#FF8080", "#F3C699", "#E07001"]}
                  pointColor=" rgba(0,0,0,0)"
                  pointFaceColor="rgba(255,255,255)"
                  pointSize={2}
                  lineWidth={1}
                  pointWidth={1}
                  pointBorderColor={{ from: "serieColor" }}
                  chartData={chartData}
                />
                <IconButton
                  onClick={toggleTempModal}
                  sx={{
                    position: "absolute",
                    top: "0.625rem",
                    right: "0.625rem",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Modal>
          </Box>
        </Grid>
        <Grid item sx={{ ml: 2, width: '23.688rem' }}>
          <Box
            sx={{
              backgroundColor: colors.primary.main,
              display: "flex",
              flexDirection: "column",
              borderRadius: "1.25rem",
              width: "23.688rem",
              justifyContent: "flex-start",
              alignItems: "center",
              position: "relative",
              top: 0,
              height: "21.875rem",
              boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[100]}`,
            }}
          >
            <Typography
              display="flex"
              variant="h2"
              style={{
                fontSize: "1.563rem",
                fontWeight: "600",
                marginTop: "1.75rem",
                fontFamily: "Poppins,sans-serif",
                color: colors.grey[900],
                display: "flex",
              }}
            >
              Humidity
            </Typography>
            <IconButton
              onClick={toggleHumidityModal}
              sx={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
              }}
            >
              <FullscreenIcon />
            </IconButton>
            <LineChart
              selectedDate={selectedDate}
              dayType={dayType}
              metric="rh"
              margins={{ top: 4, right: 30, bottom: 90, left: 70 }}
              actualData={data.getData}
              predictedData={data.predictLoad}
              legend="Humidity"
              color1={["#FF8080", "#CAC7F2", "#7A73DE"]}
              pointColor=" rgba(0,0,0,0)"
              pointFaceColor="rgba(255,255,255)"
              pointSize={2}
              lineWidth={1}
              pointWidth={1}
              pointBorderColor={{ from: "serieColor" }}
              chartData={chartData}
            />
            <Typography
              sx={{
                fontSize: "15px",
                lineHeight: "2px",
                fontWeight: "600",
                position: 'relative',
              }}
            >
              {selectedDate.format("YYYY-MM-DD")}
            </Typography>
          </Box>
          <Box>

            <Modal
              open={isHumidityModalOpen}
              onClose={toggleHumidityModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              sx={{
                "& .css-i9fmh8-MuiBackdrop-root-MuiModal-backdrop": {
                  backdropFilter: "blur(2px)",
                },
              }}
            >
              <Box sx={modalStyle}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    lineHeight: "2px",
                    fontWeight: "600",
                    display: 'flex',
                    justifyContent: "center"
                  }}
                >
                  {selectedDate.format("YYYY-MM-DD")}
                </Typography>
                <LineChart
                  selectedDate={selectedDate}
                  dayType={dayType}
                  metric="rh"
                  margins={{ top: 80, right: 0, bottom: 70, left: 50 }}
                  actualData={data.getData}
                  predictedData={data.predictLoad}
                  legend="Humidity"
                  color1={["#FF8080", "#CAC7F2", "#7A73DE"]}
                  pointColor=" rgba(0,0,0,0)"
                  pointFaceColor="rgba(255,255,255)"
                  pointSize={2}
                  lineWidth={1}
                  pointWidth={1}
                  pointBorderColor={{ from: "serieColor" }}
                  chartData={chartData}
                />
                <IconButton
                  onClick={toggleHumidityModal}
                  sx={{
                    position: "absolute",
                    top: "0.625rem",
                    right: "0.625rem",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Modal>
          </Box>
        </Grid>
      </Grid>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "1.875rem",
          gap: "0.313rem",
        }}
      ></div>
      <Grid item>
        <Grid container sx={{ width: "100%" }}>
          <Grid item>
            <Box
              sx={{
                backgroundColor: colors.grey[450],
                borderRadius: 7,
                height: "6.25rem",
                width: "14.063rem",
                mr: "1.125rem",
                display: "flex",
                boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[200]}`,
              }}
            >
              <Box sx={{ pt: "1.25rem", pl: "1.25rem" }}>
                <FlashOnIcon
                  sx={{
                    backgroundColor: colors.primary.black,
                    color: colors.primary.main,
                    padding: "0.313rem",
                    width: '2rem',
                    height: '2rem',
                    borderRadius: "8px",
                  }}
                />
              </Box>
              <Box sx={{ marginLeft: "2rem", marginTop: "1.25rem" }}>
                <Typography
                  variant="h5"
                  sx={{ fontSize: "1.25rem", fontWeight: "bold" }}
                >
                  {mape !== null ? mape : "N/A"} %
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.938rem",
                    marginTop: "0.625rem",
                    flex: "none",
                  }}
                >
                  Load MAPE
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item>
            <Box
              sx={{
                backgroundColor: colors.orange[100],
                borderRadius: 7,
                height: "6.25rem",
                width: "14.063rem",
                mr: "1.125rem",
                display: "flex",
                boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[200]}`,
              }}
            >
              <Box sx={{ pt: "1.25rem", pl: "1.25rem" }}>
                <Thermostat
                  sx={{
                    backgroundColor: colors.primary.black,
                    color: colors.primary.main,
                    padding: "0.313rem",
                    borderRadius: "8px",
                    width: '2rem',
                    height: '2rem',
                  }}
                />
              </Box>
              <Box sx={{ marginLeft: "2rem", marginTop: "1.25rem" }}>
                <Typography
                  variant="h5"
                  sx={{ fontSize: "1.25rem", fontWeight: "bold" }}
                >
                  {Number(maeData.mae_temp !== null ? maeData.mae_temp : 0)
                    .toFixed(2)
                    .toString()}{" "}
                  %
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.938rem",
                    marginTop: "0.15rem",
                    flex: "none",
                    marginLeft: 'none'
                  }}
                >
                  Temperature
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.938rem",
                    flex: "none",
                    marginLeft: '0.2rem'
                  }}
                >
                  MAPE
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item>
            <Box
              sx={{
                backgroundColor: colors.purple[200],
                borderRadius: 7,
                height: "6.25rem",
                width: "14.063rem",
                mr: "1.125rem",
                display: "flex",
                boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[200]}`,
              }}
            >
              <Box sx={{ pt: "1.25rem", pl: "1.25rem" }}>
                <WaterDropIcon
                  sx={{
                    backgroundColor: colors.primary.black,
                    color: colors.primary.main,
                    padding: "0.313rem",
                    borderRadius: "8px",
                    width: '2rem',
                    height: '2rem',
                  }}
                />
              </Box>
              <Box sx={{ marginLeft: "2rem", marginTop: "1.25rem" }}>
                <Typography
                  variant="h5"
                  sx={{ fontSize: "1.25rem", fontWeight: "bold" }}
                >
                  {Number(maeData !== null ? maeData.mae_rh : "N/A")
                    .toFixed(2)
                    .toString()}{" "}
                  %

                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.938rem",
                    marginTop: "0.625rem",
                    flex: "none",
                  }}
                >
                  Humidity MAPE
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item>
            <Box
              sx={{
                backgroundColor: colors.red[100],
                borderRadius: 7,
                height: "6.25rem",
                width: "14.063rem",
                mr: "1.125rem",
                display: "flex",
                boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[200]}`,

              }}
            >
              <Box sx={{ pt: "1.25rem", pl: "1.25rem" }}>
                <FlashOnIcon
                  sx={{
                    backgroundColor: colors.primary.black,
                    color: colors.primary.main,
                    padding: "0.313rem",
                    borderRadius: "8px",
                    width: '2rem',
                    height: '2rem',
                  }}
                />
              </Box>
              <Box sx={{ marginLeft: "2rem", marginTop: "1.25rem" }}>
                <Typography
                  variant="h5"
                  sx={{ fontSize: "1.25rem", fontWeight: "bold" }}
                >
                  {maxError !== null ? maxError.toFixed(2) : "N/A"} MW
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.938rem",
                    marginTop: "0.625rem",
                    flex: "none",
                  }}
                >
                  Max Error
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item>
            <Box
              sx={{
                backgroundColor: colors.red[100],
                borderRadius: 7,
                height: "6.25rem",
                width: "14.063rem",
                mr: "1.125rem",
                display: "flex",
                boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[200]}`,
              }}
            >
              <Box sx={{ pt: "1.25rem", pl: "1.25rem" }}>
                <FlashOnIcon
                  sx={{
                    backgroundColor: colors.primary.black,
                    color: colors.primary.main,
                    padding: "0.313rem",
                    borderRadius: "8px",
                    width: '2rem',
                    height: '2rem',
                  }}
                />
              </Box>
              <Box sx={{ marginLeft: "2rem", marginTop: "1.25rem" }}>
                <Typography
                  variant="h5"
                  sx={{ fontSize: "1.25rem", fontWeight: "bold" }}
                >
                  {minError !== null ? minError.toFixed(2) : "N/A"} MW
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.938rem",
                    marginTop: "0.625rem",
                    flex: "none",
                  }}
                >
                  Min Error
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Grid>
      <Calculation
        selectedDate={selectedDate}
        dayType={dayType}
        onMaxErrorChange={handleMaxErrorChange}
        onMinErrorChange={handleMinErrorChange}
        onMapeErrorChange={handleMapeError}
      />
    </div>
  );
};

export default Pastresult;