import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import AuthForm from "../../components/AuthForm";

function ElderlySignIn() {
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const elderlyUser = JSON.parse(localStorage.getItem("elderlyUser"));
    if (elderlyUser?.token) {
      navigate("/elderly/find-caregiver");
    }
  }, [navigate]);

  // Called when login is successful
  const handleLoginSuccess = (userData) => {
    localStorage.setItem("elderlyUser", JSON.stringify(userData));
    navigate("/elderly/find-caregiver");
  };

  return (
    <AuthLayout title="Sign In" subtitle="Welcome back! Please sign in to continue.">
      <AuthForm type="signin" defaultRole="elderly" onSuccess={handleLoginSuccess} />
    </AuthLayout>
  );
}

export default ElderlySignIn;
