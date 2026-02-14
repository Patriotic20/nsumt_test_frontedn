import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { roleService, type Role } from '@/services/roleService';
import type { User } from '@/types/auth';
import { Button } from '@/components/ui/Button';
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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const userSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    roles: z.array(z.string()).min(1, 'At least one role is required'),
});

type UserFormValues = z.infer<typeof userSchema>;

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [usersData, rolesData] = await Promise.all([
                userService.getUsers(),
                roleService.getRoles(),
            ]);
            setUsers(usersData.users);
            setRoles(rolesData.roles);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await userService.deleteUser(userToDelete.id);
            // Optimistic update
            setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error('Failed to delete user', error);
            // If deletion fails, re-fetch to ensure consistency
            fetchData();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Manage system users (Teachers, Students)</p>
                </div>
                <Button onClick={handleCreateUser}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
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
                                    <TableHead>Username</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>
                                            {user.roles && user.roles.map((role) => (
                                                <span
                                                    key={role.id}
                                                    className="mr-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                                >
                                                    {role.name}
                                                </span>
                                            ))}
                                        </TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"

                                                    onClick={() => handleDeleteClick(user)}
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

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                availableRoles={roles}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchData();
                }}
            />
            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                description={`Are you sure you want to delete the user "${userToDelete?.username}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

const UserModal = ({
    isOpen,
    onClose,
    user,
    availableRoles,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    availableRoles: Role[];
    onSuccess: () => void;
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        watch,
        setValue,
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: '',
            password: '',
            roles: [],
        }
    });

    const selectedRoles = watch('roles') || [];

    useEffect(() => {
        if (user) {
            reset({
                username: user.username,
                password: '',
                roles: user.roles?.map(r => r.name) || []
            });
        } else {
            reset({ username: '', password: '', roles: [] });
        }
    }, [user, reset]);

    const handleRoleToggle = (roleName: string) => {
        const currentRoles = selectedRoles;
        if (currentRoles.includes(roleName)) {
            setValue('roles', currentRoles.filter(r => r !== roleName));
        } else {
            setValue('roles', [...currentRoles, roleName]);
        }
    };

    const onSubmit = async (data: UserFormValues) => {
        try {
            if (user) {
                const updateData: Record<string, string> = { username: data.username };
                await userService.updateUser(user.id, updateData);
            } else {
                const createPayload = {
                    ...data,
                    roles: data.roles.map(name => ({ name }))
                };
                await userService.createUser(createPayload);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save user', error);
            alert('Failed to save user');
        }
    };

    const roleButtonClass = (roleName: string) => {
        const isSelected = selectedRoles.includes(roleName);
        return isSelected
            ? 'inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ring-1 ring-inset transition-colors bg-primary text-primary-foreground ring-primary'
            : 'inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ring-1 ring-inset transition-colors bg-muted text-muted-foreground ring-input hover:bg-muted/80';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? 'Edit User' : 'Create User'}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Username"
                    {...register('username')}
                    error={errors.username?.message}
                />
                <Input
                    label="Password"
                    type="password"
                    {...register('password')}
                    error={errors.password?.message}
                    placeholder={user ? 'Leave empty to keep current' : ''}
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Roles</label>
                    <div className="flex flex-wrap gap-2">
                        {availableRoles.map(role => (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => handleRoleToggle(role.name)}
                                className={roleButtonClass(role.name)}
                            >
                                {role.name}
                            </button>
                        ))}
                    </div>
                    {errors.roles && (
                        <p className="mt-1 text-xs text-destructive">{errors.roles.message}</p>
                    )}
                    {user && <p className="text-xs text-muted-foreground italic">Note: Role updates are not currently supported by the backend.</p>}
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {user ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default UsersPage;
