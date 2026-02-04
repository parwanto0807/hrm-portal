export interface SubmenuItem {
    href: string;
    label: string;
    active?: boolean;
    disabled?: boolean;
}

export interface MenuItem {
    href: string;
    label: string;
    active?: boolean;
    icon: React.ElementType;
    submenus?: SubmenuItem[];
    disabled?: boolean;
    roles?: string[];
}

export interface MenuGroup {
    groupLabel: string;
    menus: MenuItem[];
    allowedRoles?: string[];
}
