export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
    emplId?: string; // Added for linking to employee data
}
