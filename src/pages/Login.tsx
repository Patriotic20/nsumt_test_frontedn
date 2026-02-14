import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/services/api';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = React.useState<string | null>(null);

    const from = location.state?.from?.pathname || '/';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setError(null);
            // The backend expects specific fields. Assuming standard structure:
            // login endpoint: /user/login
            // data: { username, password }
            // response: { access_token, refresh_token, type }

            const response = await api.post('/user/login', data);
            await login(response.data.access_token, response.data.refresh_token);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401 || err.response?.status === 400) {
                setError('Invalid username or password');
            } else {
                setError('Something went wrong. Please try again.');
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Welcome back! Please enter your details.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input
                            label="Username"
                            type="text"
                            autoComplete="username"
                            error={errors.username?.message?.toString()}
                            {...register('username')}
                        />

                        <Input
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            error={errors.password?.message?.toString()}
                            {...register('password')}
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isSubmitting}
                        >
                            Sign in
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
