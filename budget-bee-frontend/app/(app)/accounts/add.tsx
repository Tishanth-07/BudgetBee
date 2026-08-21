import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../lib/api/client';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useRouter } from 'expo-router';

export default function AddAccount() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [accountType, setAccountType] = useState<'BANK' | 'CASH' | 'CARD'>('BANK');

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            name: '',
            balance: '',
            cardNetwork: '',
        }
    });

    const createAccount = useMutation({
        mutationFn: async (data: any) => {
            return await apiRequest('post', '/accounts', {
                name: data.name,
                type: accountType,
                balance: Math.round(parseFloat(data.balance || '0') * 100),
                cardNetwork: accountType !== 'CASH' ? data.cardNetwork : undefined,
                color: '#1A56E8', // default color for now
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            reset();
            router.back();
        },
        onError: () => {
            Alert.alert('Error', 'Failed to create account. Check your inputs.');
        }
    });

    const onSubmit = (data: any) => {
        if (!data.name) return Alert.alert('Required', 'Please enter an account name');
        if (data.balance && isNaN(parseFloat(data.balance))) return Alert.alert('Required', 'Please enter a valid initial balance');
        createAccount.mutate(data);
    };

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="px-6 py-4 flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="flex-row justify-between items-center mb-6">
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white items-center justify-center rounded-full shadow-sm">
                            <Ionicons name="close" size={24} color="#1A2B5E" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-navy">New Account</Text>
                        <View className="w-10" />
                    </View>

                    {/* Type Switcher */}
                    <View className="flex-row bg-gray-200/60 p-1 rounded-full mb-6">
                        {(['BANK', 'CASH', 'CARD'] as const).map((type) => (
                            <TouchableOpacity
                                key={type}
                                className={clsx("flex-1 py-3 rounded-full items-center", accountType === type && "bg-white")}
                                onPress={() => setAccountType(type)}
                            >
                                <Text className={clsx("font-bold text-sm", accountType === type ? "text-primary" : "text-textsecondary")}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Initial Balance Input */}
                    <View className="items-center mb-6">
                        <Text className="text-textsecondary font-medium text-sm mb-2">Initial Balance (LKR)</Text>
                        <Controller
                            control={control}
                            name="balance"
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row items-center border-b-2 border-primary/20 pb-2 min-w-[150px] justify-center">
                                    <Text className="text-3xl font-bold text-navy mr-1">Rs.</Text>
                                    <TextInput
                                        className="text-4xl font-bold text-navy"
                                        placeholder="0.00"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        value={value}
                                        onChangeText={onChange}
                                        autoFocus
                                    />
                                </View>
                            )}
                        />
                    </View>

                    {/* Details */}
                    <Text className="text-textprimary font-bold text-base mb-3">Account Details</Text>
                    <View className="bg-white rounded-card shadow-sm mb-6">
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
                                    <View className="w-8">
                                        <Ionicons name="wallet-outline" size={20} color="#9CA3AF" />
                                    </View>
                                    <TextInput
                                        className="flex-1 text-base ml-2 text-textprimary"
                                        placeholder="Account Name (e.g. Main Wallet)"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                </View>
                            )}
                        />
                        {accountType !== 'CASH' && (
                            <Controller
                                control={control}
                                name="cardNetwork"
                                render={({ field: { onChange, value } }) => (
                                    <View className="flex-row items-center px-4 py-3">
                                        <View className="w-8">
                                            <Ionicons name="business-outline" size={20} color="#9CA3AF" />
                                        </View>
                                        <TextInput
                                            className="flex-1 text-base ml-2 text-textprimary"
                                            placeholder="Bank / Network (e.g. BOC, Visa)"
                                            placeholderTextColor="#9CA3AF"
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                    </View>
                                )}
                            />
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        className="h-14 bg-blue-600 rounded-2xl shadow-md flex-row justify-center items-center active:bg-blue-700 mt-4 mb-8"
                        onPress={handleSubmit(onSubmit)}
                        disabled={createAccount.isPending}
                    >
                        <Text className="font-bold text-white text-lg">
                            {createAccount.isPending ? 'Creating...' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
