import { useEffect, useState } from 'react';
import { studentService, type Student, type StudentCreateRequest } from '@/services/studentService';
import { groupService, type Group } from '@/services/groupService';
import { userService } from '@/services/userService';
import type { User } from '@/types/auth';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Plus, Pencil, Trash2, Loader2, User as UserIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const studentSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    third_name: z.string().optional(),
    group_id: z.string().min(1, 'Group is required'),
    user_id: z.string().min(1, 'User is required'),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const StudentsPage = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [studentsData, groupsData, usersData] = await Promise.all([
                studentService.getStudents(),
                groupService.getGroups(),
                userService.getUsers(),
            ]);
            setStudents(studentsData.students);
            setGroups(groupsData.groups);
            setUsers(usersData.users);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClick = (student: Student) => {
        setStudentToDelete(student);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;
        try {
            await studentService.deleteStudent(studentToDelete.id);
            setStudents((prev) => prev.filter((item) => item.id !== studentToDelete.id));
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
        } catch (error) {
            console.error('Failed to delete student', error);
            fetchData(); // Refetch on error to ensure consistency
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchData(); // Refetch to get updated list (including full names etc if server generated)
    };

    const getGroupName = (groupId: number) => {
        return groups.find(g => g.id === groupId)?.name || 'Unknown Group';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                    <p className="text-muted-foreground">Manage student records</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Students</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <UserIcon className="h-12 w-12 mb-4 opacity-20" />
                            <p>No students found. Create one to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Group</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell className="font-medium">{student.full_name}</TableCell>
                                        <TableCell>{getGroupName(student.group_id)}</TableCell>
                                        <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteClick(student)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                student={selectedStudent}
                groups={groups}
                users={users}
                onSuccess={handleSuccess}
            />

            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Student"
                description={`Are you sure you want to delete '${studentToDelete?.full_name}'? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

const StudentModal = ({
    isOpen,
    onClose,
    student,
    groups,
    users,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    groups: Group[];
    users: User[];
    onSuccess: (student?: Student) => void;
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
    });

    useEffect(() => {
        if (student) {
            reset({
                first_name: student.first_name,
                last_name: student.last_name,
                third_name: student.third_name || '',
                group_id: student.group_id.toString(), // Convert to string for select
                user_id: student.user_id.toString(), // Convert to string for select
            });
        }
    }, [student, reset]);

    const onSubmit = async (data: StudentFormValues) => {
        try {
            const payload: StudentCreateRequest = {
                first_name: data.first_name,
                last_name: data.last_name,
                third_name: data.third_name || '',
                group_id: parseInt(data.group_id, 10),
                user_id: parseInt(data.user_id, 10),
            };

            if (student) {
                await studentService.updateStudent(student.id, payload);
                onSuccess();
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save student', error);
            alert('Failed to save student');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Student"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        {...register('first_name')}
                        error={errors.first_name?.message}
                    />
                    <Input
                        label="Last Name"
                        {...register('last_name')}
                        error={errors.last_name?.message}
                    />
                </div>
                <Input
                    label="Third Name (Optional)"
                    {...register('third_name')}
                    error={errors.third_name?.message}
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium">Group</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...register('group_id')}
                    >
                        <option value="">Select a group</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                    {errors.group_id && (
                        <p className="text-xs text-destructive">{errors.group_id.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">User Account</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...register('user_id')}
                    >
                        <option value="">Select a user account</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground">Select the system user account for this student.</p>
                    {errors.user_id && (
                        <p className="text-xs text-destructive">{errors.user_id.message}</p>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        Update
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default StudentsPage;
