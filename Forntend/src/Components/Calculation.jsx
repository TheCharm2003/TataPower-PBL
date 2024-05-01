import React, { useState, useEffect } from "react";
import {
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Grid,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { tokens } from "../theme";
// import instance from "../middleware";
import { toast } from "react-toastify";
import axios from "axios";

const rowsPerPageOptions = [5, 48, 96];

const Calculation = ({ selectedDate, dayType, onMinErrorChange, onMaxErrorChange,onMapeErrorChange }) => {
  const [tableData, setTableData] = useState([]);
  const [actualData, setActualData] = useState(null);
  const [predictedData, setPredictedData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [minError, setMinError] = useState(null);
  const [maxError, setMaxError] = useState(null);
  const [mape, setMape] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const convertToCSV = () => {
    const header = [
      "Time",
      "Actual Load",
      "Predicted Load",
      "Actual Temperature",
      "Predicted Temperature",
      "Actual Humidity",
      "Predicted Humidity",
      "Load Error",
      "Temperature Error",
      "Humidity Error",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      header.join(",") +
      "\n" +
      tableData.map((row) => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ActualData ${selectedDate.format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedDate && dayType !== null) {
          const formattedDate = selectedDate.format("YYYY-MM-DD");
          const [responseActual, responsePredicted] = await Promise.all([
            axios.post(
              "http://127.0.0.1:8000/getData",
              `DATE=${formattedDate}&SPECIALDAY=${dayType}`,
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            ),
            axios.post(
              "http://127.0.0.1:8000/predictLoad",
              `DATE=${formattedDate}&SPECIALDAY=${dayType}`,
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            ),
          ]);

          if (responseActual.data && responseActual.data.blocks) {
            setActualData(responseActual.data.blocks);
          }

          if (responsePredicted.data && responsePredicted.data.blocks) {
            setPredictedData(responsePredicted.data.blocks);
          }
        }
      } catch (error) {
        toast.error("No Data Available");
      }
    };

    fetchData();
  }, [selectedDate, dayType]);
  const calculateMAPE = () => {
    if (tableData.length === 0) return 0;
  
    const sumMAPE = tableData.reduce((acc, row) => {
      const actual = row.actualLoad;
      const predicted = row.predictedLoad;
      return acc + Math.abs((actual - predicted) / actual);
    }, 0);
  
    return ((sumMAPE / tableData.length) * 100).toFixed(2);
  }


  useEffect(() => {
    if (actualData && predictedData) {
      const mergedData = actualData.map((actualItem, index) => {
        const timestampLabel = timestamps[index].label;
        return timestampLabel !== "None"
          ? {
              datetime: timestampLabel,
              actualLoad: actualItem.wdLoad,
              predictedLoad: predictedData[index].wdLoad,
              actualTemperature: actualItem.temp,
              predictedTemperature: predictedData[index].temp,
              actualHumidity: actualItem.rh,
              predictedHumidity: predictedData[index].rh,
            }
          : null;
      });
  
      const errorData = mergedData.map((row) => ({
        datetime: row.datetime,
        loadError: Math.abs(row.actualLoad - row.predictedLoad),
        tempError: Math.abs(row.actualTemperature - row.predictedTemperature),
        humidityError: Math.abs(row.actualHumidity - row.predictedHumidity),
      }));
  
      const calculatedTableData = mergedData.map((row, index) => ({
        ...row,
        loadError: errorData[index].loadError.toFixed(2),
        tempError: errorData[index].tempError.toFixed(2),
        humidityError: errorData[index].humidityError.toFixed(2),
      }));
  
      setTableData(calculatedTableData);
  
      // Calculate and set min and max errors
      const allErrors = calculatedTableData.map((row) => ({
        loadError: parseFloat(row.loadError),
        tempError: parseFloat(row.tempError),
        humidityError: parseFloat(row.humidityError),
      }));
  
      const maxLoadError = Math.max(...allErrors.map((error) => error.loadError));
      const minLoadError = Math.min(...allErrors.map((error) => error.loadError));
  
      setMinError(minLoadError);
      setMaxError(maxLoadError);
  
      // Calculate and set MAPE
      const sumMAPE = calculatedTableData.reduce((acc, row) => {
        const actual = row.actualLoad;
        const predicted = row.predictedLoad;
        return acc + Math.abs((actual - predicted) / actual);
      }, 0);
  
      const calculatedMAPE = ((sumMAPE / calculatedTableData.length) * 100).toFixed(2);
      setMape(calculatedMAPE);
  
      // Pass MAPE, min, and max errors to the parent component
      onMapeErrorChange(calculatedMAPE);
      onMinErrorChange(minLoadError);
      onMaxErrorChange(maxLoadError);
    }
  }, [actualData, predictedData, onMapeErrorChange, onMinErrorChange, onMaxErrorChange]);
  

  return (
    <CardContent
      sx={{
        // padding: "0rem",
        // marginTop: "2.5rem",
        // width: "74.6rem"
        height: "31.188rem",
        width: "74.063rem",
        marginTop: "1.875rem",
        backgroundColor: colors.primary.main,
        padding: "1.25rem",
        borderRadius: "24px",
        marginBottom: "1.25rem",
        boxShadow: `0rem 0.625rem 2.5rem 0rem ${colors.shadow[100]}`,
      }}
    >
                  
      <Grid container sx={{ display: "flex", justifyContent: 'space-between' }}>
        <Grid item sx={{ display: 'flex' }}>
          <Typography
            sx={{
              fontFamily: "Poppins,sans-serif",
              fontSize: "1.5rem",
              fontWeight: "400",
              display: "flex",
            }}
          >
            Insights Table
          </Typography>
        </Grid>
        <Grid item sx={{ display: "flex" }}>
          <Grid container>
          
            <Grid item>
              <Button
              onClick={convertToCSV}
                sx={{
                  color: colors.primary.dark,
                  fontFamily: "Poppins,sans-serif",
                  textTransform: "none",
                  width: "2.5rem",
                  height: "2.5rem",
                  minWidth: "0.625rem",
                  mb:'0.65rem',
                  // padding: "1rem 2rem",
                  borderRadius: "12px",
                  background: colors.grey[200],
                  // mr: "10px",
                  fontSize: "0.875rem",
                  fontWeight: "400",
                  lineHeight: "1.125rem",
                  textAlign: "center",
                  "&:hover": {
                    color: colors.primary.dark,
                    background: colors.grey[200],
                  },
                  "& .css-d635f9-MuiButtonBase-root-MuiButton-root": {
                    webkitTapHighlightColor: colors.primary["black"],
                  },
                }}
              >
                <DownloadIcon />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <TableContainer component={Paper} sx={{}}>
        <Table sx={{ minWidth: 650,backgroundColor:colors.primary.main }} aria-label="simple table">
          <TableHead style={{}}>
            <TableRow sx={{}}>
              <TableCell id="tablecell" style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: "400", lineHeight: '1.364rem', textAlign: 'center',borderRadius:"10px",backgroundColor:colors.tableborder[100],border :'0.125rem solid rgb(255, 255, 255)',border:'0px',borderLeft:`0.16rem solid ${colors.primary.main}`,borderRight:`0.125rem solid ${colors.primary.main}`  }}>Time</TableCell>
              <TableCell id="tablecell" align="right" style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: "400", lineHeight: '1.364rem', textAlign: 'center',borderRadius:"10px",backgroundColor:colors.tableborder[100],border:'0.125rem solid rgb(255, 255, 255)',border:'0px',borderRight:`0.16rem solid ${colors.primary.main}` }}>Predicted Load</TableCell>
              <TableCell id="tablecell" align="right" style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: "400", lineHeight: '1.364rem', textAlign: 'center',borderRadius:"10px",backgroundColor:colors.tableborder[100],border:'0.125rem solid rgb(255, 255, 255)',border:'0px' ,borderRight:`0.16rem solid ${colors.primary.main}`}}>Actual Load</TableCell>
              <TableCell id="tablecell" align="right" style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: "400", lineHeight: '1.364rem', textAlign: 'center',borderRadius:"10px",backgroundColor:colors.tableborder[100],border:'0.125rem solid rgb(255, 255, 255)',border:'0px' ,borderRight:`0.16rem solid ${colors.primary.main}`}}>Load Error</TableCell>
              <TableCell id="tablecell" align="right" style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: "400", lineHeight: '1.364rem', textAlign: 'center',borderRadius:"10px",backgroundColor:colors.tableborder[100],border:'0.125rem solid rgb(255, 255, 255)',border:'0px',borderRight:`0.16rem solid ${colors.primary.main}` }}>Predicted Temperature</TableCell>
              <TableCell id="tablecell" align="right" style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: "400", lineHeight: '1.364rem', textAlign: 'center',borderRadius:"10px",backgroundColor:colors.tableborder[100],border:'0.125rem solid rgb(255, 255, 255)',border:'0px' ,borderRight:`0.16rem solid ${colors.primary.main}`}}>Actual Temperature</TableCell>
              <TableCell id="tablecell" align="right" style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: "400", lineHeight: '1.364rem', textAlign: 'center',borderRadius:"10px",backgroundColor:colors.tableborder[100],border:'0.125rem solid rgb(255, 255, 255)',border:'0px' ,borderRight:`0.16rem solid ${colors.primary.main}`}}>Temperature Error</TableCell>
              <TableCell id="tablecell" align="right" style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: "400", lineHeight: '1.364rem', textAlign: 'center',borderRadius:"10px",backgroundColor:colors.tableborder[100],border:'0.125rem solid rgb(255, 255, 255)',border:'0px',borderRight:`0.16rem solid ${colors.primary.main}` }} >Predicted Humidity</TableCell>
              <TableCell id="tablecell" align="right" style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: "400", lineHeight: '1.364rem', textAlign: 'center' ,borderRadius:"10px",backgroundColor:colors.tableborder[100],border:'0.125rem solid rgb(255, 255, 255)',border:'0px',borderRight:`0.16rem solid ${colors.primary.main}`}}>Actual Humidity</TableCell>
              <TableCell id="tablecell" align="right" style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: "400", lineHeight: '1.364rem', textAlign: 'center' ,borderRadius:"10px",backgroundColor:colors.tableborder[100],border:'0.125rem solid rgb(255, 255, 255)',border:'0px',borderRight:`0.16rem solid ${colors.primary.main}`}}>Humidity Error</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">{row.datetime}</TableCell>
                  <TableCell align="center">{Number(row.predictedLoad).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(row.actualLoad).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(row.loadError).toFixed(2)}</TableCell>
                  <TableCell align="center">{Number(row.predictedTemperature).toFixed(2)}</TableCell>
                  <TableCell align="center">{Number(row.actualTemperature).toFixed(2)}</TableCell>
                  <TableCell align="center">{Number(row.tempError).toFixed(2)}</TableCell>
                  <TableCell align="center">{Number(row.predictedHumidity).toFixed(2)}</TableCell>
                  <TableCell align="center">{Number(row.actualHumidity).toFixed(2)}</TableCell>
                  <TableCell align="center">{Number(row.humidityError).toFixed(2)}</TableCell>
                </TableRow>
              ))}
 
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{ display: "flex", float: "right", marginTop: "0.313rem" }}>
        <TablePagination
        sx={{
          '& .css-pdct74-MuiTablePagination-selectLabel':{
            marginTop:'0.85rem',
            fontFamily:'Poppins,sans-serif',
            fontWeight:'500'
          },
          '& .css-levciy-MuiTablePagination-displayedRows':{
            marginTop:'0.85rem'
          }
        }}
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={tableData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        
      </div>
    </CardContent>
    
  );
};

