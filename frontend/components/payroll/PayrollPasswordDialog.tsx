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
import { Lock, BadgeAlert, Loader2 } from "lucide-react";

interface PasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PayrollPasswordDialog: React.FC<PasswordDialogProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (!password) {
            toast.error("Silakan masukkan password");
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
                <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Lock className="w-24 h-24" />
                    </div>
                    <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
                        <Lock className="h-6 w-6 text-white" />
                    </div>
                    <DialogHeader className="text-left p-0">
                        <DialogTitle className="text-xl font-bold tracking-tight">Verifikasi Keamanan</DialogTitle>
                        <DialogDescription className="text-indigo-100/90 text-sm font-medium mt-1 leading-relaxed">
                            Akses slip gaji dilindungi. Masukkan password yang sudah diberikan oleh Admin HRD.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 pt-5 bg-white space-y-5">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
                        </div>
                        <Input
                            type="password"
                            placeholder="Masukkan password Anda"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl text-lg tracking-[0.3em] font-mono text-center placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                            autoFocus
                        />
                    </div>

                </div>

                <DialogFooter className="p-6 pt-0 bg-white grid grid-cols-2 gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="h-11 rounded-xl font-bold text-slate-500 hover:bg-slate-50 border border-slate-100"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleVerify}
                        disabled={isLoading}
                        className="h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Buka Akses"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
