import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import AuthForm from "../../components/AuthForm";

function ElderlySignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (user?.token && user?.role === "elderly") {
      navigate("/elderly/find-caregiver");
    }
  }, [navigate]);

  const handleLoginSuccess = (data) => {
    const formattedUser = {
      token: data.token,
      ...data.user,
      role: "elderly"
    };

    localStorage.setItem("user", JSON.stringify(formattedUser));

    navigate("/elderly/find-caregiver");
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back! Please sign in to continue."
    >
      <AuthForm
        type="signin"
        defaultRole="elderly"
        onSuccess={handleLoginSuccess}
      />
    </AuthLayout>
  );
}

export default ElderlySignIn;