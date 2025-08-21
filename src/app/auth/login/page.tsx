import LoginForm from "@/components/auth/LoginPage";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <LoginForm />
      </div>
    </div>
  );
}