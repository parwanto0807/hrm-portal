import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SidebarToggleState {
    isOpen: boolean;
    setIsOpen: () => void;
}

export const useSidebarToggle = create(
    persist<SidebarToggleState>(
        (set, get) => ({
            isOpen: true,
            setIsOpen: () => {
                set({ isOpen: !get().isOpen });
            },
        }),
        {
            name: 'sidebarOpen',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
