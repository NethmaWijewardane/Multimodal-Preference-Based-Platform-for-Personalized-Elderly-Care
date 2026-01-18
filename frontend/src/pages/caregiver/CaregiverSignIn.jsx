import AuthLayout from "../../components/AuthLayout";
import AuthForm from "../../components/AuthForm";

function CaregiverSignIn() {
  return (
    <AuthLayout title="Sign In" subtitle="Welcome back! Please sign in to continue.">
      <AuthForm type="signin" defaultRole="caregiver" />
    </AuthLayout>
  );
}

export default CaregiverSignIn;
