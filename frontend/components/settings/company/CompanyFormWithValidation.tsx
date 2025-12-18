"use client";

import React, { useEffect } from "react";
import { createCompanyAction, updateCompanyAction } from "@/lib/actions/companyAction";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Save, Building2, MapPin, Phone, FileText,
    Users, Briefcase, Globe, UserCircle,
    Hash, Mail, Link, FileDigit, BadgePercent,
    Upload, XCircle, AlertCircle
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { companySchema, CompanyFormValues } from "@/schemas/company/companySchema";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompanyFormProps {
    initialData?: Partial<CompanyFormValues> & { id?: string };
}

export default function CompanyForm({ initialData }: CompanyFormProps) {
    const { theme } = useTheme();
    const isEditMode = Boolean(initialData?.id);
    const [progress, setProgress] = React.useState(0);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        mode: "onChange",
        reValidateMode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            kodeCmpy: initialData?.kodeCmpy || "",
            company: initialData?.company || "",
            address1: initialData?.address1 || "",
            address2: initialData?.address2 || "",
            address3: initialData?.address3 || "",
            tlp: initialData?.tlp || "",
            fax: initialData?.fax || "",
            email: initialData?.email || "",
            homepage: initialData?.homepage || "",
            npwp: initialData?.npwp || "",
            npp: initialData?.npp || "",
            astekBayar: initialData?.astekBayar || "",
            director: initialData?.director || "",
            npwpDir: initialData?.npwpDir || "",
            hrdMng: initialData?.hrdMng || "",
            npwpMng: initialData?.npwpMng || "",
            logo: initialData?.logo || "",
        },
    });

    const { watch, formState } = form;
    const values = watch();

    useEffect(() => {
        if (initialData) {
            form.reset({
                kodeCmpy: initialData.kodeCmpy || "",
                company: initialData.company || "",
                address1: initialData.address1 || "",
                address2: initialData.address2 || "",
                address3: initialData.address3 || "",
                tlp: initialData.tlp || "",
                fax: initialData.fax || "",
                email: initialData.email || "",
                homepage: initialData.homepage || "",
                npwp: initialData.npwp || "",
                npp: initialData.npp || "",
                astekBayar: initialData.astekBayar || "",
                director: initialData.director || "",
                npwpDir: initialData.npwpDir || "",
                hrdMng: initialData.hrdMng || "",
                npwpMng: initialData.npwpMng || "",
                logo: initialData.logo || "",
            });
        }
    }, [initialData, form]);

    useEffect(() => {
        const totalFields = Object.keys(companySchema.shape).length;
        if (totalFields === 0) return;

        const filledFields = Object.values(values).filter(
            (value) => value !== null && value !== "" && value !== undefined
        ).length;

        const newProgress = Math.round((filledFields / totalFields) * 100);
        setProgress(newProgress);
    }, [values]);

    const hasError = (fieldName: keyof CompanyFormValues) => {
        return formState.errors[fieldName] !== undefined;
    };

    const onSubmit = async (data: CompanyFormValues) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        console.log("Submitting form data:", data);

        try {
            let result;
            if (isEditMode && initialData?.id) {
                console.log("Mode: Update", initialData.id);
                result = await updateCompanyAction(initialData.id, data);
            } else {
                console.log("Mode: Create");
                result = await createCompanyAction(data);
            }

            console.log("Action result:", result);

            if (result.success) {
                toast.success(isEditMode ? "Data Perusahaan berhasil diperbarui" : "Perusahaan berhasil didaftarkan");

                if (!isEditMode) {
                    setTimeout(() => {
                        form.reset();
                    }, 1000);
                }
            } else {
                console.error("Action Failed:", result.error);
                toast.error(result.error || "Terjadi kesalahan saat menyimpan data");
            }

        } catch (error) {
            console.error("Error submitting form:", error);
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan internal";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid = (errors: FieldErrors<CompanyFormValues>) => {
        console.error("Form Validation Errors:", errors);

        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
            toast.error(`Validasi gagal: ${firstError.message}`, {
                icon: <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />,
            });
        } else {
            toast.error("Form tidak valid. Periksa semua isian yang wajib diisi.");
        }

        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const formSections = [
        { id: 1, title: "Identitas", icon: Building2, color: "blue", fields: ["kodeCmpy", "company"] },
        { id: 2, title: "Alamat", icon: MapPin, color: "green", fields: ["address1", "address2", "address3"] },
        { id: 3, title: "Kontak", icon: Phone, color: "purple", fields: ["tlp", "fax", "email", "homepage"] },
        { id: 4, title: "Legal", icon: FileText, color: "red", fields: ["npwp", "npp", "astekBayar"] },
        { id: 5, title: "Direksi", icon: Users, color: "amber", fields: ["director", "npwpDir", "hrdMng", "npwpMng"] },
        { id: 6, title: "Tambahan", icon: Briefcase, color: "indigo", fields: ["logo"] },
    ];

    const getIconColor = (color: string) => {
        const colorMap: Record<string, { light: string; dark: string }> = {
            blue: { light: "bg-blue-100 text-blue-600", dark: "bg-blue-900/30 text-blue-400" },
            green: { light: "bg-green-100 text-green-600", dark: "bg-green-900/30 text-green-400" },
            purple: { light: "bg-purple-100 text-purple-600", dark: "bg-purple-900/30 text-purple-400" },
            red: { light: "bg-red-100 text-red-600", dark: "bg-red-900/30 text-red-400" },
            amber: { light: "bg-amber-100 text-amber-600", dark: "bg-amber-900/30 text-amber-400" },
            indigo: { light: "bg-indigo-100 text-indigo-600", dark: "bg-indigo-900/30 text-indigo-400" },
        };
        return theme === "dark" ? colorMap[color].dark : colorMap[color].light;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-3 px-2 sm:py-6 sm:px-4">

            {/* Alert Information */}
            <div className="max-w-full mx-auto mb-2 sm:mb-4">
                <Alert className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 ${Object.keys(formState.errors).length > 0 ? 'border-red-300 dark:border-red-800' : ''}`}>
                    <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300 text-[11px] sm:text-sm">
                        {Object.keys(formState.errors).length > 0 ? (
                            <span className="flex items-center gap-1.5">
                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                <span className="hidden sm:inline">Terdapat {Object.keys(formState.errors).length} kesalahan validasi. Perbaiki sebelum menyimpan.</span>
                                <span className="sm:hidden text-[11px]">Terdapat {Object.keys(formState.errors).length} kesalahan validasi</span>
                            </span>
                        ) : (
                            <>
                                <span className="hidden sm:inline">Pastikan semua data diisi dengan benar. Data yang sudah disimpan akan digunakan untuk semua dokumen resmi perusahaan.</span>
                                <span className="sm:hidden text-[11px]">Pastikan semua data diisi dengan benar dan valid</span>
                            </>
                        )}
                    </AlertDescription>
                </Alert>
            </div>

            {/* Form Container */}
            <div className="w-full mx-auto">
                <Card className="border dark:border-gray-800 shadow-lg dark:shadow-gray-900/30 rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b dark:border-gray-800 p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                            <div>
                                {/* Judul dengan ukuran lebih kecil di mobile */}
                                <CardTitle className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                                    Form Data Perusahaan
                                </CardTitle>
                                {/* Deskripsi dengan ukuran lebih kecil di mobile */}
                                <CardDescription className="text-gray-600 dark:text-gray-400 text-[11px] sm:text-base mt-0.5 sm:mt-1">
                                    Lengkapi semua informasi dibawah ini dengan data yang valid dan akurat
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Badge variant="outline" className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                                    v2.0
                                </Badge>
                                <Badge className={`${formState.isValid ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'} text-white text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5`}>
                                    {formState.isValid ? (
                                        <CheckCircle2 className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                    ) : (
                                        <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                    )}
                                    <span className="hidden sm:inline">{formState.isValid ? 'Valid' : 'Periksa Validasi'}</span>
                                    <span className="sm:hidden">{formState.isValid ? 'Valid' : 'Periksa'}</span>
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-2 sm:p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-3 sm:space-y-8">
                                {/* Mobile Navigation Tabs - lebih kompak */}
                                <div className="sm:hidden overflow-x-auto pb-2 -mx-2 px-2">
                                    <div className="flex space-x-1.5 min-w-max">
                                        {formSections.map((section) => (
                                            <Button
                                                key={section.id}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 whitespace-nowrap text-[10px] h-7 px-2 py-1"
                                                onClick={() => {
                                                    const element = document.getElementById(`section-${section.id}`);
                                                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }}
                                            >
                                                <section.icon className="h-2.5 w-2.5" />
                                                {section.title}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Desktop Sidebar + Content Layout */}
                                <div className="flex flex-col lg:flex-row gap-3 sm:gap-6">
                                    {/* Desktop Sidebar Navigation */}
                                    <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
                                        <div className="sticky top-6 space-y-2">
                                            {/* Progress Box */}
                                            <div className="w-full p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 overflow-hidden rounded-full">
                                                            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                            {isEditMode ? "Update" : "Register"}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
                                                </div>
                                                <Progress value={progress} className="h-2 bg-blue-200 dark:bg-blue-800" />
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                                                    {progress === 100 ? "Complete!" : "Progress"}
                                                </p>
                                            </div>

                                            {formSections.map((section) => {
                                                const Icon = section.icon;
                                                const hasSectionError = section.fields.some(field => hasError(field as keyof CompanyFormValues));
                                                return (
                                                    <button
                                                        key={section.id}
                                                        type="button"
                                                        className={`w-full p-4 rounded-lg text-left transition-all hover:scale-[1.02] ${getIconColor(section.color)} ${hasSectionError ? 'border-2 border-red-300 dark:border-red-700' : ''} dark:hover:bg-gray-800 hover:shadow-md group`}
                                                        onClick={() => {
                                                            const element = document.getElementById(`section-${section.id}`);
                                                            element?.scrollIntoView({ behavior: 'smooth' });
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${getIconColor(section.color)}`}>
                                                                <Icon className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h3 className="font-semibold text-gray-800 dark:text-black dark:group-hover:text-white">
                                                                        {section.title}
                                                                    </h3>
                                                                    {hasSectionError && (
                                                                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {section.fields.length} field
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}

                                            {/* Validation Summary */}
                                            {Object.keys(formState.errors).length > 0 && (
                                                <div className="mt-6 p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Validasi Gagal
                                                    </h4>
                                                    <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                                                        <li className="flex items-start gap-2">
                                                            <div className="h-1.5 w-1.5 bg-red-500 rounded-full mt-1"></div>
                                                            <span>Terdapat {Object.keys(formState.errors).length} error</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <div className="h-1.5 w-1.5 bg-red-500 rounded-full mt-1"></div>
                                                            <span>Periksa form yang ditandai merah</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Main Form Content */}
                                    <div className="flex-1 space-y-3 sm:space-y-6">
                                        {/* Group 1: Identitas Perusahaan */}
                                        <section id="section-1" className="scroll-mt-16">
                                            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-sm sm:shadow-md hover:shadow-lg transition-shadow">
                                                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-2.5 sm:p-4">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className={`p-1.5 sm:p-2 rounded-lg ${getIconColor("blue")}`}>
                                                            <Building2 className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                                        </div>
                                                        <div>
                                                            {/* Judul section lebih kecil di mobile */}
                                                            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white">
                                                                Identitas Perusahaan
                                                            </h3>
                                                            {/* Deskripsi section lebih kecil di mobile */}
                                                            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                                                                Data utama identifikasi perusahaan
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-2.5 sm:p-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="kodeCmpy"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    {/* Label dengan ukuran lebih kecil di mobile */}
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm">
                                                                        <Hash className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                        Kode Perusahaan <span className="text-red-500">*</span>
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Ex: 001, ABC, XYZ"
                                                                            maxLength={3}
                                                                            // Input height lebih kecil di mobile
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('kodeCmpy') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    {/* Error message lebih kecil di mobile */}
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                    {/* Help text lebih kecil di mobile */}
                                                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                                                        Kode unik 3 karakter untuk identifikasi internal
                                                                    </p>
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="company"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm">
                                                                        <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                        Nama Perusahaan <span className="text-red-500">*</span>
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Nama lengkap perusahaan"
                                                                            maxLength={40}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('company') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </section>

                                        {/* Group 2: Alamat Perusahaan */}
                                        <section id="section-2" className="scroll-mt-16">
                                            <Card className="border-2 border-green-200 dark:border-green-800 shadow-sm sm:shadow-md hover:shadow-lg transition-shadow">
                                                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-2.5 sm:p-4">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className={`p-1.5 sm:p-2 rounded-lg ${getIconColor("green")}`}>
                                                            <MapPin className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white">
                                                                Alamat Perusahaan
                                                            </h3>
                                                            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                                                                Lokasi dan domisili resmi perusahaan
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-2.5 sm:p-6">
                                                    <div className="space-y-2.5 sm:space-y-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="address1"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 text-[11px] sm:text-sm">
                                                                        Alamat Jalan <span className="text-red-500">*</span>
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Jl. Raya Utama No. 123"
                                                                            maxLength={40}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('address1') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-6">
                                                            <FormField
                                                                control={form.control}
                                                                name="address2"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-1 sm:space-y-2">
                                                                        <FormLabel className="font-medium text-gray-700 dark:text-gray-300 text-[11px] sm:text-sm">
                                                                            Kelurahan & Kecamatan
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="Kelurahan, Kecamatan"
                                                                                maxLength={40}
                                                                                className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('address2') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                                {...field}
                                                                                value={field.value ?? ""}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name="address3"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-1 sm:space-y-2">
                                                                        <FormLabel className="font-medium text-gray-700 dark:text-gray-300 text-[11px] sm:text-sm">
                                                                            Kota & Provinsi <span className="text-red-500">*</span>
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="Kota, Provinsi, Kode Pos"
                                                                                maxLength={40}
                                                                                className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('address3') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                                {...field}
                                                                                value={field.value ?? ""}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </section>

                                        {/* Group 3: Kontak & Komunikasi */}
                                        <section id="section-3" className="scroll-mt-16">
                                            <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-sm sm:shadow-md hover:shadow-lg transition-shadow">
                                                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-2.5 sm:p-4">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className={`p-1.5 sm:p-2 rounded-lg ${getIconColor("purple")}`}>
                                                            <Phone className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white">
                                                                Kontak & Komunikasi
                                                            </h3>
                                                            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                                                                Informasi kontak resmi perusahaan
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-2.5 sm:p-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="tlp"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm">
                                                                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                        Telepon <span className="text-red-500">*</span>
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="(021) 1234-5678"
                                                                            maxLength={15}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('tlp') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="fax"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 text-[11px] sm:text-sm">
                                                                        Fax
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="(021) 1234-5679"
                                                                            maxLength={15}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('fax') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm">
                                                                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                        Email Resmi
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="email"
                                                                            placeholder="hrd@company.com"
                                                                            maxLength={30}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('email') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="homepage"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm">
                                                                        <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                        Website
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="https://company.com"
                                                                            maxLength={50}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('homepage') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </section>

                                        {/* Group 4: Data Legal & Pajak */}
                                        <section id="section-4" className="scroll-mt-16">
                                            <Card className="border-2 border-red-200 dark:border-red-800 shadow-sm sm:shadow-md hover:shadow-lg transition-shadow">
                                                <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-2.5 sm:p-4">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className={`p-1.5 sm:p-2 rounded-lg ${getIconColor("red")}`}>
                                                            <FileText className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white">
                                                                Data Legal & Pajak
                                                            </h3>
                                                            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                                                                Dokumen dan nomor legal perusahaan
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-2.5 sm:p-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="npwp"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm">
                                                                        <BadgePercent className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                        NPWP Perusahaan <span className="text-red-500">*</span>
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="XX.XXX.XXX.X-XXX.XXX"
                                                                            maxLength={20}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('npwp') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="npp"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm">
                                                                        <FileDigit className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                        Nomor Pokok Perusahaan
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Nomor Pokok Perusahaan"
                                                                            maxLength={30}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('npp') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <div className="lg:col-span-2">
                                                            <FormField
                                                                control={form.control}
                                                                name="astekBayar"
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-1 sm:space-y-2">
                                                                        <FormLabel className="font-medium text-gray-700 dark:text-gray-300 text-[11px] sm:text-sm">
                                                                            Informasi Astek Bayar
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="Informasi detail tentang pembayaran astek"
                                                                                maxLength={80}
                                                                                className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('astekBayar') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                                {...field}
                                                                                value={field.value ?? ""}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </section>

                                        {/* Group 5: Direksi & Manajemen */}
                                        <section id="section-5" className="scroll-mt-16">
                                            <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-sm sm:shadow-md hover:shadow-lg transition-shadow">
                                                <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 p-2.5 sm:p-4">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className={`p-1.5 sm:p-2 rounded-lg ${getIconColor("amber")}`}>
                                                            <Users className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white">
                                                                Direksi & Manajemen
                                                            </h3>
                                                            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                                                                Data pimpinan dan manajemen perusahaan
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-2.5 sm:p-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="director"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm">
                                                                        <UserCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                        Nama Direktur <span className="text-red-500">*</span>
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Nama lengkap direktur"
                                                                            maxLength={25}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('director') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="npwpDir"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 text-[11px] sm:text-sm">
                                                                        NPWP Direktur
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="XX.XXX.XXX.X-XXX.XXX"
                                                                            maxLength={20}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('npwpDir') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="hrdMng"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 text-[11px] sm:text-sm">
                                                                        HRD Manager
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Nama HRD Manager"
                                                                            maxLength={30}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('hrdMng') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="npwpMng"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 text-[11px] sm:text-sm">
                                                                        NPWP HRD Manager
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="XX.XXX.XXX.X-XXX.XXX"
                                                                            maxLength={20}
                                                                            className={`h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('npwpMng') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </section>

                                        {/* Group 6: Data Tambahan */}
                                        <section id="section-6" className="scroll-mt-16">
                                            <Card className="border-2 border-indigo-200 dark:border-indigo-800 shadow-sm sm:shadow-md hover:shadow-lg transition-shadow">
                                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-2.5 sm:p-4">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className={`p-1.5 sm:p-2 rounded-lg ${getIconColor("indigo")}`}>
                                                            <Briefcase className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white">
                                                                Data Tambahan
                                                            </h3>
                                                            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                                                                Informasi pendukung lainnya
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-2.5 sm:p-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="logo"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-1 sm:space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm">
                                                                        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                        Logo Perusahaan
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className="flex flex-col gap-4">
                                                                            <div className="flex items-center gap-4">
                                                                                <Input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    className="cursor-pointer file:mr-4 file:py-0.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300"
                                                                                    onChange={async (e) => {
                                                                                        const file = e.target.files?.[0];
                                                                                        if (!file) return;

                                                                                        // Validate file size (max 2MB)
                                                                                        if (file.size > 2 * 1024 * 1024) {
                                                                                            toast.error("Ukuran file maksimal 2MB");
                                                                                            return;
                                                                                        }

                                                                                        const formData = new FormData();
                                                                                        formData.append("file", file);

                                                                                        // Robust URL construction
                                                                                        let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

                                                                                        // 1. Remove ANY trailing slashes first
                                                                                        while (baseUrl.endsWith('/')) {
                                                                                            baseUrl = baseUrl.slice(0, -1);
                                                                                        }

                                                                                        // 2. Remove trailing /api if present
                                                                                        if (baseUrl.endsWith('/api')) {
                                                                                            baseUrl = baseUrl.slice(0, -4);
                                                                                        }

                                                                                        // 3. Construct final URL (always append /api/upload/...)
                                                                                        const promise = fetch(`${baseUrl}/api/upload/company-logo`, {
                                                                                            method: "POST",
                                                                                            headers: {
                                                                                                ...(localStorage.getItem("accessToken")
                                                                                                    ? { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
                                                                                                    : {}),
                                                                                            },
                                                                                            credentials: 'include', // Important for HttpOnly cookies
                                                                                            body: formData,
                                                                                        }).then(async (res) => {
                                                                                            if (!res.ok) {
                                                                                                const errorData = await res.json().catch(() => ({ message: "Result not OK" }));
                                                                                                throw new Error(errorData.message || `Upload failed with status ${res.status}`);
                                                                                            }
                                                                                            const data = await res.json();
                                                                                            console.log("Upload response:", data); // Debug log
                                                                                            if (!data.url) throw new Error("Server did not return a URL");

                                                                                            field.onChange(data.url);
                                                                                            return data;
                                                                                        });

                                                                                        toast.promise(promise, {
                                                                                            loading: "Mengupload logo...",
                                                                                            success: "Logo berhasil diupload",
                                                                                            error: "Gagal mengupload logo",
                                                                                        });
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                                                                Format: .jpg, .png, .jpeg (Max 2MB).
                                                                            </p>
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-[10px] sm:text-sm" />
                                                                    {/* Hidden Input to store URL string for form submission */}
                                                                    <input type="hidden" {...field} value={field.value ?? ""} />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Preview Section */}
                                                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 relative overflow-hidden group">
                                                            {form.watch("logo") ? (
                                                                <>
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={form.watch("logo") || ""}
                                                                        alt="Logo Preview"
                                                                        className="h-32 w-auto object-contain z-10 relative transition-transform duration-300 group-hover:scale-105"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                                                        onClick={() => form.setValue("logo", "")}
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <Globe className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                        Preview logo akan muncul di sini
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </section>

                                        {/* Action Buttons */}
                                        <div className="pt-3 sm:pt-6 mt-3 sm:mt-6 border-t dark:border-gray-800">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                                                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                    {Object.keys(formState.errors).length > 0 ? (
                                                        <div className="text-red-600 dark:text-red-400">
                                                            <p className="font-medium text-[11px] sm:text-sm">⚠️ Ada {Object.keys(formState.errors).length} kesalahan validasi</p>
                                                            <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">Perbaiki field yang ditandai merah</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-[11px] sm:text-sm">Semua data sudah valid dan siap disimpan</p>
                                                            <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                                                                Fields dengan tanda <span className="text-red-500">*</span> wajib diisi
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="px-4 py-2 h-8 sm:h-auto text-[11px] sm:text-sm dark:border-gray-700 dark:text-gray-300"
                                                                disabled={isSubmitting}
                                                            >
                                                                Reset Form
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="max-w-[90%] sm:max-w-lg">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-sm sm:text-base">
                                                                    Konfirmasi Reset Form
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription className="text-xs sm:text-sm">
                                                                    Semua data yang telah diisi akan dihapus. Apakah Anda yakin ingin mereset form?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="text-xs sm:text-sm h-8 sm:h-10">
                                                                    Batal
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => form.reset()}
                                                                    className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm h-8 sm:h-10"
                                                                >
                                                                    Reset
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <Button
                                                        type="submit"
                                                        disabled={isSubmitting || !formState.isValid}
                                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 h-8 sm:h-auto text-[11px] sm:text-sm"
                                                    >
                                                        {isSubmitting ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                <span>Menyimpan...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                <span>{isEditMode ? 'Update Data' : 'Simpan Data'}</span>
                                                            </div>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}