import { useAuth } from '@/context/AuthContext';
import { Users, BookOpen, GraduationCap, CheckCircle, FileQuestion, Book, UserCheck, LogOut } from 'lucide-react';
import { cn } from '@/utils/utils';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { teacherService } from '@/services/teacherService';
import { studentService } from '@/services/studentService';
import { subjectService } from '@/services/subjectService';
import { quizService } from '@/services/quizService';
import { questionService } from '@/services/questionService';
import { resultService } from '@/services/resultService';
import { Button } from '@/components/ui/Button';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    className?: string;
    description?: string;
    isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, className, description, isLoading }) => (
    <div className={cn("rounded-xl border bg-card p-6 shadow-sm", className)}>
        <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                {isLoading ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-muted mt-1" />
                ) : (
                    <h3 className="text-2xl font-bold">{value}</h3>
                )}
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user, logout } = useAuth();

    const { data: users, isLoading: isUsersLoading } = useQuery({
        queryKey: ['dashboard-users'],
        queryFn: () => userService.getUsers(1, 1),
    });

    const { data: teachers, isLoading: isTeachersLoading } = useQuery({
        queryKey: ['dashboard-teachers'],
        queryFn: () => teacherService.getTeachers(1, 1),
    });

    const { data: students, isLoading: isStudentsLoading } = useQuery({
        queryKey: ['dashboard-students'],
        queryFn: () => studentService.getStudents(1, 1),
    });

    const { data: subjects, isLoading: isSubjectsLoading } = useQuery({
        queryKey: ['dashboard-subjects'],
        queryFn: () => subjectService.getSubjects(1, 1),
    });

    const { data: quizzes, isLoading: isQuizzesLoading } = useQuery({
        queryKey: ['dashboard-quizzes'],
        queryFn: () => quizService.getQuizzes(1, 1),
    });

    const { data: questions, isLoading: isQuestionsLoading } = useQuery({
        queryKey: ['dashboard-questions'],
        queryFn: () => questionService.getQuestions(1, 1),
    });

    const { data: results, isLoading: isResultsLoading } = useQuery({
        queryKey: ['dashboard-results'],
        queryFn: () => resultService.getResults(1, 1),
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, <span className="font-semibold text-foreground">{user?.username}</span>
                    </p>
                </div>
                <Button variant="danger" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Users"
                    value={users?.total || 0}
                    icon={Users}
                    isLoading={isUsersLoading}
                />
                <StatCard
                    label="Total Students"
                    value={students?.total || 0}
                    icon={UserCheck}
                    isLoading={isStudentsLoading}
                />
                <StatCard
                    label="Total Teachers"
                    value={teachers?.total || 0}
                    icon={GraduationCap}
                    isLoading={isTeachersLoading}
                />
                <StatCard
                    label="Subjects"
                    value={subjects?.total || 0}
                    icon={Book}
                    isLoading={isSubjectsLoading}
                />
                <StatCard
                    label="Total Quizzes"
                    value={quizzes?.total || 0}
                    icon={BookOpen}
                    isLoading={isQuizzesLoading}
                />
                <StatCard
                    label="Questions Bank"
                    value={questions?.total || 0}
                    icon={FileQuestion}
                    isLoading={isQuestionsLoading}
                />
                <StatCard
                    label="Completed Tests"
                    value={results?.total || 0}
                    icon={CheckCircle}
                    isLoading={isResultsLoading}
                />
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold">System Overview</h2>
                <div className="mt-4 p-8 text-center text-muted-foreground">
                    <p>Select a module from the sidebar to manage resources.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
