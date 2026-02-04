
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Onboarding() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-blue-50 p-6 justify-between">
            <View className="flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-blue-500 text-2xl">{'<'}</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-blue-500">BudgetBee</Text>
                <View className="w-6" />
            </View>

            <View className="items-center justify-center flex-1">
                {/* Paper Plane Graphic Placeholder */}
                <View className="w-64 h-48 bg-blue-200 rounded-xl mb-8 items-center justify-center">
                    <Text className="text-6xl">✈️</Text>
                </View>

                <Text className="text-2xl font-bold text-center text-blue-900 px-4">
                    Stay on top of your finances and achieve your financial goals
                </Text>
            </View>

            <View className="flex-row justify-end pb-8">
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text className="text-blue-500 font-bold text-2xl">→</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
