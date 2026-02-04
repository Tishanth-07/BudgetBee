
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { CreditCard, LogOut, Settings as SettingsIcon, HelpCircle, Briefcase, DollarSign } from 'lucide-react-native';

export default function More() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/welcome');
    };

    const menuItems = [
        { icon: CreditCard, label: 'Accounts', color: 'text-gray-700' },
        { icon: Briefcase, label: 'Boarding', color: 'text-gray-700' }, // "Boarding" from screenshot? Maybe "Onboarding" or specific feature? Keeping as screenshot.
        { icon: DollarSign, label: 'Income', color: 'text-gray-700' },
        { icon: HelpCircle, label: 'Help', color: 'text-gray-700' },
        { icon: SettingsIcon, label: 'Settings', color: 'text-gray-700' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header Profile Section */}
            <View className="bg-blue-200 p-6 pb-8 rounded-b-3xl">
                <View className="flex-row items-center gap-4">
                    <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center border-2 border-white">
                        <Text className="text-2xl">👤</Text>
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</Text>
                        <Text className="text-gray-600">{user?.email}</Text>
                    </View>
                    <View className="flex-1 items-end">
                        <Text className="text-gray-500">{'>'}</Text>
                    </View>
                </View>
            </View>

            {/* Menu Options */}
            <View className="p-6 gap-6">
                {menuItems.map((item, index) => (
                    <TouchableOpacity key={index} className="flex-row items-center gap-4">
                        <item.icon size={24} color="#4B5563" />
                        <Text className="text-lg text-gray-700 font-medium">{item.label}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity onPress={handleLogout} className="flex-row items-center gap-4 mt-8">
                    <LogOut size={24} color="#EF4444" />
                    <Text className="text-lg text-red-500 font-medium">Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
