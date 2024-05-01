import React, { forwardRef, useEffect, useRef, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@emotion/react";
import { tokens } from "../theme";
import Spinner from "./Spinner";
import CustomSliceTooltip from "./Tooltip";
import domtoimage from "dom-to-image-more";
import { Button, Grid } from "@mui/material";
import Download from "@mui/icons-material/Download";

const LineChart = React.forwardRef(
  (
    {
      selectedDate,
      metric,
      actualData,
      predictedData,
      margins,
      minValue,
      maxValue,
      legend,
      color1,
      pointFaceColor,
      pointWidth,
      lineWidth,
      containercolor,
    },
    ref
  ) => {
    const chartRef = useRef(null);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [chartData, setChartData] = useState(null);
    const [xcord, setXCord] = useState()
    const [ycord, setYCord] = useState()
    const [hoveredId, setHoveredId] = useState(null);

    const chartComp = async (timestamps) => {
      if (actualData && predictedData) {
        const actualChartData = actualData?.map((item, index) => ({
          x: timestamps[index].label,
          y: parseFloat(item[metric]),
        }));
        const predictedChartData = predictedData?.map((item, index) => ({
          x: timestamps[index].label,
          y: parseFloat(item[metric]),
        }));
        const errorMetricData = actualChartData.map((actualItem, index) => ({
          x: timestamps[index].label,
          y:
            actualItem.y !== undefined &&
              predictedChartData[index].y !== undefined
              ? Math.abs(actualItem.y - predictedChartData[index].y)
              : 0,
        }));
        setChartData([
          {
            id: `Error ${metric === 'wdLoad' ? 'Load' : metric === 'temp' ? 'Temp' : 'Humid'}`,
            data: errorMetricData,
          },
          {
            id: `Actual ${metric === 'wdLoad' ? 'Load' : metric === 'temp' ? 'Temp' : 'Humid'} `,
            data: actualChartData,
          },
          {
            id: `Predicted ${metric === 'wdLoad' ? 'Load' : metric === 'temp' ? 'Temp' : 'Humid'}`,
            data: predictedChartData,
          },
        ]);
      }
    };

    useEffect(() => {
      chartComp(timestamps);
    }, [actualData, predictedData, metric, timestamps]);


    const exportChartToPng = () => {
      if (chartRef.current) {
        domtoimage
          .toPng(chartRef.current, {
            width: chartRef.current.offsetWidth * 2,
            height: chartRef.current.offsetHeight * 2,
            style: {
              transform: 'scale(' + 2 + ')',
              transformOrigin: 'top '
            }

          })
          .then(function (dataUrl) {
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = "chart.png";
            link.click();
          })
          .catch(function (error) {
            console.error("Error exporting chart:", error);
          });

      }
    };

    const handleMouseEnter = (point) => {
      setHoveredId(point.points[0].data.x);
      let ymax = 0
      point.points.forEach(point => {
        const ynow = point.y;
        if (ynow > ymax) {
          ymax = ynow;
        }
      });
      setXCord(point.points[0].x0)
      setYCord(point.height - ymax);
    };

    const handleMouseLeave = () => {
      setHoveredId(null);
    };


    if (!chartData) {
      return (
        <div
          style={{
            display: "flex",
            zindex: 100,
            alignContent: "center !important",
            justifyContent: "center",
            translateY: "50%",
          }}
        >
          <Spinner />
        </div>
      );
    }
    return (
      <div style={{ height: "80%", width: "100%" }}>
        <Grid container sx={{ display: "flex", justifyContent: "right" }}>
          <Button
            sx={{
              color: colors.primary.dark,
              fontFamily: "Poppins,sans-serif",
              textTransform: "none",
              width: "2.5rem",
              height: "2.5rem",
              minWidth: "10px",
              borderRadius: "12px",
              background: colors.grey[200],
              mr: "10px",
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
            onClick={exportChartToPng}
          >
            <Download />
          </Button>
        </Grid>
        <div
          ref={chartRef}
          style={{
            height: "90%",

            display: "flex",
            justifyContent: "center",
            width: "100%",
            backgroundColor:colors.primary.main,
            borderRadius:"1rem"
          }}
        >
          <ResponsiveLine
            data={chartData}
            enableSlices="x"
            sliceTooltip={({ slice }) => <CustomSliceTooltip slice={slice} />}
            useCollapseData={true}
            enableCrosshair={false}
            theme={{
              axis: {
                domain: {
                  line: {
                    stroke: colors.grey[100],
                  },
                },
                legend: {
                  text: {
                    fill: colors.primary['black']
                  },
                },
                ticks: {
                  text: {
                    fill: colors.primary['black']
                  },
                  line: {
                    stroke: colors.grey[100],
                  },
                },
              },
              grid: {
                line: {
                  stroke: colors.grey[480],
                  strokeWidth: 1,
                }
              },
              crosshair: {
                line: {
                  stroke: 'red',
                }
              }
            }}
            margin={margins}
            yDomain={[minValue, maxValue]}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: 'auto',
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-.2f"
            curve="linear"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickPadding: 8,
              tickSize: 5,
              tickRotation: 0,
              tickTextColor: 'blue',
              legendOffset: 80,
              tickValues: timestamps
                .filter(
                  (timestamp) =>
                    timestamp.label.endsWith(":00") && timestamp.value % 3 === 0
                )
                .map((timestamp) => timestamp.label),
              format: (value) => value.slice(0, 2),
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: [legend],
              legendOffset: -40,
              legendPosition: "middle",
            }}
            lineWidth={lineWidth}
            enableGridX={false}
            enableGridY={true}
            pointColor={pointFaceColor}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            pointBorderColor={{ from: "serieColor" }}
            pointBorderWidth={pointWidth}
            pointLabelYOffset={-12}
            useMesh={true}
            colors={color1}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: -20,
                translateY: 70,
                itemsSpacing: 30,
                itemDirection: "left-to-right",
                itemWidth: 80,
                toggleSerie: true,
                itemHeight: 20,
                itemTextColor: colors.primary['black'],
                itemOpacity: 1.75,
                symbolSize: 10,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemOpacity: 1,
                      itemBackground: "rgba(0, 0, 0, .03)",
                    },
                  },
                ],
              },
            ]}
            pointSymbol={(point) => {
              const lineColor = point.borderColor
              const isHovered = point.datum.x === hoveredId && hoveredId !== null;
              return (
                <g>
                  {isHovered && (
                    <line
                      x1={xcord}
                      y1="-100%"
                      x2={xcord}
                      y2={ycord}
                      style={{ stroke: '#FFA07A', strokeWidth: 1, pointerEvents: 'none' }}
                    />
                  )}
                  <circle
                    cx={0}
                    cy={0}
                    r={isHovered ? 6 : 2}
                    fill={lineColor}
                    fillOpacity={0.8}
                    strokeWidth={isHovered ? 0.6 : 0.2}
                    stroke={isHovered ? { lineColor } : '#FFFFFF'}
                  />
                </g>
              );
            }}
            motionConfig="wobbly"
          />
        </div>
      </div>
    );
  }
);
export default LineChart;

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