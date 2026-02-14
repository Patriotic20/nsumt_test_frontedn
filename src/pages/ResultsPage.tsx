import { useEffect, useState } from 'react';
import { resultService, type Result } from '@/services/resultService';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Loader2, FileText } from 'lucide-react';

const ResultsPage = () => {
    const [results, setResults] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchResults = async () => {
        try {
            setIsLoading(true);
            const data = await resultService.getResults();
            setResults(data.results || []);
        } catch (error) {
            console.error('Failed to fetch results', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Results</h1>
                    <p className="text-muted-foreground">View student quiz performance</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Results</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mb-4 opacity-20" />
                            <p>No results found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Quiz</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Correct / Total</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((result) => (
                                    <TableRow key={result.id}>
                                        <TableCell>{result.id}</TableCell>
                                        <TableCell className="font-medium">
                                            {result.user?.username || `User ${result.user_id}`}
                                        </TableCell>
                                        <TableCell>{result.quiz?.title || `Quiz ${result.quiz_id}`}</TableCell>
                                        <TableCell>
                                            <span className={
                                                result.score >= 80 ? "text-green-600 font-medium" :
                                                    result.score >= 50 ? "text-yellow-600" :
                                                        "text-red-600"
                                            }>
                                                {result.score}%
                                            </span>
                                        </TableCell>
                                        <TableCell>{result.correct_answers} / {result.total_questions}</TableCell>
                                        <TableCell>{new Date(result.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ResultsPage;
