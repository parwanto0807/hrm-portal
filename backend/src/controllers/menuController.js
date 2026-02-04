import { prisma } from '../config/prisma.js';

// GET /api/menus/my-menus?role=ADMIN
export const getMyMenus = async (req, res) => {
  try {
    const { role } = req.query; // In real secure app, get role from decoded token

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Fetch menus linked to this role
    const roleMenus = await prisma.roleMenu.findMany({
      where: {
        role: role,
        menu: {
            isActive: true
        }
      },
      include: {
        menu: true,
      },
      orderBy: {
        menu: {
          order: 'asc',
        },
      },
    });

    const menus = roleMenus.map(rm => rm.menu);

    // Group by groupLabel
    const grouped = menus.reduce((acc, menu) => {
      const group = menu.groupLabel || 'Other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(menu);
      return acc;
    }, {});

    // Format for frontend: [{ groupLabel: "Main", menus: [...] }]
    const formatted = Object.keys(grouped).map(group => ({
      groupLabel: group,
      menus: grouped[group].map(m => ({
        href: m.href,
        label: m.label,
        icon: m.icon,
        active: false, // Calculated on frontend
        submenus: [] // TODO: Implement hierarchy if needed
      }))
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
};
