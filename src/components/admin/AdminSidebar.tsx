import { LayoutDashboard, Package, ShoppingCart, Settings, ArrowLeft, Users, FileText, Tag } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Products', url: '/admin/products', icon: Package },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Content', url: '/admin/content', icon: FileText },
  { title: 'Coupons', url: '/admin/coupons', icon: Tag },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">RM</span>
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">RoomMuse</h2>
            <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className="flex items-center gap-2"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button variant="ghost" size="sm" asChild className="w-full justify-start">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
