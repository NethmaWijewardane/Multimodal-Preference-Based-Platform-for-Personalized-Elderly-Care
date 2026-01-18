import AuthLayout from "../../components/AuthLayout";
import AuthForm from "../../components/AuthForm";

function CaregiverSignUp() {
  return (
    <AuthLayout title="Create Account" subtitle="Join our community today.">
      <AuthForm type="signup" defaultRole="caregiver" />
    </AuthLayout>
  );
}

export default CaregiverSignUp;
