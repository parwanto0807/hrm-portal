
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { api as axios } from "@/lib/api";

// Fallback menu structure if API fails or while loading
import { getMenuList as getStaticMenuList } from "@/lib/menu-list";
import { usePathname } from "next/navigation";

export function useMenus() {
    const { getUser } = useAuth();
    const user = getUser();
    const pathname = usePathname();

    const fetchMenus = async () => {
        if (!user?.role) return [];
        // console.log("Fetching menus for role:", user.role);
        const { data } = await axios.get(`/menus/my-menus?role=${user.role}`);
        return data; // Expected: [{ groupLabel: "...", menus: [...] }]
    };

    const { data: menuList, isLoading, isError } = useQuery({
        queryKey: ['menus', user?.role],
        queryFn: fetchMenus,
        enabled: !!user?.role,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Helper to calculate 'active' state for each menu item recursively
    const processActiveState = (groups: any[]) => {
        if (!groups) return [];

        return groups.map((group: any) => ({
            ...group,
            menus: group.menus.map((menu: any) => ({
                ...menu,
                active: pathname === menu.href || pathname.startsWith(menu.href + '/'),
                submenus: menu.submenus?.map((sub: any) => ({
                    ...sub,
                    active: pathname === sub.href
                }))
            }))
        }));
    };

    // Use static list as fallback if error or initially
    const finalMenus = isError || !menuList
        ? user ? getStaticMenuList(pathname, user.role) : []
        : processActiveState(menuList);

    return {
        menuList: finalMenus,
        isLoading
    };
}
