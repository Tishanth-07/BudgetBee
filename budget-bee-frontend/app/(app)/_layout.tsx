import { Tabs, useRouter } from 'expo-router';
import { View } from 'react-native';
import { LayoutGrid, PiggyBank, Plus, GraduationCap, MoreHorizontal } from 'lucide-react-native';

export default function AppLayout() {
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#3B82F6', // Blue-500
                tabBarInactiveTintColor: '#9CA3AF',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="budget"
                options={{
                    title: 'Budget',
                    tabBarIcon: ({ color, size }) => <PiggyBank color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: '',
                    tabBarIcon: ({ size }) => (
                        <View className="bg-blue-500 p-3 rounded-full -mt-8 shadow-lg w-14 h-14 items-center justify-center">
                            <Plus color="white" size={size + 4} />
                        </View>
                    ),
                    tabBarLabelStyle: { display: 'none' },
                }}
                listeners={() => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        router.push('/(app)/add');
                    },
                })}
            />
            <Tabs.Screen
                name="advices"
                options={{
                    title: 'Advices',
                    tabBarIcon: ({ color, size }) => <GraduationCap color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
