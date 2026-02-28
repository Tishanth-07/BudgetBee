import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Member {
  id: string;
  firstName: string;
  avatar: string;
}

interface MemberAvatarRowProps {
  members: Member[];
  onAdd?: () => void;
  onPressMember?: (memberId: string) => void;
}

export function MemberAvatarRow({
  members,
  onAdd,
  onPressMember,
}: MemberAvatarRowProps) {
  return (
    <View className="flex-row gap-4 py-3">
      {members.map((member) => (
        <TouchableOpacity
          key={member.id}
          className="items-center gap-1"
          onPress={() => onPressMember?.(member.id)}
        >
          <Image source={{ uri: member.avatar }} className="w-16 h-16 rounded-avatar" />
          <Text className="text-textsecondary text-xs">{member.firstName}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity className="items-center gap-1" onPress={onAdd}>
        <View className="w-16 h-16 rounded-avatar bg-gray-200 items-center justify-center">
          <Ionicons name="add" size={24} color="#6B7280" />
        </View>
        <Text className="text-textsecondary text-xs">Member</Text>
      </TouchableOpacity>
    </View>
  );
}

