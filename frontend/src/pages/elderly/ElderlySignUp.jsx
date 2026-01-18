import AuthLayout from "../../components/AuthLayout";
import AuthForm from "../../components/AuthForm";

function ElderlySignUp() {
  return (
    <AuthLayout title="Create Account" subtitle="Join our community today.">
      <AuthForm type="signup" defaultRole="elderly" />
    </AuthLayout>
  );
}

export default ElderlySignUp;
