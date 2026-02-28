<<<<<<< HEAD
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client';
import { useState } from 'react';
import { X } from 'lucide-react-native';
import clsx from 'clsx';
import { useRouter } from 'expo-router';

export default function AddTransaction() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            amount: '',
            note: '',
            categoryId: '',
            date: new Date().toISOString(),
        }
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        }
    });

    const createTransaction = useMutation({
        mutationFn: async (data: any) => {
            return api.post('/transactions', {
                ...data,
                amount: parseFloat(data.amount),
                type: transactionType,
                date: new Date(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            reset();
            router.replace('/(app)'); // Go back to dashboard
        },
        onError: (err) => {
            Alert.alert('Error', 'Failed to create transaction');
        }
    });

    const createCategory = useMutation({
        mutationFn: async (data: { name: string, emoji: string }) => {
            return api.post('/categories', { ...data, type: transactionType });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setShowCategoryModal(false);
        }
    });

    const onSubmit = (data: any) => {
        if (!data.categoryId) {
            Alert.alert('Required', 'Please select a category');
            return;
        }
        createTransaction.mutate(data);
    };

    // Category Creation Form State
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryEmoji, setNewCategoryEmoji] = useState('🍔'); // Default emoji

    const handleCreateCategory = () => {
        if (!newCategoryName) return;
        createCategory.mutate({ name: newCategoryName, emoji: newCategoryEmoji });
        setNewCategoryName('');
    };

    const filteredCategories = categories?.filter((c: any) => c.type === transactionType);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="p-6">
                <Text className="text-2xl font-bold text-center mb-6">Add Transaction</Text>

                {/* Type Switcher */}
                <View className="flex-row bg-gray-100 p-1 rounded-xl mb-6">
                    <TouchableOpacity
                        className={clsx("flex-1 p-3 rounded-lg items-center", transactionType === 'income' ? "bg-white shadow-sm" : "")}
                        onPress={() => setTransactionType('income')}
                    >
                        <Text className={clsx("font-bold", transactionType === 'income' ? "text-green-600" : "text-gray-500")}>Income</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={clsx("flex-1 p-3 rounded-lg items-center", transactionType === 'expense' ? "bg-white shadow-sm" : "")}
                        onPress={() => setTransactionType('expense')}
                    >
                        <Text className={clsx("font-bold", transactionType === 'expense' ? "text-red-500" : "text-gray-500")}>Expense</Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <Text className="text-gray-500 font-medium mb-2">Amount</Text>
                <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, value } }) => (
                        <View className="flex-row items-center border border-gray-200 rounded-xl p-4 mb-6">
                            <Text className="text-2xl font-bold text-gray-400 mr-2">$</Text>
                            <TextInput
                                className="text-3xl font-bold flex-1 text-gray-900"
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={value}
                                onChangeText={onChange}
                            />
                        </View>
                    )}
                />

                {/* Category Selection */}
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-500 font-medium">Category</Text>
                    <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
                        <Text className="text-blue-500 font-bold">+ New Category</Text>
                    </TouchableOpacity>
                </View>

                <Controller
                    control={control}
                    name="categoryId"
                    render={({ field: { onChange, value } }) => (
                        <View className="flex-row flex-wrap gap-3 mb-6">
                            {filteredCategories?.map((cat: any) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    className={clsx(
                                        "p-3 rounded-xl border flex-row items-center gap-2",
                                        value === cat.id ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-transparent"
                                    )}
                                    onPress={() => onChange(cat.id)}
                                >
                                    <Text>{cat.emoji || '📁'}</Text>
                                    <Text className={clsx("font-medium", value === cat.id ? "text-blue-700" : "text-gray-700")}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                />

                {/* Note Input */}
                <Text className="text-gray-500 font-medium mb-2">Note (Optional)</Text>
                <Controller
                    control={control}
                    name="note"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            className="border border-gray-200 rounded-xl p-4 mb-8 text-lg"
                            placeholder="What is this for?"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />

                {/* Submit Button */}
                <TouchableOpacity
                    className="bg-blue-500 p-4 rounded-xl items-center shadow-lg shadow-blue-200"
                    onPress={handleSubmit(onSubmit)}
                >
                    <Text className="text-white font-bold text-xl">Save Transaction</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Create Category Modal */}
            <Modal visible={showCategoryModal} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold">New Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <X color="gray" size={24} />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 mb-2">Emoji</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl text-3xl mb-4 text-center"
                            value={newCategoryEmoji}
                            onChangeText={setNewCategoryEmoji}
                            maxLength={2}
                        />

                        <Text className="text-gray-500 mb-2">Name</Text>
                        <TextInput
                            className="bg-gray-100 p-4 rounded-xl text-lg mb-6"
                            placeholder="Category Name"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                        />

                        <TouchableOpacity
                            className="bg-blue-500 p-4 rounded-xl items-center"
                            onPress={handleCreateCategory}
                        >
                            <Text className="text-white font-bold text-lg">Create Category</Text>
                        </TouchableOpacity>
                        <View className="h-8" />
                    </View>
                </View>
            </Modal>
=======

import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Add() {
    return (
        <SafeAreaView className="flex-1 bg-blue-50 items-center justify-center">
            <Text className="text-2xl font-bold text-blue-900">Add Transaction</Text>
            <Text className="text-blue-500 mt-2">Form to add income/expense</Text>
>>>>>>> feature/frontend/tab-navigation-shell
        </SafeAreaView>
    );
}
