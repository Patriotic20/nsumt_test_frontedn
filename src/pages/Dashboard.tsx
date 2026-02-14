import { useAuth } from '@/context/AuthContext';
import { Users, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

interface StatCardProps {
    label: string;
    value: string;
    icon: React.ElementType;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, className }) => (
    <div className={cn("rounded-xl border bg-card p-6 shadow-sm", className)}>
        <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, <span className="font-semibold text-foreground">{user?.username}</span>
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Users" value="1,234" icon={Users} />
                <StatCard label="Total Teachers" value="56" icon={GraduationCap} />
                <StatCard label="Active Quizzes" value="12" icon={BookOpen} />
                <StatCard label="Completed Tests" value="892" icon={CheckCircle} />
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <div className="mt-4 flex items-center justify-center p-8 text-muted-foreground">
                    No recent activity to show
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
