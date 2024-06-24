import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.jsm.manifest-sheet",
  projectId: "66777e590014023dc8cd",
  databaseId: "66777f8b003e17d3e122",
  userCollectionId: "66777fba002f6a0f9e50",
  manifestCollectionId: "6678888a00115a2515d5",
  storageId: "667781e6001d64beb40e",
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Upload File
export async function uploadFile(file, type) {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// Get File Preview
export async function getFilePreview(fileId, type) {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// Create Manifest Manifest
export async function createManifestManifest(form) {
  try {
    let workingHours = (form.endTime - form.startTime) / (1000 * 60 * 60) - 0.5;

    if (workingHours >= 8.5) {
      workingHours -= 0.25;
    }

    workingHours = Math.max(workingHours, 0);

    const expenses = workingHours >= 8.0 ? 1 : 0;

    let totalPackages = form.packages;
    if (form.returnedPackages > 0) {
      totalPackages -= form.returnedPackages;
    }

    let kmTotal = form.kmEnd - form.kmStart;

    const uploadDate = new Date();

    const driverBreak=workingHours <= 8.5 ? "30 min" : "45 min"
    const newManifest = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      ID.unique(),
      {
        tor: form.tor,
        station: form.station,
        plate: form.plate,
        startTime: form.startTime,
        departure: form.departure,
        firstDelivery: form.firstDelivery,
        lastDelivery: form.lastDelivery,
        returnTime: form.returnTime,
        endTime: form.endTime,
        packages: form.packages,
        returnedPackages: form.returnedPackages,
        totalPackages: totalPackages,
        kmStart: form.kmStart,
        kmEnd: form.kmEnd,
        kmTotal: kmTotal,
        uploadDate: uploadDate,
        workingHours: workingHours,
        expenses: expenses,
        driverBreak:driverBreak,
        creator: form.userId,
      }
    );

    return newManifest;
  } catch (error) {
    console.error("Error creating manifest manifest:", error);
    throw new Error(`Failed to create manifest manifest: ${error.message}`);
  }
}

// Get all video Manifests
export async function getAllManifests() {
  try {
    const manifests = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return manifests.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get  manifests created by user
export async function getUserManifests(userId) {
  try {
    const manifests = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal("creator", userId)]
    );

    return manifests.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get manifests created by user
export async function getUserManifestsCurrentMonth(userId) {
  try {
    // Get the current date
    const currentDate = new Date();
    
    // Get the first and last day of the current month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Retrieve manifests for the current month
    const manifests = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      [
        Query.equal("creator", userId),
        Query.greaterThanEqual("uploadDate", firstDayOfMonth.toISOString()),
        Query.lessThanEqual("uploadDate", lastDayOfMonth.toISOString())
      ]
    );

    let kmTotal = 0;
    let workingHours = 0;
    let totalPackages = 0;
    let expenses = 0;
    let manifestCount = manifests.documents.length;

    manifests.documents.forEach(document => {
      kmTotal += document.kmTotal || 0;
      workingHours += document.workingHours || 0;
      totalPackages += document.totalPackages || 0;
      expenses += document.expenses || 0;
    });

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthName = monthNames[currentDate.getMonth()];

    return {
      kmTotal,
      workingHours,
      totalPackages,
      expenses,
      manifestCount,
      currentMonthName,
      manifests: manifests.documents
    };
  } catch (error) {
    throw new Error(error);
  }
}

// Get video manifests that matches search query
export async function searchManifests(query) {
  try {
    const manifests = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      [Query.search("title", query)]
    );

    if (!manifests) throw new Error("Something went wrong");

    return manifests.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get latest created video manifests
export async function getLatestManifests() {
  try {
    const manifests = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return manifests.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get manifest by ID
export async function getManifestById(manifestId) {
  try {
    const manifest = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      manifestId
    );

    return manifest;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update video manifest
export async function updateVideoManifest(manifestId, data) {
  try {
    const updatedManifest = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      manifestId,
      data
    );

    return updatedManifest;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Delete Video Manifest
export async function deleteVideoManifest(manifestId) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      manifestId
    );

    return { success: true };
  } catch (error) {
    throw new Error(error);
  }
}

// Like Video Manifest
export async function likeVideoManifest(manifestId) {
  try {
    const manifest = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      manifestId
    );

    const updatedLikes = (manifest.likes || 0) + 1;

    const updatedManifest = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      manifestId,
      { likes: updatedLikes }
    );

    return updatedManifest;
  } catch (error) {
    throw new Error(error);
  }
}
