import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import { createManifestPost } from "../../lib/appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { router } from "expo-router";
const CreateManifest = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    tor: "",
    station: "",
    plate: "",
    startTime: null,
    departure: null,
    firstDelivery: null,
    lastDelivery: null,
    returnTime: null,
    endTime: null,
    kmStart: null,
    kmEnd: null,
    packages: null,
    returnedPackages: null,
  });

  const submit = async () => {
    setUploading(true);

    try {
      await createManifestPost({
        ...form,
        userId: user.$id,
      });
      Alert.alert("Success", "Manifest uploaded successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      // setForm({
      //   tor: "",
      //   station: "",
      //   plate: "",
      //   startTime: null,
      //   departure: null,
      //   firstDelivery: null,
      //   lastDelivery: null,
      //   returnTime: null,
      //   endTime: null,
      //   kmStart: null,
      //   kmEnd: null,
      //   packages: null,
      //   returnedPackages: null,
      // });

      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-semibold">
          Upload Manifest
        </Text>

        <FormField
          title="TOR"
          value={form.tor}
          placeholder="Enter TOR..."
          handleChangeText={(e) => setForm({ ...form, tor: e })}
          otherStyles="mt-10"
        />

        <FormField
          title="Station"
          value={form.station}
          placeholder="Enter Station..."
          handleChangeText={(e) => setForm({ ...form, station: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="Plate"
          value={form.plate}
          placeholder="Enter Plate..."
          handleChangeText={(e) => setForm({ ...form, plate: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="Start Time"
          value={form.startTime}
          placeholder="Enter Start Time..."
          handleChangeText={(e) => setForm({ ...form, startTime: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="Departure Time"
          value={form.departure}
          placeholder="Enter Departure..."
          handleChangeText={(e) => setForm({ ...form, departure: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="First Delivery Time"
          value={form.firstDelivery}
          placeholder="Enter First Delivery..."
          handleChangeText={(e) => setForm({ ...form, firstDelivery: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="Last Delivery Time"
          value={form.lastDelivery}
          placeholder="Enter Last Delivery..."
          handleChangeText={(e) => setForm({ ...form, lastDelivery: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="Return Time"
          value={form.returnTime}
          placeholder="Enter Return Time..."
          handleChangeText={(e) => setForm({ ...form, returnTime: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="End Time"
          value={form.endTime}
          placeholder="Enter End Time..."
          handleChangeText={(e) => setForm({ ...form, endTime: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="KM Start"
          value={form.kmStart}
          placeholder="Enter KM Start..."
          handleChangeText={(e) => setForm({ ...form, kmStart: e })}
          otherStyles="mt-7"
          keyboardType="numeric"
        />

        <FormField
          title="KM End"
          value={form.kmEnd}
          placeholder="Enter KM End..."
          handleChangeText={(e) => setForm({ ...form, kmEnd: e })}
          otherStyles="mt-7"
          keyboardType="numeric"
        />

        <FormField
          title="Packages"
          value={form.packages}
          placeholder="Enter Packages..."
          handleChangeText={(e) => setForm({ ...form, packages: e })}
          otherStyles="mt-7"
          keyboardType="numeric"
        />

        <FormField
          title="Returned Packages"
          value={form.returnedPackages}
          placeholder="Enter Returned Packages..."
          handleChangeText={(e) => setForm({ ...form, returnedPackages: e })}
          otherStyles="mt-7"
          keyboardType="numeric"
        />

        <CustomButton
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateManifest;
