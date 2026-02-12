
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Factory } from "@/types/master";
import { MapPin, ExternalLink } from "lucide-react";

const formSchema = z.object({
    kdFact: z.string().min(1, "Kode wajib diisi").max(20, "Maksimal 20 karakter"),
    nmFact: z.string().min(1, "Nama wajib diisi"),
    keterangan: z.string().optional(),
    lat: z.string().optional(),
    long: z.string().optional(),
    radius: z.coerce.number().min(1, "Radius minimal 1 meter").default(50),
});

interface FactoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    factory?: Factory | null;
    onSuccess: () => void;
}

export function FactoryDialog({ open, onOpenChange, factory, onSuccess }: FactoryDialogProps) {
    const isEditing = !!factory;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            kdFact: "",
            nmFact: "",
            keterangan: "",
            lat: "",
            long: "",
            radius: 50,
        },
    });

    // Watch values for map preview
    const lat = form.watch("lat");
    const long = form.watch("long");
    const radius = form.watch("radius");

    const hasCoordinates = lat && long && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(long));

    useEffect(() => {
        if (factory) {
            form.reset({
                kdFact: factory.kdFact,
                nmFact: factory.nmFact || "",
                keterangan: factory.keterangan || "",
                lat: factory.lat || "",
                long: factory.long || "",
                radius: factory.radius || 50,
            });
        } else {
            form.reset({
                kdFact: "",
                nmFact: "",
                keterangan: "",
                lat: "",
                long: "",
                radius: 50,
            });
        }
    }, [factory, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (isEditing) {
                await api.put(`/factories/${factory.kdFact}`, values);
                toast.success("Factory berhasil diperbarui");
            } else {
                await api.post("/factories", values);
                toast.success("Factory berhasil ditambahkan");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Gagal menyimpan data");
        }
    }

    const openGoogleMaps = () => {
        if (hasCoordinates) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${long}`, '_blank');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Factory & Lokasi" : "Tambah Factory Baru"}</DialogTitle>
                    <DialogDescription>
                        Atur informasi factory dan titik koordinat untuk lokasi absensi.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    {/* Left Column: Map Preview */}
                    <div className="space-y-4">
                        <div className="bg-slate-50 border rounded-xl overflow-hidden shadow-inner h-[300px] relative flex items-center justify-center">
                            {hasCoordinates ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight={0}
                                    marginWidth={0}
                                    src={`https://maps.google.com/maps?q=${lat},${long}&z=15&output=embed`}
                                    className="w-full h-full"
                                ></iframe>
                            ) : (
                                <div className="text-center p-6 text-slate-400">
                                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Masukkan Latitude & Longitude<br />untuk melihat preview lokasi</p>
                                </div>
                            )}

                            {/* Radius Indicator Overlay (Visual only, approximate) */}
                            {hasCoordinates && (
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-mono border shadow-sm">
                                    Radius: {radius}m
                                </div>
                            )}
                        </div>

                        {hasCoordinates ? (
                            <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg">
                                <h4 className="font-bold text-sky-800 text-sm mb-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Lokasi Terdeteksi
                                </h4>
                                <p className="text-xs text-sky-700 mb-3">
                                    Pastikan pin merah pada peta sesuai dengan lokasi kantor/pabrik.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-sky-200 text-sky-700 hover:bg-sky-100 hover:text-sky-800"
                                    onClick={openGoogleMaps}
                                >
                                    <ExternalLink className="w-3 h-3 mr-2" />
                                    Buka di Google Maps
                                </Button>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-500">
                                <p>Tips: Anda bisa mengambil titik koordinat dari Google Maps dengan cara klik kanan pada lokasi → pilih angka koordinat.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="kdFact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kode Factory</FormLabel>
                                            <FormControl>
                                                <Input placeholder="F01" {...field} disabled={isEditing} maxLength={20} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nmFact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Factory</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nama Pabrik" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="keterangan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Keterangan</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Opsional..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="border-t pt-4 mt-4">
                                <h4 className="font-bold text-sm mb-3">Koordinat Lokasi</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="lat"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Latitude</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="-6.2088..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="long"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Longitude</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="106.8456..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="radius"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Radius Aman (Meter)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="50" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Jarak maksimal karyawan bisa melakukan absen dari titik pusat.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full sm:w-auto">
                                    {isEditing ? "Simpan Perubahan" : "Simpan Factory Baru"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
