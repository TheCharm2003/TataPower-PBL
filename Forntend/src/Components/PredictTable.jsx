import React, {
    useState,
    useEffect,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../Pages/Forecast/Forecast.css";
import DownloadIcon from "@mui/icons-material/Download";
import ButtonCellRenderer from "./TableButton.jsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Grid, Box, Button, useTheme, Typography } from "@mui/material";
import { tokens } from "../theme.js";
import dayjs from 'dayjs';
// import instance from "../middleware.js";
import { toast } from "react-toastify";
import axios from "axios";


const PredictTable = ({
    selectedDate,
    dayType,
    onAverageValuesChange,
}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isDarkMode = theme.palette.mode === "dark";

    let selecDate;
    if (selectedDate) {
        selecDate = dayjs(selectedDate);
    }
    const downloadExcelFile = () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Sheet1");
        sheet.addRow([
            "Time Stamp",
            "Temperature",
            "Humidity",
            "Load",
            "Difference",
            "Updated Load",
        ]);
        rowData.forEach((row) => {
            sheet.addRow([
                row.timeStamp,
                row.predictedTemp,
                row.predictedHum,
                row.predictedLoad,
                row.difference,
                row.updatePredictedLoad,
            ]);
        });
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: "application/octet-stream" });
            saveAs(blob, `Prediction ${selecDate.format("YYYY-MM-DD")}.xlsx`);
        });
    };

    const suppressRowHoverHighlight = true;

    const [columnDefs, setColumnDefs] = useState([
        {
            headerName: "Time Stamp",
            headerClass: "customHeader",
            field: "timeStamp",
            cellClass: "timestampCol",
            width: 200,
        },
        {
            headerName: "Predictions for",
            headerClass: "predForHeader",
            children: [
                {
                    headerName: "Temp",
                    headerClass: "predForTempCol",
                    field: "predictedTemp",
                    cellClass: "tempClass",
                    width: 150,
                },
                {
                    headerName: "Humidity",
                    headerClass: "predForHumCol",
                    field: "predictedHum",
                    cellClass: "humidityClass",
                    width: 150,
                },
                {
                    headerName: "Load",
                    headerClass: "predForLoadCol",
                    field: "predictedLoad",
                    cellClass: "loadClass",
                    width: 250,
                },
            ],
        },
        {
            headerName: "Difference",
            headerClass: "updatedLoadHeader",
            field: "difference",
            cellClass: "uploadCol",
            width: 150,
        },
        {
            headerName: "Updated Load",
            headerClass: "updatedLoadHeader",
            field: "updatePredictedLoad",
            cellClass: "uploadCol",
            width: 200,
        },

    ]);
    const [rowData, setRowData] = useState([]);

    const [averageValues, setAverageValues] = useState({
        averageTemperature: 0,
        averageHumidity: 0,
        averageLoad: 0,
    });



    useEffect(() => {
        const fetchData = async () => {
            try {
                if (selecDate) {
                    setColumnDefs([
                        {
                            headerName: "Time Stamp",
                            headerClass: "customHeader",
                            field: "timeStamp",
                            cellClass: "timestampCol",
                            width: 200,
                        },
                        {
                            headerName: `Predictions for ${selecDate.format(
                                "YYYY/MM/DD"
                            )}`,
                            headerClass: "predForHeader",
                            children: [
                                {
                                    headerName: "Temp",
                                    headerClass: "predForTempCol",
                                    field: "predictedTemp",
                                    cellClass: "tempClass",
                                    width: 150,
                                },
                                {
                                    headerName: "Humidity",
                                    headerClass: "predForHumCol",
                                    field: "predictedHum",
                                    cellClass: "humidityClass",
                                    width: 150,
                                },
                                {
                                    headerName: "Load",
                                    headerClass: "predForLoadCol",
                                    field: "predictedLoad",
                                    cellClass: "loadClass",
                                    cellRenderer: (params) => {
                                        return (
                                            <ButtonCellRenderer
                                                value={params.value}
                                                onButtonClick={(inputValue) => {
                                                    let foundMatchingRow = false;
                                                    if (inputValue) {
                                                        setRowData((prevRows) => {
                                                            return prevRows.map((row) => {
                                                                if (foundMatchingRow) {
                                                                    return row;
                                                                } else if (params.value === row.predictedLoad) {
                                                                    foundMatchingRow = true;
                                                                    return {
                                                                        ...row,
                                                                        updatePredictedLoad:
                                                                            (parseFloat(row.updatePredictedLoad) +
                                                                            parseFloat(inputValue)),
                                                                        difference: (parseFloat(row.difference) + parseFloat(inputValue)),
                                                                    };
                                                                } else {
                                                                    return row;
                                                                }
                                                            });
                                                        });
                                                    }
                                                }}
                                            />
                                        );
                                    },
                                    width: 250,
                                },
                            ],
                        },
                        {
                            headerName: "Difference",
                            headerClass: "updatedLoadHeader",
                            field: "difference",
                            cellClass: "uploadCol",
                            width: 150,
                        },
                        {
                            headerName: "Updated Load",
                            headerClass: "updatedLoadHeader",
                            field: "updatePredictedLoad",
                            cellClass: "uploadCol",
                            width: 200,
                        },
                    ]);
                    const params = new URLSearchParams();
                    params.append("DATE", selecDate.format("YYYY-MM-DD"));
                    params.append("SPECIALDAY", dayType);

                    const response = await axios.post(
                        "http://127.0.0.1:8000/predictLoad",
                        params,
                        {
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/x-www-form-urlencoded",

                            },
                        }
                    );

                    if (response.data && response.data.blocks) {
                        const tableData = response.data.blocks.map((block, index) => ({
                            timeStamp: timestamps[index]?.label,
                            predictedLoad: block.wdLoad,
                            predictedTemp: block.temp,
                            predictedHum: block.rh,
                            updatePredictedLoad: block.wdLoad,
                            difference: 0,
                        }));
                        setRowData(tableData);
                        
                    }

                }

            } catch (error) {
                toast.error("No Data Available");
            }
        };
        fetchData();
    }, [selectedDate, dayType]);

    return (
        <div>
            <div
                className={isDarkMode ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
                style={{
                    height: "46.875rem",
                    width: "74.875rem",
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
                                ml: '1.6rem',
                                color: colors.primary.black
                            }}
                        >
                            Prediction Table
                        </Typography>
                    </Grid>
                    <Grid item sx={{ display: "flex" }}>
                        <Grid container>
                            <Grid item>
                                <Button
                                    sx={{
                                        color: colors.primary.dark,
                                        fontFamily: "Poppins,sans-serif",
                                        textTransform: "none",
                                        width: "2.5rem",
                                        height: "2.5rem",
                                        minWidth: "0.625rem",
                                        borderRadius: "12px",
                                        background: colors.grey[200],
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
                                    onClick={downloadExcelFile}
                                >
                                    <DownloadIcon />
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Box sx={{ height: "40.688rem", width: "68.75rem", marginLeft: "2rem" }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={{ sortable: true, resizable: true }}
                        pagination={true}
                        paginationPageSize={12}
                        suppressRowHoverHighlight={suppressRowHoverHighlight}
                    />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "right",
                        backgroundColor: "white",
                    }}
                >
                </Box>
            </div>
        </div>

    );
};

export default PredictTable;
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