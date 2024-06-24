import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";
import { useRouter } from "expo-router"; // Updated import

import { icons } from "../constants";

import { deleteVideoManifest } from "../lib/appwrite"; // Ensure correct import
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

const ManifestCard = ({
  manifest: {
    $id,
    uploadDate,
    tor,
    station,
    plate,
    workingHours,
    kmTotal,
    totalPackages,
    driverBreak,
    expenses,
    returnedPackages,
    creator: { username, avatar },
  },
  onManifestDeleted,
}) => {
  const [play, setPlay] = useState(false);
  const router = useRouter(); // Use useRouter from expo-router

  const date = new Date(uploadDate).toDateString()

  const handleEdit = () => {
    router.push({ pathname: "/edit", params: { manifestId: $id } });
  };

  const handleDelete = async () => {
    try {
      await deleteVideoManifest($id);
      Alert.alert("Success", "Manifest deleted successfully");
      onManifestDeleted($id);
    } catch (error) {
      console.error("Error deleting manifest:", error); // Log the error
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              {date}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        <Menu>
          <MenuTrigger>
            <Image
              source={icons.menu}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={0}>
              <Text>Like</Text>
            </MenuOption>
            <MenuOption onSelect={handleEdit}>
              <Text>Edit</Text>
            </MenuOption>
            <MenuOption onSelect={handleDelete}>
              <Text>Delete</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
      <View className="border border-secondary-200 rounded-xl mt-5 p-5 space-y-5">
        <View className="flex-row w-full justify-between items-center">
          <View className="flex-1 flex-row items-center justify-center gap-1">
            <Entypo name="location-pin" size={12} color="gray" />
            <Text className="font-psemibold text-sm text-gray-500 ">{tor}</Text>
          </View>
          <View className="flex-1 flex-row items-center justify-center gap-1">
            <MaterialCommunityIcons
              name="garage-variant"
              size={12}
              color="gray"
            />
            <Text className="font-psemibold text-sm text-gray-500 ">
              {station}
            </Text>
          </View>
          <View className="flex-1 flex-row items-center justify-center gap-1">
            <FontAwesome name="bus" size={12} color="gray" />
            <Text className="font-psemibold text-sm text-gray-500 ">
              {plate}
            </Text>
          </View>
        </View>
        <View className="flex-row w-full justify-between items-center">
          <View className="flex-1 flex-row  items-center justify-center gap-1">
            <AntDesign name="clockcircleo" size={12} color="gray" />
            <Text className="font-psemibold text-xs text-gray-500 ">
              {workingHours}
            </Text>
          </View>
          <View className="flex-1 flex-row items-center justify-center gap-1">
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={12}
              color="gray"
            />
            <Text className="font-psemibold text-sm text-gray-500 ">
              {kmTotal} km
            </Text>
          </View>
          <View className="flex-1 flex-row items-center justify-center gap-1">
            <Feather name="package" size={12} color="gray" />
            <Text className="font-psemibold text-sm text-gray-500 ">
              {totalPackages}
            </Text>
          </View>
        </View>
        <View className="flex-row w-full justify-between items-center">
          <View className="flex-1 flex-row  items-center justify-center gap-1">
            <AntDesign name="paperclip" size={12} color="gray" />
            <Text className="font-psemibold text-sm text-gray-500 ">
              {expenses}
            </Text>
          </View>
          <View className="flex-1 flex-row  items-center justify-center gap-1">
            <Feather name="package" size={12} color="gray" />
            <Text className="font-psemibold text-sm text-gray-500 ">
              {returnedPackages}
            </Text>
          </View>
          <View className="flex-1 flex-row  items-center justify-center gap-1">
            <MaterialIcons name="lunch-dining" size={12} color="gray" />
            <Text className="font-psemibold text-sm text-gray-500 ">
              {driverBreak}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ManifestCard;
