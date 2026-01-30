import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import AuthForm from "../../components/AuthForm";

function ElderlySignUp() {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate("/elderly/signin");
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join our community today.">
      <AuthForm type="signup" defaultRole="elderly" onSuccess={handleSignupSuccess} />
    </AuthLayout>
  );
}

export default ElderlySignUp;
