import api from './api';
import type { User } from '@/types/auth';
import type { Quiz } from '@/services/quizService';

export interface Result {
    id: number;
    score: number;
    total_questions: number;
    correct_answers: number;
    quiz_id: number;
    user_id: number;
    created_at: string;
    user?: User;
    quiz?: Quiz;
}

export interface ResultListResponse {
    total: number;
    page: number;
    limit: number;
    results: Result[];
}

export const resultService = {
    getResults: async (page = 1, limit = 10) => {
        const response = await api.get<ResultListResponse>('/result/', {
            params: { page, limit },
        });
        return response.data;
    },

    getUserResults: async (userId: number, page = 1, limit = 10) => {
        const response = await api.get<ResultListResponse>(`/result/user/${userId}`, {
            params: { page, limit },
        });
        return response.data;
    },
    getResultById: async (id: number): Promise<Result> => {
        const response = await api.get<Result>(`/result/${id}`);
        return response.data;
    },

    deleteResult: async (id: number): Promise<void> => {
        await api.delete(`/result/${id}`);
    },
};
