import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../../lib/api/client';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ResetPassword() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const { control, handleSubmit, formState: { errors }, watch } = useForm();
    const newPassword = watch("newPassword");
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: any) => {
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { email, code: data.code, newPassword: data.newPassword });
            if (res.data.success) {
                // Return to login with a success message (could pass via params, but for now just replacing)
                router.replace('/(auth)/login');
            } else {
                setError(res.data.message || 'Reset failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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
                    <Text className="text-3xl font-extrabold text-blue-900 tracking-tight text-center">Set New Password</Text>
                    <Text className="text-gray-500 text-base mt-2 text-center">
                        Enter the 6-digit code sent to {email} and your new password.
                    </Text>
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

                    <Controller
                        control={control}
                        name="newPassword"
                        rules={{ 
                            required: 'New Password is required',
                            pattern: {
                                value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/,
                                message: 'Password must be 8+ chars with uppercase, number, and symbol'
                            }
                        }}
                        render={({ field: { onChange, value } }) => (
                            <View>
                                <View className={`flex-row items-center bg-gray-50 border ${errors.newPassword ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white`}>
                                    <Lock size={20} color={errors.newPassword ? "#ef4444" : "#9ca3af"} />
                                    <TextInput
                                        className="flex-1 h-full ml-3 text-base text-gray-900"
                                        placeholder="New Password"
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
                                {errors.newPassword && (
                                    <Text className="text-red-500 text-sm mt-1 ml-1">{errors.newPassword.message as string}</Text>
                                )}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirmPassword"
                        rules={{ 
                            required: 'Please confirm your password',
                            validate: (value) => value === newPassword || 'Passwords do not match'
                        }}
                        render={({ field: { onChange, value } }) => (
                            <View>
                                <View className={`flex-row items-center bg-gray-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white`}>
                                    <Lock size={20} color={errors.confirmPassword ? "#ef4444" : "#9ca3af"} />
                                    <TextInput
                                        className="flex-1 h-full ml-3 text-base text-gray-900"
                                        placeholder="Confirm New Password"
                                        placeholderTextColor="#9ca3af"
                                        value={value}
                                        onChangeText={onChange}
                                        secureTextEntry={!showPassword}
                                    />
                                </View>
                                {errors.confirmPassword && (
                                    <Text className="text-red-500 text-sm mt-1 ml-1">{errors.confirmPassword.message as string}</Text>
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
                        <Text className="font-bold text-white text-lg">Reset Password</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-8">
                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                        <Text className="text-gray-500 font-medium text-base">Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
