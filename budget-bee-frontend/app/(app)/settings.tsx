import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { apiRequest } from "../../lib/api/client";

export default function Settings() {
    const router = useRouter();
    const { logout } = useAuthStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        await apiRequest("post", "/auth/logout");
                    } catch { }
                    logout();
                    router.replace("/(auth)/welcome");
                },
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "This action is irreversible. All your data will be permanently deleted.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => { } },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-appbg" edges={["top"]}>
            <LinearGradient colors={["#A8C8F8", "#D6E4FF"]} className="px-6 pt-4 pb-4">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A2B5E" />
                    </TouchableOpacity>
                    <Text className="text-navy font-bold text-xl">Settings</Text>
                    <View className="w-10" />
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Preferences */}
                <Text className="text-textsecondary text-xs uppercase font-bold tracking-wider mb-2 ml-2">Preferences</Text>
                <View className="bg-white rounded-card shadow-sm mb-6">
                    <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="notifications-outline" size={22} color="#4B5563" />
                            <Text className="text-textprimary font-semibold text-base">Notifications</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ true: "#1A56E8", false: "#E5E7EB" }}
                        />
                    </View>
                    <View className="flex-row items-center justify-between py-4 px-4">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="moon-outline" size={22} color="#4B5563" />
                            <Text className="text-textprimary font-semibold text-base">Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ true: "#1A56E8", false: "#E5E7EB" }}
                        />
                    </View>
                </View>

                {/* Account */}
                <Text className="text-textsecondary text-xs uppercase font-bold tracking-wider mb-2 ml-2">Account</Text>
                <View className="bg-white rounded-card shadow-sm mb-6">
                    <TouchableOpacity className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="key-outline" size={22} color="#4B5563" />
                            <Text className="text-textprimary font-semibold text-base">Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="language-outline" size={22} color="#4B5563" />
                            <Text className="text-textprimary font-semibold text-base">Language</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-textsecondary text-sm">English</Text>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between py-4 px-4">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="person-circle-outline" size={22} color="#4B5563" />
                            <Text className="text-textprimary font-semibold text-base">Edit Profile</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                {/* Legal */}
                <Text className="text-textsecondary text-xs uppercase font-bold tracking-wider mb-2 ml-2">Legal</Text>
                <View className="bg-white rounded-card shadow-sm mb-8">
                    <TouchableOpacity className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
                        <Text className="text-textprimary font-semibold text-base">Privacy Policy</Text>
                        <Ionicons name="open-outline" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
                        <Text className="text-textprimary font-semibold text-base">Terms of Service</Text>
                        <Ionicons name="open-outline" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between py-4 px-4">
                        <Text className="text-textprimary font-semibold text-base">Open Source Libraries</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                {/* Danger zone */}
                <TouchableOpacity
                    className="bg-danger py-4 rounded-full items-center shadow-lg mb-6 mx-2"
                    onPress={handleLogout}
                >
                    <Text className="text-white font-bold text-lg">Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="items-center py-4 px-4 bg-danger/10 rounded-full mx-10 mb-8"
                    onPress={handleDeleteAccount}
                >
                    <Text className="text-danger text-sm font-bold">Delete Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