export default Calculation;
const timestamps = [
  { label: "00:00", value: 0 },
  { label: "00:15", value: 1 },
  { label: "00:30", value: 2 },
  { label: "00:45", value: 3 },
  { label: "01:00", value: 4 },
  { label: "01:15", value: 5 },
  { label: "01:30", value: 6 },
  { label: "01:45", value: 7 },
  { label: "02:00", value: 8 },
  { label: "02:15", value: 9 },
  { label: "02:30", value: 10 },
  { label: "02:45", value: 11 },
  { label: "03:00", value: 12 },
  { label: "03:15", value: 13 },
  { label: "03:30", value: 14 },
  { label: "03:45", value: 15 },
  { label: "04:00", value: 16 },
  { label: "04:15", value: 17 },
  { label: "04:30", value: 18 },
  { label: "04:45", value: 19 },
  { label: "05:00", value: 20 },
  { label: "05:15", value: 21 },
  { label: "05:30", value: 22 },
  { label: "05:45", value: 23 },
  { label: "06:00", value: 24 },
  { label: "06:15", value: 25 },
  { label: "06:30", value: 26 },
  { label: "06:45", value: 27 },
  { label: "07:00", value: 28 },
  { label: "07:15", value: 29 },
  { label: "07:30", value: 30 },
  { label: "07:45", value: 31 },
  { label: "08:00", value: 32 },
  { label: "08:15", value: 33 },
  { label: "08:30", value: 34 },
  { label: "08:45", value: 35 },
  { label: "09:00", value: 36 },
  { label: "09:15", value: 37 },
  { label: "09:30", value: 38 },
  { label: "09:45", value: 39 },
  { label: "10:00", value: 40 },
  { label: "10:15", value: 41 },
  { label: "10:30", value: 42 },
  { label: "10:45", value: 43 },
  { label: "11:00", value: 44 },
  { label: "11:15", value: 45 },
  { label: "11:30", value: 46 },
  { label: "11:45", value: 47 },
  { label: "12:00", value: 48 },
  { label: "12:15", value: 49 },
  { label: "12:30", value: 50 },
  { label: "12:45", value: 51 },
  { label: "13:00", value: 52 },
  { label: "13:15", value: 53 },
  { label: "13:30", value: 54 },
  { label: "13:45", value: 55 },
  { label: "14:00", value: 56 },
  { label: "14:15", value: 57 },
  { label: "14:30", value: 58 },
  { label: "14:45", value: 59 },
  { label: "15:00", value: 60 },
  { label: "15:15", value: 61 },
  { label: "15:30", value: 62 },
  { label: "15:45", value: 63 },
  { label: "16:00", value: 64 },
  { label: "16:15", value: 65 },
  { label: "16:30", value: 66 },
  { label: "16:45", value: 67 },
  { label: "17:00", value: 68 },
  { label: "17:15", value: 69 },
  { label: "17:30", value: 70 },
  { label: "17:45", value: 71 },
  { label: "18:00", value: 72 },
  { label: "18:15", value: 73 },
  { label: "18:30", value: 74 },
  { label: "18:45", value: 75 },
  { label: "19:00", value: 76 },
  { label: "19:15", value: 77 },
  { label: "19:30", value: 78 },
  { label: "19:45", value: 79 },
  { label: "20:00", value: 80 },
  { label: "20:15", value: 81 },
  { label: "20:30", value: 82 },
  { label: "20:45", value: 83 },
  { label: "21:00", value: 84 },
  { label: "21:15", value: 85 },
  { label: "21:30", value: 86 },
  { label: "21:45", value: 87 },
  { label: "22:00", value: 88 },
  { label: "22:15", value: 89 },
  { label: "22:30", value: 90 },
  { label: "22:45", value: 91 },
  { label: "23:00", value: 92 },
  { label: "23:15", value: 93 },
  { label: "23:30", value: 94 },
  { label: "23:45", value: 95 },
];