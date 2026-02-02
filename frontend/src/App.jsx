import { Routes, Route, Navigate } from "react-router-dom";

import ElderlySignUp from "./pages/elderly/ElderlySignUp";
import ElderlySignIn from "./pages/elderly/ElderlySignIn";
import FindCaregiver from "./pages/elderly/FindCaregiver";
import ViewCaregiverProfile from "./pages/elderly/ViewCaregiverProfile";

import CaregiverSignUp from "./pages/caregiver/CaregiverSignUp";
import CaregiverSignIn from "./pages/caregiver/CaregiverSignIn";
import CaregiverDashboard from "./pages/caregiver/CaregiverDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/elderly/signup" />} />

      {/* Elderly */}
      <Route path="/elderly/signup" element={<ElderlySignUp />} />
      <Route path="/elderly/signin" element={<ElderlySignIn />} />
      <Route path="/elderly/find-caregiver" element={<FindCaregiver />} />

      {/* View caregiver profile */}
      <Route
        path="/elderly/caregiver/:email"
        element={<ViewCaregiverProfile />}
      />

      {/* Caregiver */}
      <Route path="/caregiver/signup" element={<CaregiverSignUp />} />
      <Route path="/caregiver/signin" element={<CaregiverSignIn />} />
      <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />

      <Route path="*" element={<Navigate to="/elderly/signup" />} />
    </Routes>
  );
}

export default App;
