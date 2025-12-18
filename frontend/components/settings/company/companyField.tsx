import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";
import { CompanyFormValues } from "@/schemas/company/companySchema";

interface CompanyFieldProps {
    label: string;
    name: keyof CompanyFormValues;
    type?: string;
    required?: boolean;
    defaultValue?: string;
    placeholder?: string;
    maxLength?: number;
    error?: string;
    className?: string;
}

export function CompanyField({
    label,
    name,
    type = "text",
    required = false,
    defaultValue = "",
    placeholder = "",
    maxLength,
    error,
    className = "",
}: CompanyFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
                id={name}
                name={name}
                type={type}
                defaultValue={defaultValue}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                className={className}
            />
            {error && <FormMessage>{error}</FormMessage>}
        </div>
    );
}