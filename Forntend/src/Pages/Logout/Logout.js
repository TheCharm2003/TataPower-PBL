// Logout.js
// Logout.js
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();


  const logOut = () => {
    navigate("/");
  };

  return logOut;
};

export default useLogout;
