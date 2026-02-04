
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Budget() {
    return (
        <SafeAreaView className="flex-1 bg-blue-50 items-center justify-center">
            <Text className="text-2xl font-bold text-blue-900">Budget</Text>
            <Text className="text-blue-500 mt-2">Track your spending goals here</Text>
        </SafeAreaView>
    );
}
