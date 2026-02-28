import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ name, color }: { name: string; color: string }) {
    // Placeholder for Icon implementation (e.g. Ionicons)
    return <Text style={{ color }}>{name}</Text>;
}

export default function AppLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#EAB308' }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <TabIcon name="Home" color={color} />
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Transactions',
                    tabBarIcon: ({ color }) => <TabIcon name="List" color={color} />
                }}
            />
        </Tabs>
    );
}
