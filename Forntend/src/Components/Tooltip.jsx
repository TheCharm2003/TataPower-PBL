import React from 'react';
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

const CustomSliceTooltip = ({ slice }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <div
      style={{
        background: colors.primary["light"],
        padding: '9px 12px',
        // border: '1px solid #ccc',
        borderRadius: "16px"
      }}
    >
      <div
        style={{
          fontSize: '16px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: "600",
          color:colors.primary["dark"]
        }}
      >
        Timestamp: {slice.points[0].data.x}
      </div>
      {slice.points.map((point) => (
        <div key={point.id}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: point.serieColor,
                marginRight: 8,
              }}
            ></div>
            <div
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: '100'
              }}
            >
              {point.serieId}: {point.data.yFormatted}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomSliceTooltip;