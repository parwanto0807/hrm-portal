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

    // Watch form values for progress calculation
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

    // Update progress when values change
    useEffect(() => {
        const totalFields = Object.keys(companySchema.shape).length;
        if (totalFields === 0) return;

        const filledFields = Object.values(values).filter(
            (value) => value !== null && value !== "" && value !== undefined
        ).length;

        const newProgress = Math.round((filledFields / totalFields) * 100);
        setProgress(newProgress);
    }, [values]);

    // Helper function to check if field has error
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

                // Reset form after successful creation
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

        // Show first error message
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
            toast.error(`Validasi gagal: ${firstError.message}`, {
                icon: <AlertCircle className="h-4 w-4" />,
            });
        } else {
            toast.error("Form tidak valid. Periksa semua isian yang wajib diisi.");
        }

        // Scroll to first error
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-4 px-2 sm:py-2 sm:px-4">

            {/* Alert Information */}
            <div className="max-w-full mx-auto mb-2 sm:mb-4">
                <Alert className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 ${Object.keys(formState.errors).length > 0 ? 'border-red-300 dark:border-red-800' : ''
                    }`}>
                    <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm sm:text-base">
                        {Object.keys(formState.errors).length > 0 ? (
                            <span className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" />
                                Terdapat {Object.keys(formState.errors).length} kesalahan validasi. Perbaiki sebelum menyimpan.
                            </span>
                        ) : (
                            "Pastikan semua data diisi dengan benar. Data yang sudah disimpan akan digunakan untuk semua dokumen resmi perusahaan."
                        )}
                    </AlertDescription>
                </Alert>
            </div>

            {/* Form Container */}
            <div className="w-full mx-auto">
                <Card className="border dark:border-gray-800 shadow-lg dark:shadow-gray-900/30 rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b dark:border-gray-800 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                                    Form Data Perusahaan
                                </CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                                    Lengkapi semua informasi dibawah ini dengan data yang valid dan akurat
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    v2.0
                                </Badge>
                                <Badge className={`${formState.isValid ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'} text-white`}>
                                    {formState.isValid ? (
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                    ) : (
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {formState.isValid ? 'Valid' : 'Periksa Validasi'}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-3 sm:p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6 sm:space-y-8">
                                {/* Mobile Navigation Tabs */}
                                <div className="sm:hidden overflow-x-auto pb-2">
                                    <div className="flex space-x-2 min-w-max">
                                        {formSections.map((section) => (
                                            <Button
                                                key={section.id}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 whitespace-nowrap"
                                                onClick={() => {
                                                    const element = document.getElementById(`section-${section.id}`);
                                                    element?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                            >
                                                <section.icon className="h-3 w-3" />
                                                {section.title}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Desktop Sidebar + Content Layout */}
                                <div className="flex flex-col lg:flex-row gap-6">
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
                                                        className={`w-full p-4 rounded-lg text-left transition-all hover:scale-[1.02] ${getIconColor(section.color)} ${hasSectionError ? 'border-2 border-red-300 dark:border-red-700' : ''
                                                            } dark:hover:bg-gray-800 hover:shadow-md group`}
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
                                    <div className="flex-1 space-y-6 sm:space-y-8">
                                        {/* Group 1: Identitas Perusahaan */}
                                        <section id="section-1" className="scroll-mt-20">
                                            <div className="space-y-4 sm:space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${getIconColor("blue")}`}>
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                                                            Identitas Perusahaan
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Data utama identifikasi perusahaan
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="kodeCmpy"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                    <Hash className="h-4 w-4" />
                                                                    Kode Perusahaan <span className="text-red-500">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Ex: 001, ABC, XYZ"
                                                                        maxLength={3}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('kodeCmpy') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Kode unik 3 karakter untuk identifikasi internal
                                                                </p>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="company"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                    <Building2 className="h-4 w-4" />
                                                                    Nama Perusahaan <span className="text-red-500">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Nama lengkap perusahaan"
                                                                        maxLength={40}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('company') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <Separator className="dark:bg-gray-800" />

                                        {/* Group 2: Alamat Perusahaan */}
                                        <section id="section-2" className="scroll-mt-20">
                                            <div className="space-y-4 sm:space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${getIconColor("green")}`}>
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                                                            Alamat Perusahaan
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Lokasi dan domisili resmi perusahaan
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="address1"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                                                                    Alamat Jalan <span className="text-red-500">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Jl. Raya Utama No. 123"
                                                                        maxLength={40}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('address1') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="address2"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                                                                        Kelurahan & Kecamatan
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Kelurahan, Kecamatan"
                                                                            maxLength={40}
                                                                            className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('address2') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                                }`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="address3"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                                                                        Kota & Provinsi <span className="text-red-500">*</span>
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Kota, Provinsi, Kode Pos"
                                                                            maxLength={40}
                                                                            className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('address3') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                                }`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <Separator className="dark:bg-gray-800" />

                                        {/* Group 3: Kontak & Komunikasi */}
                                        <section id="section-3" className="scroll-mt-20">
                                            <div className="space-y-4 sm:space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${getIconColor("purple")}`}>
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                                                            Kontak & Komunikasi
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Informasi kontak resmi perusahaan
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="tlp"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                    <Phone className="h-4 w-4" />
                                                                    Telepon <span className="text-red-500">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="(021) 1234-5678"
                                                                        maxLength={15}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('tlp') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="fax"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                                                                    Fax
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="(021) 1234-5679"
                                                                        maxLength={15}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('fax') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                    <Mail className="h-4 w-4" />
                                                                    Email Resmi
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="email"
                                                                        placeholder="hrd@company.com"
                                                                        maxLength={30}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('email') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="homepage"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                    <Globe className="h-4 w-4" />
                                                                    Website
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="https://company.com"
                                                                        maxLength={50}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('homepage') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <Separator className="dark:bg-gray-800" />

                                        {/* Group 4: Data Legal & Pajak */}
                                        <section id="section-4" className="scroll-mt-20">
                                            <div className="space-y-4 sm:space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${getIconColor("red")}`}>
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                                                            Data Legal & Pajak
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Dokumen dan nomor legal perusahaan
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="npwp"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                    <BadgePercent className="h-4 w-4" />
                                                                    NPWP Perusahaan <span className="text-red-500">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="XX.XXX.XXX.X-XXX.XXX"
                                                                        maxLength={20}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('npwp') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="npp"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                    <FileDigit className="h-4 w-4" />
                                                                    Nomor Pokok Perusahaan
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Nomor Pokok Perusahaan"
                                                                        maxLength={30}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('npp') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="lg:col-span-2">
                                                        <FormField
                                                            control={form.control}
                                                            name="astekBayar"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                                                                        Informasi Astek Bayar
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Informasi detail tentang pembayaran astek"
                                                                            maxLength={80}
                                                                            className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('astekBayar') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                                }`}
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <Separator className="dark:bg-gray-800" />

                                        {/* Group 5: Direksi & Manajemen */}
                                        <section id="section-5" className="scroll-mt-20">
                                            <div className="space-y-4 sm:space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${getIconColor("amber")}`}>
                                                        <Users className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                                                            Direksi & Manajemen
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Data pimpinan dan manajemen perusahaan
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="director"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                    <UserCircle className="h-4 w-4" />
                                                                    Nama Direktur <span className="text-red-500">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Nama lengkap direktur"
                                                                        maxLength={25}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('director') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="npwpDir"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                                                                    NPWP Direktur
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="XX.XXX.XXX.X-XXX.XXX"
                                                                        maxLength={20}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('npwpDir') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="hrdMng"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                                                                    HRD Manager
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Nama HRD Manager"
                                                                        maxLength={30}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('hrdMng') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="npwpMng"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                                                                    NPWP HRD Manager
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="XX.XXX.XXX.X-XXX.XXX"
                                                                        maxLength={20}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('npwpMng') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <Separator className="dark:bg-gray-800" />

                                        {/* Group 6: Data Tambahan */}
                                        <section id="section-6" className="scroll-mt-20">
                                            <div className="space-y-4 sm:space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${getIconColor("indigo")}`}>
                                                        <Briefcase className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                                                            Data Tambahan
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Informasi pendukung lainnya
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="logo"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                    <Upload className="h-4 w-4" />
                                                                    URL Logo Perusahaan
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="https://example.com/logo.png"
                                                                        maxLength={80}
                                                                        className={`h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${hasError('logo') ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''
                                                                            }`}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Link gambar logo perusahaan (opsional)
                                                                </p>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {/* Preview Section */}
                                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                                        <div className="text-center">
                                                            <Globe className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Preview logo akan muncul di sini
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                Format: PNG, JPG, SVG
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Action Buttons */}
                                        <div className="pt-6 mt-6 border-t dark:border-gray-800">
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {Object.keys(formState.errors).length > 0 ? (
                                                        <div className="text-red-600 dark:text-red-400">
                                                            <p className="font-medium">⚠️ Ada {Object.keys(formState.errors).length} kesalahan validasi</p>
                                                            <p className="text-xs mt-1">Perbaiki field yang ditandai merah sebelum menyimpan</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p>Semua data sudah valid dan siap disimpan</p>
                                                            <p className="text-xs mt-1">
                                                                Fields dengan tanda <span className="text-red-500">*</span> wajib diisi
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="px-6 py-6 dark:border-gray-700 dark:text-gray-300"
                                                                disabled={isSubmitting}
                                                            >
                                                                Reset Form
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Tindakan ini akan menghapus semua data yang telah anda isi di form ini.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => form.reset()}>Lanjutkan Reset</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <Button
                                                        type="submit"
                                                        className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                                        disabled={isSubmitting || !formState.isValid}
                                                    >
                                                        {isSubmitting ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                Memproses...
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Save className="h-5 w-5 mr-2" />
                                                                {isEditMode ? "Update Data Perusahaan" : "Daftarkan Perusahaan"}
                                                            </>
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

                {/* Footer Note */}
                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Data perusahaan ini akan terekam secara permanen dalam sistem dan digunakan untuk keperluan resmi</p>
                    <p className="mt-1">© 2025 HR Management System • v2.0</p>
                </div>
            </div>
        </div>
    );
}