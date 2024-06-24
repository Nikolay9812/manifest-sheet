import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import SearchInput from '../../components/SearchInput';
import Trending from '../../components/Trending';
import EmptyState from '../../components/EmptyState';
import { getAllManifests, getLatestManifests } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import ManifestCard from '../../components/ManifestCard';
import { useGlobalContext } from '../../context/GlobalProvider';

const Home = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [manifests, setManifests] = useState([]);
  const { data: fetchedManifests, refetch } = useAppwrite(getAllManifests);
  const { data: latestManifests } = useAppwrite(getLatestManifests);
  const { user } = useGlobalContext();

  useEffect(() => {
    if (fetchedManifests) {
      setManifests(fetchedManifests);
    }
  }, [fetchedManifests]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleManifestUpdated = (updatedManifest) => {
    // Update the local state with the updated manifest
    const updatedManifests = manifests.map((manifest) =>
      manifest.$id === updatedManifest.$id ? updatedManifest : manifest
    );
    setManifests(updatedManifests);
  };

  const handleManifestDeleted = (deletedManifestId) => {
    // Update the local state by removing the deleted manifest
    const updatedManifests = manifests.filter((manifest) => manifest.$id !== deletedManifestId);
    setManifests(updatedManifests);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={manifests}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <ManifestCard
            manifest={item}
            onManifestUpdated={handleManifestUpdated}
            onManifestDeleted={handleManifestDeleted}
          />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome Back
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {user?.username}
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput />

            
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="Be the refreshing one to upload a video"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Home;