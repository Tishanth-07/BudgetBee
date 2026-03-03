import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api/client';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useRouter } from 'expo-router';

const ICON_MAP: Record<string, string> = {
    fork: "restaurant-outline",
    car: "car-outline",
    house: "home-outline",
    stethoscope: "medkit-outline",
    "gift-box": "gift-outline",
    diamond: "diamond-outline",
    heart: "heart-outline",
    pants: "bag-outline",
    paw: "paw-outline",
    dots: "pricetag-outline",
};

export default function AddTransaction() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            amount: '',
            note: '',
            categoryId: '',
            accountId: '',
            merchant: '',
        }
    });

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            return await apiRequest<any[]>('get', '/accounts');
        },
        initialData: []
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            return await apiRequest<any[]>('get', '/categories');
        },
        initialData: []
    });

    const createTransaction = useMutation({
        mutationFn: async (data: any) => {
            return await apiRequest('post', '/transactions', {
                ...data,
                amount: parseFloat(data.amount),
                type: transactionType,
                date: new Date().toISOString(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            reset();
            router.replace('/(app)');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to create transaction. Check your inputs.');
        }
    });

    const onSubmit = (data: any) => {
        if (!data.categoryId) return Alert.alert('Required', 'Please select a category');
        if (!data.accountId) return Alert.alert('Required', 'Please select an account');
        if (!data.amount || isNaN(parseFloat(data.amount))) return Alert.alert('Required', 'Please enter a valid amount');
        createTransaction.mutate(data);
    };

    const filteredCategories = (categories || []).filter((c: any) => c.type === transactionType);

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="px-6 py-4 flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="flex-row justify-between items-center mb-6">
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white items-center justify-center rounded-full shadow-sm">
                            <Ionicons name="close" size={24} color="#1A2B5E" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-navy">New Transaction</Text>
                        <View className="w-10" />
                    </View>

                    {/* Type Switcher */}
                    <View className="flex-row bg-gray-200/60 p-1 rounded-full mb-6">
                        <TouchableOpacity
                            className={clsx("flex-1 py-3 rounded-full items-center", transactionType === 'EXPENSE' && "bg-white shadow-sm")}
                            onPress={() => setTransactionType('EXPENSE')}
                        >
                            <Text className={clsx("font-bold text-sm", transactionType === 'EXPENSE' ? "text-danger" : "text-textsecondary")}>Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={clsx("flex-1 py-3 rounded-full items-center", transactionType === 'INCOME' && "bg-white shadow-sm")}
                            onPress={() => setTransactionType('INCOME')}
                        >
                            <Text className={clsx("font-bold text-sm", transactionType === 'INCOME' ? "text-success" : "text-textsecondary")}>Income</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Amount Input */}
                    <View className="items-center mb-6">
                        <Text className="text-textsecondary font-medium text-sm mb-2">Amount (LKR)</Text>
                        <Controller
                            control={control}
                            name="amount"
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

                    {/* Account Selection */}
                    <Text className="text-textprimary font-bold text-base mb-3">Account</Text>
                    <Controller
                        control={control}
                        name="accountId"
                        render={({ field: { onChange, value } }) => (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row gap-3">
                                {accounts?.map((acc: any) => (
                                    <TouchableOpacity
                                        key={acc.id}
                                        className={clsx(
                                            "px-4 py-3 rounded-card border-2 mr-3 min-w-[100px] flex-row items-center gap-2",
                                            value === acc.id ? "bg-primary/10 border-primary" : "bg-white border-transparent"
                                        )}
                                        onPress={() => onChange(acc.id)}
                                    >
                                        <Ionicons name={acc.type === 'CASH' ? 'cash-outline' : 'card-outline'} size={20} color={value === acc.id ? '#1A56E8' : '#6B7280'} />
                                        <Text className={clsx("font-semibold text-sm", value === acc.id ? "text-primary" : "text-textprimary")}>{acc.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    />

                    {/* Merchant & Note */}
                    <Text className="text-textprimary font-bold text-base mb-3">Details</Text>
                    <View className="bg-white rounded-card shadow-sm mb-6">
                        <Controller
                            control={control}
                            name="merchant"
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
                                    <View className="w-8">
                                        <Ionicons name="storefront-outline" size={20} color="#9CA3AF" />
                                    </View>
                                    <TextInput
                                        className="flex-1 text-base ml-2 text-textprimary"
                                        placeholder="Merchant or Title"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                </View>
                            )}
                        />
                        <Controller
                            control={control}
                            name="note"
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row items-center px-4 py-3">
                                    <View className="w-8">
                                        <Ionicons name="document-text-outline" size={20} color="#9CA3AF" />
                                    </View>
                                    <TextInput
                                        className="flex-1 text-base ml-2 text-textprimary"
                                        placeholder="Add a note (optional)"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                </View>
                            )}
                        />
                    </View>

                    {/* Category Selection */}
                    <Text className="text-textprimary font-bold text-base mb-3">Category</Text>
                    <Controller
                        control={control}
                        name="categoryId"
                        render={({ field: { onChange, value } }) => (
                            <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
                                {filteredCategories?.map((cat: any) => {
                                    const iconKey = cat.icon ?? "dots";
                                    const icon = (ICON_MAP[iconKey] ?? "pricetag-outline") as any;
                                    const color = cat.color ?? "#6B7280";
                                    const isSelected = value === cat.id;

                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            className={clsx(
                                                "w-[30%] items-center p-3 border-2 rounded-2xl",
                                                isSelected ? "border-primary bg-primary/5" : "border-transparent bg-white shadow-sm"
                                            )}
                                            onPress={() => onChange(cat.id)}
                                        >
                                            <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: `${color}20` }}>
                                                <Ionicons name={icon} size={24} color={color} />
                                            </View>
                                            <Text className="text-xs text-center font-medium text-textsecondary" numberOfLines={1}>{cat.name}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        )}
                    />

                    {/* Submit Button */}
                    <TouchableOpacity
                        className="bg-primary py-4 rounded-full items-center shadow-lg mb-8"
                        onPress={handleSubmit(onSubmit)}
                        disabled={createTransaction.isPending}
                    >
                        <Text className="text-white font-bold text-lg">
                            {createTransaction.isPending ? 'Saving...' : 'Save Transaction'}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
