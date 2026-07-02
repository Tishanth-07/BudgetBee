import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api/client';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, AlertCircle } from 'lucide-react-native';

export default function Register() {
    const { control, handleSubmit } = useForm();
    const login = useAuthStore((state) => state.login);
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/register', data);
            if (res.data.success) {
                await login(res.data.data.accessToken, res.data.data.refreshToken, res.data.data.user);
                router.replace('/(app)');
            } else {
                setError(res.data.message || 'Registration failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
                    <View className="mb-10 items-center">
                        <Text className="text-4xl font-extrabold text-blue-900 tracking-tight">Create Account</Text>
                        <Text className="text-gray-500 text-base mt-2">Start your financial journey today</Text>
                    </View>

                    {error ? (
                        <View className="bg-red-50 p-4 rounded-xl mb-6 flex-row items-center border border-red-100">
                            <AlertCircle size={20} color="#ef4444" />
                            <Text className="text-red-600 ml-2 font-medium flex-1">{error}</Text>
                        </View>
                    ) : null}

                    <View className="gap-y-4 mb-8">
                        <Controller
                            control={control}
                            name="firstName"
                            rules={{ required: true }}
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white">
                                    <User size={20} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 h-full ml-3 text-base text-gray-900"
                                        placeholder="First Name"
                                        placeholderTextColor="#9ca3af"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                </View>
                            )}
                        />

                        <Controller
                            control={control}
                            name="lastName"
                            rules={{ required: true }}
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white">
                                    <User size={20} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 h-full ml-3 text-base text-gray-900"
                                        placeholder="Last Name"
                                        placeholderTextColor="#9ca3af"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                </View>
                            )}
                        />

                        <Controller
                            control={control}
                            name="email"
                            rules={{ required: true }}
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white">
                                    <Mail size={20} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 h-full ml-3 text-base text-gray-900"
                                        placeholder="Email Address"
                                        placeholderTextColor="#9ca3af"
                                        value={value}
                                        onChangeText={onChange}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            )}
                        />

                        <Controller
                            control={control}
                            name="password"
                            rules={{ required: true }}
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white">
                                    <Lock size={20} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 h-full ml-3 text-base text-gray-900"
                                        placeholder="Password"
                                        placeholderTextColor="#9ca3af"
                                        value={value}
                                        onChangeText={onChange}
                                        secureTextEntry
                                    />
                                </View>
                            )}
                        />
                    </View>

                    <TouchableOpacity
                        className={`h-14 rounded-2xl shadow-md flex-row justify-center items-center ${isLoading ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'}`}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <Text className="font-bold text-white text-lg">Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-gray-500 text-base">Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-blue-600 font-bold text-base">Login</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
