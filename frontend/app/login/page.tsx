import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#09090b] relative overflow-hidden px-4 py-10 sm:p-6">
            {/* Professional Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[100%] md:w-[40%] h-[40%] bg-sky-500/10 dark:bg-sky-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[100%] md:w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="w-full max-w-md relative z-10 mx-auto">
                <LoginForm />
            </div>
        </div>
    );
}
