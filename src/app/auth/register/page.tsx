import SignUpForm from "@/components/auth/SignUp";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full">
                <SignUpForm />
            </div>
        </div>
    );
}