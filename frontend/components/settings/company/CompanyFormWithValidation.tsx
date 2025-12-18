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
    Upload
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
    const isEditMode = Boolean(initialData?.id); // Use ID to determine edit mode is safer
    const [progress, setProgress] = React.useState(0);


    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
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

    // Update progress when values change
    const { watch } = form;
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
        const totalFields = Object.keys(values).length;
        if (totalFields === 0) return;

        const filledFields = Object.values(values).filter(
            (value) => value !== null && value !== "" && value !== undefined
        ).length;

        const newProgress = Math.round((filledFields / totalFields) * 100);
        setProgress(newProgress);
    }, [values]);


    const onSubmit = async (data: CompanyFormValues) => {
        console.log("Submitting form data:", data);
        try {
            let result;
            if (isEditMode && initialData?.id) {
                // UPDATE MODE
                console.log("Mode: Update", initialData.id);
                result = await updateCompanyAction(initialData.id, data);
            } else {
                // CREATE MODE
                console.log("Mode: Create");
                result = await createCompanyAction(data);
            }

            console.log("Action result:", result);

            if (result.success) {
                console.log("Triggering success toast...");
                toast.success(isEditMode ? "Data Perusahaan berhasil diperbarui" : "Perusahaan berhasil didaftarkan");
            } else {
                console.error("Action Failed:", result.error);
                toast.error(result.error || "Terjadi kesalahan saat menyimpan data");
            }

        } catch (error) {
            console.error("Error submitting form:", error);
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan internal";
            toast.error(errorMessage);
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

    const onInvalid = (errors: FieldErrors<CompanyFormValues>) => {
        console.error("Form Validation Errors:", errors);
        toast.error("Form tidak valid. Periksa isian anda.");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-4 px-2 sm:py-2 sm:px-4">

            {/* Alert Information */}
            <div className="max-w-full mx-auto mb-2 sm:mb-4">
                <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm sm:text-base">
                        Pastikan semua data diisi dengan benar. Data yang sudah disimpan akan digunakan untuk semua dokumen resmi perusahaan.
                        {/* <Button
                            variant="default"
                            size="sm"
                            className="ml-4"
                            onClick={() => {
                                console.log("Test toast clicked");
                                toast.success("Toast Test Berhasil!", { duration: 5000 });
                            }}
                        >
                            Test Toast
                        </Button> */}
                    </AlertDescription>
                </Alert>
            </div>

            {/* Form Container - Full Width Responsive */}
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
                                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Auto-save
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
                                            {/* Progress Box Styled like Sidebar Button */}
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
                                                return (
                                                    <button
                                                        key={section.id}
                                                        type="button"
                                                        className={`w-full p-4 rounded-lg text-left transition-all hover:scale-[1.02] ${getIconColor(section.color)} dark:hover:bg-gray-800 hover:shadow-md group`}
                                                        onClick={() => {
                                                            const element = document.getElementById(`section-${section.id}`);
                                                            element?.scrollIntoView({ behavior: 'smooth' });
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${getIconColor(section.color)}`}>
                                                                <Icon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-800 dark:text-black dark:group-hover:text-white">{section.title}</h3>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {section.fields.length} field
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}

                                            {/* Quick Info Box */}
                                            <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg border dark:border-gray-700">
                                                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Tips Pengisian</h4>
                                                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                    <li className="flex items-start gap-2">
                                                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1"></div>
                                                        <span>Isi data sesuai dengan dokumen resmi</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full mt-1"></div>
                                                        <span>Periksa kembali sebelum menyimpan</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <div className="h-1.5 w-1.5 bg-purple-500 rounded-full mt-1"></div>
                                                        <span>Simpan draft jika belum lengkap</span>
                                                    </li>
                                                </ul>
                                            </div>
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
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                    Nama Perusahaan
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Nama lengkap perusahaan"
                                                                        maxLength={40}
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                    Alamat Jalan
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Jl. Raya Utama No. 123"
                                                                        maxLength={40}
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                            className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="address3"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="font-medium text-gray-700 dark:text-gray-300">
                                                                        Kota & Provinsi
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Kota, Provinsi, Kode Pos"
                                                                            maxLength={40}
                                                                            className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
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
                                                                    Telepon
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="(021) 1234-5678"
                                                                        maxLength={15}
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                    NPWP Perusahaan
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="XX.XXX.XXX.X-XXX.XXX"
                                                                        maxLength={20}
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                            className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                            {...field}
                                                                            value={field.value ?? ""}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
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
                                                                    Nama Direktur
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Nama lengkap direktur"
                                                                        maxLength={25}
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
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
                                                    <p>Pastikan semua data yang diisi sudah benar dan valid</p>
                                                    <p className="text-xs mt-1">
                                                        Fields dengan tanda <span className="text-red-500">*</span> wajib diisi
                                                    </p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="px-6 py-6 dark:border-gray-700 dark:text-gray-300"
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
                                                        disabled={form.formState.isSubmitting}
                                                    >
                                                        <Save className="h-5 w-5 mr-2" />
                                                        {form.formState.isSubmitting
                                                            ? "Memproses..."
                                                            : isEditMode
                                                                ? "Update Data Perusahaan"
                                                                : "Daftarkan Perusahaan"
                                                        }
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