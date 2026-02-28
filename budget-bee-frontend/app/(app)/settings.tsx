import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../lib/api/client";

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
                        await api.post("/auth/logout");
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
            <LinearGradient colors={["#A8C8F8", "#E8F0FF"]} className="px-4 pt-4 pb-4">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#1A2B5E" />
                    </TouchableOpacity>
                    <Text className="text-navy font-bold text-xl">Settings</Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-4 pt-4">
                {/* Preferences */}
                <Text className="section-title mb-3">Preferences</Text>
                <View className="card mb-4">
                    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="notifications-outline" size={20} color="#374151" />
                            <Text className="text-textbody font-semibold text-base">Notifications</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ true: "#1A56E8" }}
                        />
                    </View>
                    <View className="flex-row items-center justify-between py-3">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="moon-outline" size={20} color="#374151" />
                            <Text className="text-textbody font-semibold text-base">Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ true: "#1A56E8" }}
                        />
                    </View>
                </View>

                {/* Account */}
                <Text className="section-title mb-3">Account</Text>
                <View className="card mb-4">
                    <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="key-outline" size={20} color="#374151" />
                            <Text className="text-textbody font-semibold text-base">Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="language-outline" size={20} color="#374151" />
                            <Text className="text-textbody font-semibold text-base">Language</Text>
                        </View>
                        <Text className="text-textsecondary text-sm">English</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between py-3">
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="person-circle-outline" size={20} color="#374151" />
                            <Text className="text-textbody font-semibold text-base">Edit Profile</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Legal */}
                <Text className="section-title mb-3">Legal</Text>
                <View className="card mb-4">
                    <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <Text className="text-textbody font-semibold text-base">Privacy Policy</Text>
                        <Ionicons name="open-outline" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between py-3">
                        <Text className="text-textbody font-semibold text-base">Terms of Service</Text>
                        <Ionicons name="open-outline" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Danger zone */}
                <TouchableOpacity
                    className="btn-primary mb-4"
                    style={{ backgroundColor: "#EF4444" }}
                    onPress={handleLogout}
                >
                    <Text className="btn-primary-text">Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="items-center py-4 mb-8"
                    onPress={handleDeleteAccount}
                >
                    <Text className="text-danger text-sm font-semibold">Delete Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
