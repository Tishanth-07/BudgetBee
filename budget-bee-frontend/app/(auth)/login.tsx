import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api/client';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';

export default function Login() {
    const { control, handleSubmit } = useForm();
    const login = useAuthStore((state) => state.login);
    const router = useRouter();
    const [error, setError] = useState('');

    const onSubmit = async (data: any) => {
        try {
            const res = await api.post('/auth/login', data);
            await login(res.data.token, res.data.user);
            router.replace('/(app)');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <View className="flex-1 justify-center p-6 bg-white">
<<<<<<< HEAD
            <Text className="text-3xl font-bold mb-6 text-center text-blue-500">Budget Bee</Text>
=======
            <Text className="text-3xl font-bold mb-6 text-center text-yellow-500">Budget Bee</Text>
>>>>>>> feature/backend/categories-api

            {error ? <Text className="text-red-500 mb-4 text-center">{error}</Text> : null}

            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-4"
                        placeholder="Email"
                        value={value}
                        onChangeText={onChange}
                        autoCapitalize="none"
                    />
                )}
            />

            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-6"
                        placeholder="Password"
                        value={value}
                        onChangeText={onChange}
                        secureTextEntry
                    />
                )}
            />

            <TouchableOpacity
<<<<<<< HEAD
                className="bg-blue-500 p-4 rounded-lg items-center"
=======
                className="bg-yellow-500 p-4 rounded-lg items-center"
>>>>>>> feature/backend/categories-api
                onPress={handleSubmit(onSubmit)}
            >
                <Text className="font-bold text-white">Login</Text>
            </TouchableOpacity>

            <Link href="/(auth)/register" asChild>
                <TouchableOpacity className="mt-4">
                    <Text className="text-center text-gray-500">Don't have an account? Register</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}
