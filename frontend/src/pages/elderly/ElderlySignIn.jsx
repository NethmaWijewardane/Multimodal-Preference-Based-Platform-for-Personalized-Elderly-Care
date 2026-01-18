import AuthLayout from "../../components/AuthLayout";
import AuthForm from "../../components/AuthForm";

function ElderlySignIn() {
  return (
    <AuthLayout title="Sign In" subtitle="Welcome back! Please sign in to continue.">
      <AuthForm type="signin" defaultRole="elderly" />
    </AuthLayout>
  );
}

export default ElderlySignIn;
