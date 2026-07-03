import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../../lib/api/client';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, AlertCircle } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ForgotPassword() {
    const { control, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: data.email });
            // Always redirect to reset-password to prevent email enumeration,
            // but in a real app you might want to show a success toast.
            router.push({ pathname: '/(auth)/reset-password', params: { email: data.email } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to request reset. Please try again.');
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
                    <Text className="text-3xl font-extrabold text-blue-900 tracking-tight text-center">Forgot Password</Text>
                    <Text className="text-gray-500 text-base mt-2 text-center">
                        Enter your email address and we'll send you a 6-digit code to reset your password.
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
                        <Text className="font-bold text-white text-lg">Send Reset Code</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-8">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text className="text-gray-500 font-medium text-base">Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
