import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity } from "react-native";

import useAppwrite from "../../lib/useAppwrite";
import { getUserManifests, getUserManifestsCurrentMonth, signOut } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmptyState from "../../components/EmptyState";
import InfoBox from "../../components/InfoBox";
import ManifestCard from "../../components/ManifestCard";
import { icons } from "../../constants";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: manifests } = useAppwrite(() => getUserManifestsCurrentMonth(user.$id));

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);

    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={manifests}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <ManifestCard manifest={item} />}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this profile"
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <InfoBox
              title={manifests.currentMonthName}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row ">
              <InfoBox
                title={manifests.manifestCount || 0}
                subtitle="Manifests"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox
                title={manifests.expenses || 0}
                subtitle="Expenses"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox
                title={manifests.expenses}
                subtitle="Hours"
                titleStyles="text-xl"
              />
            </View>
            <View className="mt-5 flex flex-row">
              <InfoBox
                title={manifests.kmTotal}
                subtitle="Kilometers"
                titleStyles="text-xl"
              />
              <InfoBox
                title={manifests.totalPackages}
                subtitle="Packages"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
