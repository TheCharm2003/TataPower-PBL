
import { Button, Grid, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { tokens } from '../theme';


const ButtonCellRenderer = ({ value, onButtonClick }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleButtonClick = () => {
    onButtonClick(inputValue);
  };

  return (
    <div>
      <Grid container
        sx={{
          justifyContent: "space-between"
        }}
      >
        <Grid item>
          <span>{value}</span>&ensp;
        </Grid>
        <Grid item>
          <input
            type='number'
            value={inputValue}
            onChange={handleInputChange}
            style={{
              width: "2.5rem",
              border: "1px solid grey",
              height: "1.25rem",
              lineHeight: '1.25rem',
              marginRight: "0.313rem",
              verticalAlign: 'middle',
            }}
            required
          />
          <Button
            // type='button'
            onClick={handleButtonClick}
            sx={{
              height: "1.25rem",
              minWidth: "1.25rem",
              backgroundColor: "black",
              margin: "0rem",
              padding: "0rem",
              color: 'white',
              "&:hover": {
                backgroundColor: "black !important",
              },
            }}
          >
            +
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default ButtonCellRenderer;