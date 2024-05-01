import React from 'react'
import loading from '../../src/assets/loading.gif'
import { Box } from '@mui/material'

const Spinner = (marginLeft,marginTop) => {
  return (
    <Box sx={{
        display:'flex',
        zindex:100,
        justifyContent:'center !important',
        marginTop:'6.25rem'
        
      


    }}>
      <img src={loading} alt="" />
    </Box>
  )
}

export default Spinner