import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api/client';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyRound, AlertCircle } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function VerifyEmail() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const { control, handleSubmit, formState: { errors } } = useForm();
    const login = useAuthStore((state) => state.login);
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendMessage, setResendMessage] = useState('');
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startCooldown = () => {
        setResendCooldown(120);
        timerRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResendCode = async () => {
        setError('');
        setResendMessage('');
        try {
            const res = await api.post('/auth/resend-code', { email });
            if (res.data.success) {
                setResendMessage('A new code has been sent to your email.');
                startCooldown();
            } else {
                setError(res.data.message || 'Failed to resend code.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
        }
    };

    const onSubmit = async (data: any) => {
        setError('');
        setResendMessage('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/verify-email', { email, code: data.code });
            if (res.data.success) {
                await login(res.data.data.accessToken, res.data.data.refreshToken, res.data.data.user);
                router.replace('/(app)');
            } else {
                setError(res.data.message || 'Verification failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed. Please check your connection.');
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
            >
                <View className="mb-10 mt-10 items-center">
                    <Text className="text-3xl font-extrabold text-blue-900 tracking-tight text-center">Verify Email</Text>
                    <Text className="text-gray-500 text-base mt-2 text-center">
                        We sent a 6-digit code to {email}. Enter it below to verify your account.
                    </Text>
                </View>

                {error ? (
                    <View className="bg-red-50 p-4 rounded-xl mb-6 flex-row items-center border border-red-100">
                        <AlertCircle size={20} color="#ef4444" />
                        <Text className="text-red-600 ml-2 font-medium flex-1">{error}</Text>
                    </View>
                ) : null}

                {resendMessage ? (
                    <View className="bg-green-50 p-4 rounded-xl mb-6 flex-row items-center border border-green-100">
                        <Text className="text-green-600 ml-2 font-medium flex-1">{resendMessage}</Text>
                    </View>
                ) : null}

                <View className="gap-y-4 mb-8">
                    <Controller
                        control={control}
                        name="code"
                        rules={{ 
                            required: 'Verification code is required', 
                            pattern: { value: /^[0-9]{6}$/, message: 'Code must be 6 digits' } 
                        }}
                        render={({ field: { onChange, value } }) => (
                            <View>
                                <View className={`flex-row items-center bg-gray-50 border ${errors.code ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white`}>
                                    <KeyRound size={20} color={errors.code ? "#ef4444" : "#9ca3af"} />
                                    <TextInput
                                        className="flex-1 h-full ml-3 text-2xl tracking-[0.5em] text-center text-gray-900"
                                        placeholder="••••••"
                                        placeholderTextColor="#d1d5db"
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                </View>
                                {errors.code && (
                                    <Text className="text-red-500 text-sm mt-1 ml-1">{errors.code.message as string}</Text>
                                )}
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
                        <Text className="font-bold text-white text-lg">Verify & Login</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-col items-center mt-6">
                    <View className="flex-row justify-center">
                        <Text className="text-gray-500 text-base">Didn't receive the code? </Text>
                        <TouchableOpacity onPress={handleResendCode} disabled={resendCooldown > 0}>
                            <Text className={`font-bold text-base ${resendCooldown > 0 ? 'text-gray-400' : 'text-blue-600'}`}>
                                Resend Code
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {resendCooldown > 0 && (
                        <Text className="text-gray-400 text-sm mt-2">
                            Please wait {resendCooldown} seconds before resending.
                        </Text>
                    )}
                </View>

                <View className="flex-row justify-center mt-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text className="text-gray-500 font-medium text-base">Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
