// import 'firebase/auth';
import React from 'react';
import './App.css';
import Blog from './modules/Blog';

import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const darkTheme = createTheme({
  typography: {
    fontFamily: [
      'Carter One',
      'Arial',
      'sans-serif',
      'monospace',
    ].join(','),
  },
  palette: {
    mode: 'dark',
    background: {
      default: '#ffffff',

    }
  },
});


const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Blog />
    </ThemeProvider>
  );
}

export default App;
