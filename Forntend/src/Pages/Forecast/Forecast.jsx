import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import Thermostat from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { useTheme, IconButton, Modal } from "@mui/material";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FirstComponent from "../../Components/DatePicker";
import PredictTable from "../../Components/PredictTable";
import Linetest from "../../Components/Linetest";
import axios from "axios";
// import instance from "../../middleware";
// import '../../Components/multi.css'
function Forecast() {
  
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    height: 700,
    // bgcolor: "background.paper",
    backgroundColor:colors.primary.main,
    boxShadow: 24,
    p: 4,
  };
  const [selectedDate, setSelectedDate] = useState();
  const [dayType, setDayType] = useState();
  const [data, setData] = useState({ predictLoad: null });
  const [chartData, setChartData] = useState(null);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isTempModalOpen, setIsTempModalOpen] = useState(false);
  const [isHumidityModalOpen, setIsHumidityModalOpen] = useState(false);

  const [averageValues, setAverageValues] = useState({
    averageTemperature: 0,
    averageHumidity: 0,
    averageLoad: 0,
  });

  const toggleLoadModal = () => {
    setIsLoadModalOpen(!isLoadModalOpen);
  };

  const toggleTempModal = () => {
    setIsTempModalOpen(!isTempModalOpen);
  };

  const toggleHumidityModal = () => {
    setIsHumidityModalOpen(!isHumidityModalOpen);
  };

  const handleAverageValuesChange = (values) => {
    setAverageValues({
      averageTemperature: parseFloat(values.averageTemperature.toFixed(2)),
      averageHumidity: parseFloat(values.averageHumidity.toFixed(2)),
      averageLoad: parseFloat(values.averageLoad.toFixed(2)),
    });
  };

  const handleDateChange = (changes) => {
    let newDate=changes[0];
    let newDayType=changes[1];
    const startDate = dayjs("2020-01-01");
    const endDate = dayjs().add(1, "day");
    const selected = dayjs(newDate);
    if (selected.isBefore(startDate) || selected.isAfter(endDate)) {
      console.log("Selected date is out of range");
      return;
    }
    setSelectedDate(newDate);
    setDayType(newDayType)
  };

  const handleDayTypeChange = (newDayType) => {
    setDayType(newDayType);
  };

  //   try {
  //     const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
  //     console.log(selectedDate);
  //     const token = localStorage.getItem('authority2');
  //     const response = await axios.post(
  //       "http://127.0.0.1:8000/getMAERange",
  //       `FROM=${formattedDate}&TO=${formattedDate}`,
  //       {
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded",
  //           "Authorization": `Bearer ${token}`
  //         },
  //       }
  //     );
  //     if (response.data && response.data.maes) {
  //       setMaeData(response.data.maes[0]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching MAE range:", error);
  //   }
  // };

  const fetchChartData = async (selectedDate, dayType) => {
    if (selectedDate && dayType) {
      try {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
        
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
        const jsonData = predictLoadResponse.data.blocks;
        setData({ predictLoad: jsonData });
        setChartData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    if (selectedDate && dayType){
      fetchChartData(selectedDate, dayType);
    }
  }, [selectedDate, dayType]);
  return (
    <div>
      <Box sx={{ mt: "6.375rem" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            borderRadius: "20px",
            width: "74.875rem",
            alignItems: "center",
            marginTop: "7.2rem",
            position: "relative",
            top: 0,
            marginLeft: "0.313rem",
            zIndex: 0,
            height: "5rem",
            backgroundColor: colors.primary.main,
            boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[100]}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginLeft: "0rem" }}>
            <Typography
              sx={{
                marginTop: "0.313rem",
                fontSize: "1.5rem",
                fontWeight: "600",
                marginLeft: "1.3rem",
                fontFamily: "Poppins,sans-serif",
                color: colors.primary.dark,
              }}
            >
              Forecast for
            </Typography>
            <div>
              <FirstComponent
                onDateChange={handleDateChange}
                onDayTypeChange={handleDayTypeChange}
              />
            </div>
          </div>
        </Box>

        <Grid container sx={{ width: "75.875rem", marginLeft: "0.313rem", marginTop: '2rem' }}>
          <Grid item>
            <Box
              sx={{
                backgroundColor: colors.primary.main,
                display: "flex",
                flexDirection: "column",
                borderRadius: "1.25rem",
                width: "74.875rem",
                justifyContent: "flex-start",
                // alignItems: "center,
                position: "relative",
                top: 0,
                height: "30rem",
                marginRight: '1.5rem',
                boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[100]}`,
              }}
            >
              <Typography
                display="flex"
                variant="h2"
                style={{
                  fontSize: "1.563rem",
                  fontWeight: "600",
                  fontFamily: "Poppins,sans-serif",
                  color: colors.grey[900],
                  display: "flex",
                  marginTop: "2rem",
                  marginLeft: '2rem',

                }}
              >
                Load
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
              <Linetest
                selectedDate={selectedDate}
                dayType={dayType}
                metric="wdLoad"
                margins={{ top: 10, right: 30, bottom: 70, left: 70 }}
                yDomain={[0, 100]}
                legend="Load"
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
                color1={[colors.primary.dark]}
                containercolor={colors.linechart[400]}
              />
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
                <Box sx={modalStyle}>
                  <Linetest
                    selectedDate={selectedDate}
                    dayType={dayType}
                    metric="wdLoad"
                    margins={{ top: 80, right: 0, bottom: 70, left: 50 }}
                    yDomain={[0, 70]}
                    legend="Load"
                    pointColor=" rgba(0,0,0,0)"
                    pointFaceColor="rgba(255,255,255)"
                    pointSize={2}
                    lineWidth={1}
                    pointWidth={1}
                    pointBorderColor={{ from: "serieColor" }}
                    actualData={data.getData}
                    predictedData={data.predictLoad}
                    chartData={chartData}
                    color1={colors.primary.dark}
                    containercolor={colors.linechart[400]}
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
          {/* <Grid item>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                gap: "1.063rem",
                alignSelf: "stretch",
                borderRadius: "24px",
                // background: "#D1D1D1",
                background: colors.grey[480],
                boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[300]}`,
                padding: "1.5rem 1.5rem 1.25rem 1.5rem",
                width: "9.5rem",
                height: "9rem",
              }}
            >
              <Box sx={{ pt: "0rem", pl: "0rem", width: "9.375rem" }}>
                <Box
                  sx={{
                    // backgroundColor: "#444444",
                    backgroundColor: colors.grey[800],
                    width: "1.875rem",
                    height: "1.875rem",
                    borderRadius: "8px",
                    marginBottom: "0.625rem",
                  }}
                >
                  <FlashOnIcon
                    sx={{
                      width: "2rem",
                      height: "2rem",
                      color: "white",
                      padding: "0.313rem",
                      borderRadius: "8px",
                      color: colors.primary["main"],
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    mb: "0.625rem",
                    fontSize: "1.125rem",
                    fontFamily: "Poppins,sans-serif",
                    // color:'#2c2c2c'
                    color: colors.grey[900],
                  }}
                >
                  {averageValues.averageLoad} MW
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontFamily: "Poppins,sans-serif",
                    // color:"#4d4d4d",
                    color: colors.grey[950],
                    mr: "1rem",
                  }}
                >
                  {" "}
                  Avg. Load
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                gap: "1.063rem",
                alignSelf: "stretch",
                borderRadius: "24px",
                // background: "#F6E5D4",
                background: colors.orange[100],
                boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[400]}`,
                padding: "1.5rem 1.5rem 1.25rem 1.5rem",
                width: "9.5rem",
                height: "9rem",
                mt: "1.5rem",

              }}
            >
              <Box
                sx={{
                  paddingTop: "0rem",
                  padl: "0rem",
                  width: "9.375rem",
                }}
              >
                <Box
                  sx={{
                    // backgroundColor: "#444444",
                    backgroundColor: colors.grey[800],
                    width: "1.875rem",
                    height: "1.875rem",
                    borderRadius: "8px",
                    marginBottom: "0.625rem",
                  }}
                >
                  <Thermostat
                    sx={{
                      width: "2.1rem",
                      height: "2rem",
                      color: "white",
                      padding: "0.25rem",
                      borderRadius: "8px",
                      paddingRight: '0.375rem',
                      color: colors.primary["main"],
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    mb: "0.625rem",
                    fontSize: "1.125rem",
                    fontFamily: "Poppins,sans-serif",
                    // color:'#2c2c2c'
                    color: colors.grey[900],
                  }}
                >
                  {averageValues.averageTemperature} °C
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontFamily: "Poppins,sans-serif",
                    // color:"#4d4d4d",
                    color: colors.grey[950],
                    mr: "1rem",
                  }}
                >
                  {" "}
                  Avg. Temp
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                gap: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                mt: "1.5rem",
                alignSelf: "stretch",
                borderRadius: "24px",
                // background: "#E0DFF4",
                background: colors.purple[200],
                boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[500]}`,
                padding: "1.5rem 1.5rem 1.25rem 1.5rem",
                width: "9.5rem",
                height: "9rem",
              }}
            >
              <Box
                sx={{
                  paddingTop: "0rem",
                  paddingLeft: "0rem",
                  width: "9.375rem",
                }}
              >
                <Box
                  sx={{
                    // backgroundColor: "#444444",
                    backgroundColor: colors.grey[800],
                    width: "1.875rem",
                    height: "1.875rem",
                    borderRadius: "8px",
                    marginBottom: "0.625rem",
                  }}
                >
                  <WaterDropIcon
                    sx={{
                      width: "2.1rem",
                      height: "2rem",
                      color: "white",
                      paddingRight: '0.5rem',
                      padding: "0.25rem",
                      borderRadius: "8px",
                      color: colors.primary["main"],
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    mb: "0.625rem",
                    fontSize: "1.125rem",
                    fontFamily: "Poppins,sans-serif",
                    // color:'#2c2c2c'
                    color: colors.grey[900],
                  }}
                >
                  {averageValues.averageHumidity} 
                  %
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontFamily: "Poppins,sans-serif",
                    // color:"#4d4d4d",
                    color: colors.grey[950],
                    marginRight: "1rem",
                  }}
                >
                  {" "}
                  Avg. Humidity
                </Typography>
              </Box>
            </Box>
          </Grid> */}
        </Grid>
        <Grid container sx={{ marginTop: "1.875rem", marginLeft: "0.313rem" }}>

          <Grid item sx={{}}>
            <Box
              sx={{
                backgroundColor: colors.primary.main,
                display: "flex",
                flexDirection: "column",
                borderRadius: "1.25rem",
                width: "36.5rem",
                justifyContent: "flex-start",
                // alignItems: "center",
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
                  // marginBottom: "1.5rem",
                  marginTop: "2rem",
                  marginLeft: '1.875rem',
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
              <Linetest
                selectedDate={selectedDate}
                dayType={dayType}
                metric="temp"
                actualData={data.getData}
                predictedData={data.predictLoad}
                margins={{ top: 5, right: 30, bottom: 80, left: 70 }}
                legend="Temperature"
                pointColor=" rgba(0,0,0,0)"
                pointFaceColor="rgba(255,255,255)"
                pointSize={2}
                lineWidth={1}
                pointWidth={1}
                pointBorderColor={{ from: "serieColor" }}
                color1={[colors.orange[300]]}
                containercolor={colors.linechart[200]}
              // chartData={chartData}
              />
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
                  <Linetest
                    selectedDate={selectedDate}
                    dayType={dayType}
                    metric="temp"
                    actualData={data.getData}
                    predictedData={data.predictLoad}
                    margins={{ top: 80, right: 0, bottom: 70, left: 50 }}
                    legend="Temperature"
                    color1={[colors.orange[300]]}
                    containercolor={colors.linechart[200]}
                    pointColor=" rgba(0,0,0,0)"
                    pointFaceColor="rgba(255,255,255)"
                    pointSize={2}
                    lineWidth={1}
                    pointWidth={1}
                    pointBorderColor={{ from: "serieColor" }}
                  // chartData={chartData}
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
          <Grid item sx={{ marginLeft: '1.5rem' }}>
            <Box
              sx={{
                backgroundColor: colors.primary.main,
                display: "flex",
                flexDirection: "column",
                borderRadius: "1.25rem",
                width: "37rem",
                justifyContent: "flex-start",
                // alignItems: "center",
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
                  marginTop: "2rem",
                  marginLeft: '1.875rem',
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
              <Linetest
                selectedDate={selectedDate}
                dayType={dayType}
                metric="rh"
                yDomain={[0, 70]}
                margins={{ top: 4, right: 30, bottom: 80, left: 70 }}
                actualData={data.getData}
                predictedData={data.predictLoad}
                legend="Humidity"
                color1={[colors.purple["main"]]}
                containercolor={colors.linechart[300]}
                pointColor=" rgba(0,0,0,0)"
                pointFaceColor="rgba(255,255,255)"
                pointSize={2}
                lineWidth={1}
                pointWidth={1}
                pointBorderColor={{ from: "serieColor" }}
              // chartData={chartData}
              />
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
                  <Linetest
                    selectedDate={selectedDate}
                    dayType={dayType}
                    metric="rh"
                    margins={{ top: 80, right: 0, bottom: 70, left: 50 }}
                    actualData={data.getData}
                    predictedData={data.predictLoad}
                    legend="Humidity"
                    color1={[colors.purple.main]}
                    pointColor=" rgba(0,0,0,0)"
                    pointFaceColor="rgba(255,255,255)"
                    pointSize={2}
                    lineWidth={1}
                    pointWidth={1}
                    pointBorderColor={{ from: "serieColor" }}
                  // chartData={chartData}
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
      </Box>
      <Box sx={{ marginLeft: "0.25rem" }}>
        <PredictTable
          selectedDate={selectedDate}
          dayType={dayType}
          onAverageValuesChange={handleAverageValuesChange}
        />
      </Box>
    </div>
  );
}
export default Forecast;