import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LayoutGrid, PiggyBank, GraduationCap, MoreHorizontal } from 'lucide-react-native';

// ─── Custom Center Add Button ─────────────────────────────────────────────────
function AddButton({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.addButtonContainer}
            activeOpacity={0.85}
        >
            <View style={styles.addButton}>
                <View style={styles.plusHorizontal} />
                <View style={styles.plusVertical} />
            </View>
        </TouchableOpacity>
    );
}

// ─── Tab Icon Component ───────────────────────────────────────────────────────
function TabIcon({
    IconComponent,
    focused,
}: {
    IconComponent: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
    focused: boolean;
}) {
    return (
        <IconComponent
            size={22}
            color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
            strokeWidth={focused ? 2.5 : 1.8}
        />
    );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function AppLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
                tabBarLabelStyle: styles.tabLabel,
                tabBarShowLabel: true,
            }}
        >
            {/* ── Tab 1: Dashboard ── */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon IconComponent={LayoutGrid} focused={focused} />
                    ),
                }}
            />

            {/* ── Tab 2: Budget ── */}
            <Tabs.Screen
                name="budget"
                options={{
                    title: 'Budget',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon IconComponent={PiggyBank} focused={focused} />
                    ),
                }}
            />

            {/* ── Tab 3: Add Transaction (center elevated button) ── */}
            <Tabs.Screen
                name="add"
                options={{
                    title: '',
                    tabBarIcon: () => null,
                    tabBarLabel: () => null,
                    tabBarButton: (props) => (
                        <AddButton onPress={() => (props.onPress as (() => void) | undefined)?.()} />
                    ),
                }}
            />

            {/* ── Tab 4: Advices ── */}
            <Tabs.Screen
                name="advices"
                options={{
                    title: 'Advices',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon IconComponent={GraduationCap} focused={focused} />
                    ),
                }}
            />

            {/* ── Tab 5: More ── */}
            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon IconComponent={MoreHorizontal} focused={focused} />
                    ),
                }}
            />

            {/* ── HIDE ALL NON-TAB ROUTES ── */}
            {/* These prevent ghost □ tabs from appearing in the tab bar */}
            <Tabs.Screen name="income" options={{ href: null }} />
            <Tabs.Screen name="settings" options={{ href: null }} />
            <Tabs.Screen name="transactions" options={{ href: null }} />
            {/* Subdirectory index routes */}
            <Tabs.Screen name="accounts/index" options={{ href: null }} />
            {/* Nested dynamic/named routes inside transactions/ and accounts/ */}
            <Tabs.Screen name="transactions/[id]" options={{ href: null }} />
            <Tabs.Screen name="transactions/cash" options={{ href: null }} />
            <Tabs.Screen name="accounts/[id]" options={{ href: null }} />
        </Tabs>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#1A2B5E',
        borderTopWidth: 0,
        height: Platform.OS === 'ios' ? 85 : 65,
        paddingBottom: Platform.OS === 'ios' ? 25 : 8,
        paddingTop: 8,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 2,
    },
    addButtonContainer: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
    },
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1A56E8',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1A56E8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    plusHorizontal: {
        position: 'absolute',
        width: 22,
        height: 2.5,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    plusVertical: {
        position: 'absolute',
        width: 2.5,
        height: 22,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
});
