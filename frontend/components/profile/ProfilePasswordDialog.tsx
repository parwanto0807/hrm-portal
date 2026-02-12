import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Lock, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";

interface ProfilePasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ProfilePasswordDialog: React.FC<ProfilePasswordDialogProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleVerify = async () => {
        if (!password) {
            toast.error("Silakan masukkan password");
            return;
        }

        // Validate format DDMMYYYY (8 digits)
        if (!/^\d{8}$/.test(password)) {
            toast.error("Password harus 8 digit angka");
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('/employees/verify-dob', { dob: password });
            if (res.data.success) {
                toast.success("Verifikasi berhasil");
                setPassword('');
                onSuccess();
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Password salah";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="w-24 h-24" />
                    </div>
                    <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
                        <Lock className="h-6 w-6 text-white" />
                    </div>
                    <DialogHeader className="text-left p-0">
                        <DialogTitle className="text-xl font-bold tracking-tight">Verifikasi Keamanan</DialogTitle>
                        <DialogDescription className="text-blue-100/90 text-sm font-medium mt-1 leading-relaxed">
                            Akses profil dilindungi. Masukkan password untuk melanjutkan.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 pt-5 bg-white dark:bg-slate-900 space-y-5">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Password</label>
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                                className="h-12 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-lg tracking-[0.3em] font-mono text-center placeholder:tracking-normal placeholder:font-sans placeholder:text-sm dark:placeholder:text-slate-500 pr-12"
                                autoFocus
                                maxLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                            8 digit angka
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0 bg-white dark:bg-slate-900 grid grid-cols-2 gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="h-11 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleVerify}
                        disabled={isLoading || password.length !== 8}
                        className="h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Verifikasi"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
