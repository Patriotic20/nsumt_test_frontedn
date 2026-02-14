import { useEffect, useState } from 'react';
import { subjectService, type Subject } from '@/services/subjectService';
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

const subjectSchema = z.object({
    name: z.string().min(1, 'Subject name is required'),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

const SubjectsPage = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await subjectService.getSubjects();
            setSubjects(data.subjects);
        } catch (error) {
            console.error('Failed to fetch subjects', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDeleteClick = (subject: Subject) => {
        setSubjectToDelete(subject);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!subjectToDelete) return;
        try {
            await subjectService.deleteSubject(subjectToDelete.id);
            setSubjects((prev) => prev.filter((item) => item.id !== subjectToDelete.id));
            setIsDeleteModalOpen(false);
            setSubjectToDelete(null);
        } catch (error) {
            console.error('Failed to delete subject', error);
        }
    };

    const handleSuccess = (savedSubject?: Subject) => {
        setIsModalOpen(false);
        if (savedSubject) {
            if (selectedSubject) {
                setSubjects((prev) => prev.map((s) => (s.id === savedSubject.id ? savedSubject : s)));
            } else {
                setSubjects((prev) => [...prev, savedSubject]);
            }
        } else {
            fetchData();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
                    <p className="text-muted-foreground">Manage academic subjects</p>
                </div>
                <Button onClick={() => { setSelectedSubject(null); setIsModalOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subject
                </Button>
            </div>
            <Card>
                <CardHeader><CardTitle>All Subjects</CardTitle></CardHeader>
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
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjects.map((subject) => (
                                    <TableRow key={subject.id}>
                                        <TableCell>{subject.id}</TableCell>
                                        <TableCell className="font-medium">{subject.name}</TableCell>
                                        <TableCell>{new Date(subject.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => { setSelectedSubject(subject); setIsModalOpen(true); }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(subject)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {subjects.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No subjects found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <SubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} subject={selectedSubject}
                onSuccess={handleSuccess} />
            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Subject"
                description={`Are you sure you want to delete the subject "${subjectToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

const SubjectModal = ({ isOpen, onClose, subject, onSuccess }: {
    isOpen: boolean; onClose: () => void; subject: Subject | null; onSuccess: (subject?: Subject) => void;
}) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SubjectFormValues>({
        resolver: zodResolver(subjectSchema),
        defaultValues: { name: '' },
    });

    useEffect(() => {
        reset({ name: subject?.name || '' });
    }, [subject, reset]);

    const onSubmit = async (data: SubjectFormValues) => {
        try {
            let result;
            if (subject) {
                result = await subjectService.updateSubject(subject.id, data);
            } else {
                result = await subjectService.createSubject(data);
            }
            onSuccess(result);
        } catch (error) {
            console.error('Failed to save subject', error);
            alert('Failed to save subject');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={subject ? 'Edit Subject' : 'Create Subject'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Subject Name" {...register('name')} error={errors.name?.message} placeholder="Enter subject name" />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>{subject ? 'Update' : 'Create'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default SubjectsPage;
