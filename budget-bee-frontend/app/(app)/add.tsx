
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Add() {
    return (
        <SafeAreaView className="flex-1 bg-blue-50 items-center justify-center">
            <Text className="text-2xl font-bold text-blue-900">Add Transaction</Text>
            <Text className="text-blue-500 mt-2">Form to add income/expense</Text>
        </SafeAreaView>
    );
}
