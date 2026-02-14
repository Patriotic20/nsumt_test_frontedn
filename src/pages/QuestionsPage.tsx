import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionService, type Question } from '@/services/questionService';
import { subjectService, type Subject } from '@/services/subjectService';
import { userService } from '@/services/userService';
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
import { Plus, Pencil, Trash2, Loader2, FileQuestion, Upload, FileUp } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const QuestionsPage = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [questionsData, subjectsData, usersData] = await Promise.all([
                questionService.getQuestions(),
                subjectService.getSubjects(),
                userService.getUsers(),
            ]);
            setQuestions(questionsData.questions || []);
            setSubjects(subjectsData.subjects);
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

    const handleCreateQuestion = () => {
        navigate('/questions/create');
    };

    const handleEditQuestion = (question: Question) => {
        navigate(`/questions/${question.id}/edit`);
    };

    const handleDeleteClick = (question: Question) => {
        setQuestionToDelete(question);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!questionToDelete) return;
        try {
            await questionService.deleteQuestion(questionToDelete.id);
            fetchData();
            setIsDeleteModalOpen(false);
            setQuestionToDelete(null);
        } catch (error) {
            console.error('Failed to delete question', error);
        }
    };

    const handleSuccess = () => {
        setIsUploadModalOpen(false);
        fetchData();
    };

    const getSubjectName = (id?: number) => subjects.find(s => s.id === id)?.name || '-';
    const getUserName = (id?: number) => users.find(u => u.id === id)?.username || '-';

    // Helper to strip HTML tags for preview
    const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
                    <p className="text-muted-foreground">Manage exam questions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Excel
                    </Button>
                    <Button onClick={handleCreateQuestion}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <FileQuestion className="h-12 w-12 mb-4 opacity-20" />
                            <p>No questions found. Add one manually or import from Excel.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50%]">Question</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {questions.map((question) => {
                                    const plainText = stripHtml(question.text);
                                    return (
                                        <TableRow key={question.id}>
                                            <TableCell className="font-medium">
                                                <div
                                                    className="break-words max-w-md cursor-pointer hover:underline"
                                                    title={plainText}
                                                    onClick={() => handleEditQuestion(question)}
                                                >
                                                    {plainText.length > 100 ? `${plainText.substring(0, 100)}...` : plainText}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getSubjectName(question.subject_id)}</TableCell>
                                            <TableCell>{getUserName(question.user_id)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditQuestion(question)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteClick(question)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleSuccess}
                subjects={subjects}
            />

            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Question"
                description="Are you sure you want to delete this question? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

const UploadModal = ({
    isOpen,
    onClose,
    onSuccess,
    subjects,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    subjects: Subject[];
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [subjectId, setSubjectId] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !subjectId) return;
        try {
            setIsUploading(true);
            await questionService.uploadQuestions(file, parseInt(subjectId));
            onSuccess();
        } catch (error) {
            console.error('Failed to upload file', error);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Import Questions from Excel"
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-10">
                    <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                        Select an Excel file (.xlsx) to upload
                    </p>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100"
                    />
                </div>
                {file && (
                    <div className="text-sm">
                        Selected file: <span className="font-medium">{file.name}</span>
                    </div>
                )}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleUpload} isLoading={isUploading} disabled={!file || !subjectId}>
                        Upload
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default QuestionsPage;
