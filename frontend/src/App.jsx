import { Routes, Route, Navigate } from "react-router-dom";
import ElderlySignUp from "./pages/elderly/ElderlySignUp";
import ElderlySignIn from "./pages/elderly/ElderlySignIn";
import CaregiverSignUp from "./pages/caregiver/CaregiverSignUp";
import CaregiverSignIn from "./pages/caregiver/CaregiverSignIn";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/elderly/signup" />} />
      <Route path="/elderly/signup" element={<ElderlySignUp />} />
      <Route path="/elderly/signin" element={<ElderlySignIn />} />
      <Route path="/caregiver/signup" element={<CaregiverSignUp />} />
      <Route path="/caregiver/signin" element={<CaregiverSignIn />} />
      <Route path="*" element={<Navigate to="/elderly/signup" />} />
    </Routes>
  );
}

export default App;
