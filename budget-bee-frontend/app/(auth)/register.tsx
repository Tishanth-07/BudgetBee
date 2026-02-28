import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api/client';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';

export default function Register() {
    const { control, handleSubmit } = useForm();
    const login = useAuthStore((state) => state.login);
    const router = useRouter();
    const [error, setError] = useState('');

    const onSubmit = async (data: any) => {
        try {
            const res = await api.post('/auth/register', data);
            await login(res.data.token, res.data.user);
            router.replace('/(app)');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <View className="flex-1 justify-center p-6 bg-white">
<<<<<<< HEAD
<<<<<<< HEAD
            <Text className="text-3xl font-bold mb-6 text-center text-blue-500">Join Budget Bee</Text>

            {error ? <Text className="text-red-500 mb-4 text-center">{error}</Text> : null}

            <View className="flex-row justify-between mb-4">
                <View className="flex-1 mr-2">
                    <Controller
                        control={control}
                        name="firstName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3"
                                placeholder="First Name"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>
                <View className="flex-1 ml-2">
                    <Controller
                        control={control}
                        name="lastName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3"
                                placeholder="Last Name"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>
            </View>
=======
            <Text className="text-3xl font-bold mb-6 text-center text-yellow-500">Join Budget Bee</Text>
=======
            <Text className="text-3xl font-bold mb-6 text-center text-blue-500">Join Budget Bee</Text>
>>>>>>> feature/frontend/tab-navigation-shell

            {error ? <Text className="text-red-500 mb-4 text-center">{error}</Text> : null}

            <View className="flex-row justify-between mb-4">
                <View className="flex-1 mr-2">
                    <Controller
                        control={control}
                        name="firstName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3"
                                placeholder="First Name"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
<<<<<<< HEAD
                )}
            />
>>>>>>> feature/backend/categories-api
=======
                </View>
                <View className="flex-1 ml-2">
                    <Controller
                        control={control}
                        name="lastName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3"
                                placeholder="Last Name"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>
            </View>
>>>>>>> feature/frontend/tab-navigation-shell

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
<<<<<<< HEAD
                className="bg-blue-500 p-4 rounded-lg items-center"
=======
                className="bg-yellow-500 p-4 rounded-lg items-center"
>>>>>>> feature/backend/categories-api
=======
                className="bg-blue-500 p-4 rounded-lg items-center"
>>>>>>> feature/frontend/tab-navigation-shell
                onPress={handleSubmit(onSubmit)}
            >
                <Text className="font-bold text-white">Register</Text>
            </TouchableOpacity>

            <Link href="/(auth)/login" asChild>
                <TouchableOpacity className="mt-4">
                    <Text className="text-center text-gray-500">Already have an account? Login</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}
