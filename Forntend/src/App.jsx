import { ColorModeContext, useMode } from "./theme.js";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Sidebar from "./Pages/Global/Sidebar.jsx";
// import DashBoard from "./Pages/Dashboard/dashboard";
import Topbar from "./Pages/Global/Topbar";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
// import UploadData from "./Pages/UploadData/uploadData.jsx";
import SignIn from './Pages/SignIn/SignIn.jsx'
import Pastresult from "./Pages/PastResult/pastresults.jsx";
import Forecast from "./Pages/Forecast/Forecast.jsx";
// import SubTopbar2 from "./Pages/Global/subTopbar2.jsx";
// import Dashboard2 from "./Pages/Dashboard/dashboard2.jsx";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <div className="App">
            {/* Sign-in route */}
            <Routes>
               <Route path="/" element={<Navigate to="/signin" />} />
              <Route
                path="/signin"
                element={
                  <div>
                    <SignIn />
                  </div>
                }
              />
              {/* Other routes */}
              <Route
                path="/*"
                element={
                  <div>
                    <Topbar setIsSidebar={setIsSidebar} />
                    <div style={{ display: 'flex' }}>
                      <Sidebar isSidebar={isSidebar} />
                      <main className="content" style={{ flexGrow: 1, marginLeft: isSidebar ? '18.75rem' : 0, transition: 'margin-left 0.3s' }}>
                        <Routes>
                          {/* Set default route using Navigate */}
                          {/* <Route path="/" element={<Navigate to="/dashboard" />} /> */}
                          {/* <Route path="/dashboard" element={<DashBoard />} /> */}
                          {/* <Route path="/dash2" element={<Dashboard2 />} /> */}
                          {/* <Route path="/Upload" element={<UploadData />} /> */}
                          <Route path="/pastresult" element={<Pastresult/>}/>
                          <Route path="/forecast" element={<Forecast/>}/>
                          {/* Add more routes as needed */}
                        </Routes>
                      </main>
                    </div>
                  </div>
                }
              />
            </Routes>
          </div>
        </CssBaseline>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
