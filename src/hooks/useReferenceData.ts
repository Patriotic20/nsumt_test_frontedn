import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '@/services/facultyService';
import { kafedraService } from '@/services/kafedraService';
import { roleService } from '@/services/roleService';
import { permissionService } from '@/services/permissionService';

// Faculties
export const useFaculties = (page = 1, limit = 100) => {
    return useQuery({
        queryKey: ['faculties', page, limit],
        queryFn: () => facultyService.getFaculties(page, limit),
    });
};

export const useCreateFaculty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) => facultyService.createFaculty(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faculties'] });
        },
    });
};

// Kafedras
export const useKafedras = (page = 1, limit = 100) => {
    return useQuery({
        queryKey: ['kafedras', page, limit],
        queryFn: () => kafedraService.getKafedras(page, limit),
    });
};

export const useCreateKafedra = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; faculty_id: number }) => kafedraService.createKafedra(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kafedras'] });
        },
    });
};

// Roles
export const useRoles = (page = 1, limit = 100) => {
    return useQuery({
        queryKey: ['roles', page, limit],
        queryFn: () => roleService.getRoles(page, limit),
    });
};

// Permissions
export const usePermissions = (page = 1, limit = 100) => {
    return useQuery({
        queryKey: ['permissions', page, limit],
        queryFn: () => permissionService.getPermissions(page, limit),
    });
};
