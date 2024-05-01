import React from 'react'
import DownloadIcon from '@mui/icons-material/Download';
import { Card, Box} from '@mui/material';


const Download = () => {
  return (
    <div>
      <Box
        sx={{
          width: "30px",
          height: "30px",
          borderRadius: "10px",
          marginTop: "0px",
          backgroundColor: "#F4F4F4",
        }}
      >
        <DownloadIcon />
      </Box>

    </div>
  )
}

export default Download;
