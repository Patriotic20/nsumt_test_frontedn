import { useEffect, useState } from 'react';
import { teacherService, type Teacher, type TeacherCreateRequest } from '@/services/teacherService';
import { kafedraService, type Kafedra } from '@/services/kafedraService';
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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const teacherSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    third_name: z.string().min(1, 'Third name is required'),
    kafedra_id: z.number({ message: 'Kafedra is required' }).min(1, 'Select a kafedra'),
    user_id: z.number({ message: 'User is required' }).min(1, 'Select a user'),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

const TeachersPage = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [kafedras, setKafedras] = useState<Kafedra[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [teachersData, kafedrasData, usersData] = await Promise.all([
                teacherService.getTeachers(1, 100),
                kafedraService.getKafedras(),
                userService.getUsers(1, 100),
            ]);
            setTeachers(teachersData.teachers);
            setKafedras(kafedrasData.kafedras);
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

    const handleCreateTeacher = () => {
        setSelectedTeacher(null);
        setIsModalOpen(true);
    };

    const handleEditTeacher = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsModalOpen(true);
    };



    const handleDeleteClick = (teacher: Teacher) => {
        setTeacherToDelete(teacher);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!teacherToDelete) return;
        try {
            await teacherService.deleteTeacher(teacherToDelete.id);
            setTeachers((prev) => prev.filter((item) => item.id !== teacherToDelete.id));
            setIsDeleteModalOpen(false);
            setTeacherToDelete(null);
        } catch (error) {
            console.error('Failed to delete teacher', error);
        }
    };

    const getKafedraName = (kafedraId: number) => {
        const kafedra = kafedras.find(k => k.id === kafedraId);
        return kafedra ? kafedra.name : `ID: ${kafedraId}`;
    };

    const getUserName = (userId: number) => {
        const user = users.find(u => u.id === userId);
        return user ? user.username : `ID: ${userId}`;
    };

    const handleSuccess = (savedTeacher?: Teacher) => {
        setIsModalOpen(false);
        if (savedTeacher) {
            if (selectedTeacher) {
                setTeachers((prev) => prev.map((t) => (t.id === savedTeacher.id ? savedTeacher : t)));
            } else {
                setTeachers((prev) => [...prev, savedTeacher]);
            }
        } else {
            fetchData();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
                    <p className="text-muted-foreground">Manage teacher records</p>
                </div>
                <Button onClick={handleCreateTeacher}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Teacher
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Kafedra</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell>{teacher.id}</TableCell>
                                        <TableCell className="font-medium">{teacher.full_name}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {getKafedraName(teacher.kafedra_id)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                                                {getUserName(teacher.user_id)}
                                            </span>
                                        </TableCell>
                                        <TableCell>{new Date(teacher.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditTeacher(teacher)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteClick(teacher)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {teachers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No teachers found. Click "Add Teacher" to create one.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <TeacherModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                teacher={selectedTeacher}
                kafedras={kafedras}
                users={users}
                onSuccess={handleSuccess}
            />

            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Teacher"
                description={`Are you sure you want to delete the teacher "${teacherToDelete?.full_name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

const TeacherModal = ({
    isOpen,
    onClose,
    teacher,
    kafedras,
    users,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    teacher: Teacher | null;
    kafedras: Kafedra[];
    users: User[];
    onSuccess: (teacher?: Teacher) => void;
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<TeacherFormValues>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            third_name: '',
            kafedra_id: 0,
            user_id: 0,
        },
    });

    const selectedKafedraId = watch('kafedra_id');
    const selectedUserId = watch('user_id');

    useEffect(() => {
        if (teacher) {
            reset({
                first_name: teacher.first_name,
                last_name: teacher.last_name,
                third_name: teacher.third_name,
                kafedra_id: teacher.kafedra_id,
                user_id: teacher.user_id,
            });
        } else {
            reset({
                first_name: '',
                last_name: '',
                third_name: '',
                kafedra_id: 0,
                user_id: 0,
            });
        }
    }, [teacher, reset]);

    const onSubmit = async (data: TeacherFormValues) => {
        try {
            const payload: TeacherCreateRequest = {
                first_name: data.first_name,
                last_name: data.last_name,
                third_name: data.third_name,
                kafedra_id: data.kafedra_id,
                user_id: data.user_id,
            };

            let result;
            if (teacher) {
                result = await teacherService.updateTeacher(teacher.id, payload);
            } else {
                result = await teacherService.createTeacher(payload);
            }
            onSuccess(result);
        } catch (error) {
            console.error('Failed to save teacher', error);
            alert('Failed to save teacher');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={teacher ? 'Edit Teacher' : 'Create Teacher'}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="First Name"
                    {...register('first_name')}
                    error={errors.first_name?.message}
                    placeholder="Enter first name"
                />
                <Input
                    label="Last Name"
                    {...register('last_name')}
                    error={errors.last_name?.message}
                    placeholder="Enter last name"
                />
                <Input
                    label="Third Name"
                    {...register('third_name')}
                    error={errors.third_name?.message}
                    placeholder="Enter third name (patronymic)"
                />

                {/* Kafedra Select */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Kafedra</label>
                    <select
                        value={selectedKafedraId}
                        onChange={(e) => setValue('kafedra_id', Number(e.target.value))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value={0}>Select a kafedra...</option>
                        {kafedras.map((kafedra) => (
                            <option key={kafedra.id} value={kafedra.id}>
                                {kafedra.name}
                            </option>
                        ))}
                    </select>
                    {errors.kafedra_id && (
                        <p className="mt-1 text-xs text-destructive">{errors.kafedra_id.message}</p>
                    )}
                </div>

                {/* User Select */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">User Account</label>
                    <select
                        value={selectedUserId}
                        onChange={(e) => setValue('user_id', Number(e.target.value))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value={0}>Select a user...</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                    {errors.user_id && (
                        <p className="mt-1 text-xs text-destructive">{errors.user_id.message}</p>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {teacher ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TeachersPage;
