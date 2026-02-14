import { Link, useLocation } from 'react-router-dom';
import {
    Users,
    GraduationCap,
    BookOpen,
    FileText,
    BarChart,
    LogOut,
    Shield,
    Key,
    Building2,
    Layers,
    UsersRound,
    FileQuestion,
} from 'lucide-react';
import { cn } from '@/utils/utils';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: BarChart },
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Teachers', href: '/teachers', icon: GraduationCap },
        { name: 'Roles', href: '/roles', icon: Shield },
        { name: 'Permissions', href: '/permissions', icon: Key },
        { name: 'Faculties', href: '/faculties', icon: Building2 },
        { name: 'Kafedras', href: '/kafedras', icon: Layers },
        { name: 'Groups', href: '/groups', icon: UsersRound },
        { name: 'Students', href: '/students', icon: GraduationCap },
        { name: 'Subjects', href: '/subjects', icon: BookOpen },
        { name: 'Questions', href: '/questions', icon: FileQuestion },
        { name: 'Quizzes', href: '/quizzes', icon: BookOpen },
        { name: 'Results', href: '/results', icon: FileText },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold">NSUMT Admin</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t p-4">
                <button
                    onClick={logout}
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
