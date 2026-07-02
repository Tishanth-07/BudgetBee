import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PiggyBank, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-blue-50" edges={['top', 'bottom']}>
            <LinearGradient
                colors={['#eff6ff', '#bfdbfe', '#93c5fd']} // Blue-50 -> Blue-200 -> Blue-300
                className="flex-1 items-center justify-between px-6 pt-16 pb-12"
            >
                {/* Top Section */}
                <View className="items-center w-full mt-10">
                    <View className="bg-white p-6 rounded-[40px] shadow-sm mb-8 items-center justify-center">
                        <PiggyBank size={80} color="#2563eb" strokeWidth={1.5} />
                    </View>
                    <Text className="text-5xl font-extrabold text-blue-900 tracking-tighter mb-2">BudgetBee</Text>
                    <Text className="text-blue-700 text-lg font-medium mt-4 text-center px-4 leading-relaxed">
                        Take control of your finances and build a brighter future today.
                    </Text>
                </View>

                {/* Bottom Section */}
                <View className="w-full gap-y-4">
                    <TouchableOpacity
                        className="w-full bg-blue-600 py-4 rounded-2xl shadow-md flex-row justify-center items-center active:bg-blue-700"
                        onPress={() => router.push('/(auth)/onboarding')}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-xl mr-2">Get Started</Text>
                        <ArrowRight size={24} color="#ffffff" strokeWidth={2.5} />
                    </TouchableOpacity>
                    
                    <Text className="text-blue-800/60 text-sm font-semibold text-center mt-2 uppercase tracking-widest">
                        Secure • Simple • Smart
                    </Text>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}
