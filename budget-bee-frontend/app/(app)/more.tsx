import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function More() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/welcome');
    };

    const menuItems = [
        { icon: 'card-outline', label: 'Accounts', route: '/(app)/accounts', color: '#3B82F6' },
        { icon: 'pricetags-outline', label: 'Categories', route: '/(app)/categories', color: '#10B981' },
        { icon: 'cash-outline', label: 'Regular Income', route: '/(app)/income', color: '#F59E0B' },
        { icon: 'settings-outline', label: 'Settings', route: '/(app)/settings', color: '#6B7280' },
        { icon: 'help-buoy-outline', label: 'Help & Support', route: null, color: '#8B5CF6' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={['top']}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header Profile Section */}
                <LinearGradient colors={['#A8C8F8', '#D6E4FF']} className="px-6 pt-6 pb-8 border-b border-gray-100">
                    <View className="flex-row items-center gap-4">
                        <View className="w-16 h-16 bg-white justify-center items-center rounded-full border-2 border-white shadow-sm overflow-hidden">
                            {user?.avatar ? (
                                <Image source={{ uri: user.avatar }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={32} color="#9CA3AF" />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-navy mb-1">{user?.firstName || user?.name || 'User'}</Text>
                            <Text className="text-textsecondary text-sm">{user?.email || 'user@example.com'}</Text>
                        </View>
                        <TouchableOpacity className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                            <Ionicons name="pencil" size={20} color="#1A2B5E" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Menu Options */}
                <View className="px-4 py-6">
                    <View className="bg-white rounded-card shadow-sm overflow-hidden mb-6">
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => { if (item.route) router.push(item.route as any) }}
                                className={`flex-row items-center px-4 py-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${item.color}15` }}>
                                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                                </View>
                                <Text className="flex-1 text-base text-textprimary font-medium">{item.label}</Text>
                                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center justify-center bg-danger/10 p-4 rounded-full mb-6"
                    >
                        <Ionicons name="log-out-outline" size={22} color="#EF4444" className="mr-2" />
                        <Text className="text-lg text-danger font-bold ml-2">Logout</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-textsecondary text-xs mt-4">BudgetBee v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
