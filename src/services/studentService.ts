import api from './api';

export interface Student {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    third_name: string;
    full_name: string;
    group_id: number;
    created_at: string;
    updated_at: string;
}

export interface StudentCreateRequest {
    first_name: string;
    last_name: string;
    third_name: string;
    group_id: number;
    user_id: number; // Links to a user in the auth system
}

export interface StudentListResponse {
    total: number;
    page: number;
    limit: number;
    students: Student[];
}

export const studentService = {
    getStudents: async (page = 1, limit = 10) => {
        const response = await api.get<StudentListResponse>('/student/', {
            params: { page, limit },
        });
        return response.data;
    },

    createStudent: async (data: StudentCreateRequest) => {
        const response = await api.post('/student/', data);
        return response.data;
    },

    updateStudent: async (id: number, data: StudentCreateRequest) => {
        const response = await api.put(`/student/${id}`, data);
        return response.data;
    },

    deleteStudent: async (id: number) => {
        await api.delete(`/student/${id}`);
    },
};
