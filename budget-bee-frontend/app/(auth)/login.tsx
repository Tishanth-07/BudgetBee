import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api/client';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Login() {
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    });
    const login = useAuthStore((state) => state.login);
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: any) => {
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', data);
            if (res.data.success) {
                await login(res.data.data.accessToken, res.data.data.refreshToken, res.data.data.user);
                router.replace('/(app)');
            } else {
                setError(res.data.message || 'Login failed');
            }
        } catch (err: any) {
            console.error('DEBUG LOGIN ERROR:', {
                message: err.message,
                code: err.code,
                response: err.response?.data,
                url: err.config?.url,
                baseURL: err.config?.baseURL
            });
            setError(err.response?.data?.message || 'Login failed. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <KeyboardAwareScrollView 
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 24 }} 
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-10 mt-10 items-center">
                        <Text className="text-4xl font-extrabold text-blue-900 tracking-tight">Welcome Back</Text>
                        <Text className="text-gray-500 text-base mt-2">Sign in to continue to BudgetBee</Text>
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
                            name="email"
                            rules={{ 
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            }}
                            render={({ field: { onChange, value } }) => (
                                <View>
                                    <View className={`flex-row items-center bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white`}>
                                        <Mail size={20} color={errors.email ? "#ef4444" : "#9ca3af"} />
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
                                    {errors.email && (
                                        <Text className="text-red-500 text-sm mt-1 ml-1">{errors.email.message as string}</Text>
                                    )}
                                </View>
                            )}
                        />

                        <Controller
                            control={control}
                            name="password"
                            rules={{ required: 'Password is required' }}
                            render={({ field: { onChange, value } }) => (
                                <View>
                                    <View className={`flex-row items-center bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white`}>
                                        <Lock size={20} color={errors.password ? "#ef4444" : "#9ca3af"} />
                                        <TextInput
                                            className="flex-1 h-full ml-3 text-base text-gray-900"
                                            placeholder="Password"
                                            placeholderTextColor="#9ca3af"
                                            value={value}
                                            onChangeText={onChange}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity 
                                            onPress={() => setShowPassword(!showPassword)}
                                            className="p-2"
                                            activeOpacity={0.7}
                                        >
                                            {showPassword ? (
                                                <Eye size={20} color="#9ca3af" />
                                            ) : (
                                                <EyeOff size={20} color="#9ca3af" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                    {errors.password && (
                                        <Text className="text-red-500 text-sm mt-1 ml-1">{errors.password.message as string}</Text>
                                    )}
                                </View>
                            )}
                        />
                        <View className="flex-row justify-end mt-1">
                            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                                <Text className="text-blue-600 font-medium text-sm">Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>
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
                            <Text className="font-bold text-white text-lg">Login</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-gray-500 text-base">Don't have an account? </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity>
                                <Text className="text-blue-600 font-bold text-base">Register</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
