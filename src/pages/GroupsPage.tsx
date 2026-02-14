import { useEffect, useState } from 'react';
import { groupService, type Group } from '@/services/groupService';
import { facultyService, type Faculty } from '@/services/facultyService';
import { Button } from '@/components/ui/Button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const groupSchema = z.object({
    name: z.string().min(1, 'Group name is required'),
    faculty_id: z.number({ message: 'Faculty is required' }).min(1, 'Select a faculty'),
});

type GroupFormValues = z.infer<typeof groupSchema>;

const GroupsPage = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [groupsData, facultiesData] = await Promise.all([
                groupService.getGroups(),
                facultyService.getFaculties(),
            ]);
            setGroups(groupsData.groups);
            setFaculties(facultiesData.faculties);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDeleteClick = (group: Group) => {
        setGroupToDelete(group);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!groupToDelete) return;

        try {
            await groupService.deleteGroup(groupToDelete.id);
            setGroups((prev) => prev.filter((item) => item.id !== groupToDelete.id)); // Optimistic update
            setIsDeleteModalOpen(false);
            setGroupToDelete(null);
        } catch (error) {
            console.error('Failed to delete group', error);
        }
    };

    const getFacultyName = (facultyId: number) => {
        const faculty = faculties.find(f => f.id === facultyId);
        return faculty ? faculty.name : `ID: ${facultyId}`;
    };

    const handleSuccess = (savedGroup?: Group) => {
        setIsModalOpen(false);
        if (savedGroup) {
            if (selectedGroup) {
                setGroups((prev) => prev.map((g) => (g.id === savedGroup.id ? savedGroup : g)));
            } else {
                setGroups((prev) => [...prev, savedGroup]);
            }
        } else {
            fetchData();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
                    <p className="text-muted-foreground">Manage student groups</p>
                </div>
                <Button onClick={() => { setSelectedGroup(null); setIsModalOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Group
                </Button>
            </div>
            <Card>
                <CardHeader><CardTitle>All Groups</CardTitle></CardHeader>
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Faculty</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groups.map((group) => (
                                    <TableRow key={group.id}>
                                        <TableCell>{group.id}</TableCell>
                                        <TableCell className="font-medium">{group.name}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                                                {getFacultyName(group.faculty_id)}
                                            </span>
                                        </TableCell>
                                        <TableCell>{new Date(group.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => { setSelectedGroup(group); setIsModalOpen(true); }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(group)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {groups.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No groups found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <GroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} group={selectedGroup}
                faculties={faculties} onSuccess={handleSuccess} />
            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Group"
                description={`Are you sure you want to delete the group "${groupToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

const GroupModal = ({ isOpen, onClose, group, faculties, onSuccess }: {
    isOpen: boolean; onClose: () => void; group: Group | null; faculties: Faculty[]; onSuccess: (group?: Group) => void;
}) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue, watch } = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: { name: '', faculty_id: 0 },
    });

    const selectedFacultyId = watch('faculty_id');

    useEffect(() => {
        if (group) {
            reset({ name: group.name, faculty_id: group.faculty_id });
        } else {
            reset({ name: '', faculty_id: 0 });
        }
    }, [group, reset]);

    const onSubmit = async (data: GroupFormValues) => {
        try {
            let result;
            if (group) {
                result = await groupService.updateGroup(group.id, data);
            } else {
                result = await groupService.createGroup(data);
            }
            onSuccess(result);
        } catch (error) {
            console.error('Failed to save group', error);
            alert('Failed to save group');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={group ? 'Edit Group' : 'Create Group'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Group Name" {...register('name')} error={errors.name?.message} placeholder="Enter group name" />
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Faculty</label>
                    <select
                        value={selectedFacultyId}
                        onChange={(e) => setValue('faculty_id', Number(e.target.value))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value={0}>Select a faculty...</option>
                        {faculties.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                        ))}
                    </select>
                    {errors.faculty_id && (
                        <p className="mt-1 text-xs text-destructive">{errors.faculty_id.message}</p>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>{group ? 'Update' : 'Create'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default GroupsPage;
