import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import AuthForm from "../../components/AuthForm";

function CaregiverSignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.token && user?.role === "caregiver") {
      navigate("/caregiver/dashboard");
    }
  }, [navigate]);

  const handleLoginSuccess = (userData) => {
    const formattedUser = {
      ...userData,
      activities: userData.activities || [],
      role: "caregiver"
    };

    localStorage.setItem("user", JSON.stringify(formattedUser));

    navigate("/caregiver/dashboard");
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back! Please sign in to continue."
    >
      <AuthForm
        type="signin"
        defaultRole="caregiver"
        onSuccess={handleLoginSuccess}
      />
    </AuthLayout>
  );
}

export default CaregiverSignIn;