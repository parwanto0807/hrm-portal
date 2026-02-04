import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}
