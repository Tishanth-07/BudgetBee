import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, TrendingUp } from 'lucide-react-native';

export default function Onboarding() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-blue-50" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm active:bg-blue-100"
                    activeOpacity={0.8}
                >
                    <ChevronLeft size={28} color="#2563eb" />
                </TouchableOpacity>
                <Text className="text-2xl font-extrabold text-blue-900 tracking-tight">BudgetBee</Text>
                <View className="w-12" />
            </View>

            {/* Main Content */}
            <View className="items-center justify-center flex-1 px-6">
                <View className="w-full aspect-square bg-white rounded-[48px] shadow-sm items-center justify-center mb-10 border border-blue-100/50">
                    <TrendingUp size={140} color="#2563eb" strokeWidth={1.5} />
                </View>

                <Text className="text-4xl font-extrabold text-center text-blue-900 leading-tight">
                    Stay on top of your finances
                </Text>
                <Text className="text-blue-600 text-lg text-center mt-5 px-4 font-medium leading-relaxed">
                    Track your expenses, set savings goals, and watch your wealth grow effortlessly.
                </Text>
            </View>

            {/* Footer */}
            <View className="px-6 pb-12 pt-4">
                <TouchableOpacity
                    className="h-14 bg-blue-600 rounded-2xl shadow-md flex-row justify-center items-center active:bg-blue-700"
                    onPress={() => router.push('/(auth)/login')}
                    activeOpacity={0.8}
                >
                    <Text className="font-bold text-white text-lg">Continue to Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
