
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-blue-50 items-center justify-center p-6">
            <View className="items-center mb-12">
                <Text className="text-4xl font-extrabold text-blue-500 font-serif">Welcome</Text>
            </View>

            <View className="bg-white rounded-full p-8 shadow-sm mb-8">
                {/* Placeholder for Bee Logo - replace with actual asset */}
                <View className="w-32 h-32 bg-blue-100 rounded-full items-center justify-center">
                    <Text className="text-4xl">🐝</Text>
                </View>
            </View>

            <Text className="text-3xl font-bold text-blue-900 mb-2">BudgetBee</Text>

            <View className="items-center mt-8">
                <Text className="text-blue-400 text-lg font-medium">Small savings</Text>
                <Text className="text-blue-400 text-lg font-medium">Big goals</Text>
                <Text className="text-blue-400 text-lg font-medium">Bright future</Text>
            </View>

            {/* Invisible touch area to advance (simulation) or button */}
            <TouchableOpacity
                className="absolute bottom-12 right-6"
                onPress={() => router.push('/(auth)/onboarding')}
            >
                <Text className="text-blue-500 font-bold text-xl">→</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
