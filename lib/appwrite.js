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

// Create Manifest Post
export async function createManifestPost(form) {
  try {
    const startTime = parseTimeStringToDate(form.startTime);
    const endTime = parseTimeStringToDate(form.endTime);

    let workingHours = (endTime - startTime) / (1000 * 60 * 60) - 0.5;

    if (workingHours >= 8.5) {
      workingHours -= 0.25;
    }

    workingHours = Math.max(workingHours, 0);

    let totalPackages = form.packages;
    if (form.returnedPackages > 0) {
      totalPackages -= form.returnedPackages;
    }

    const kmTotal = form.kmEnd - form.kmStart;

    const uploadDate = new Date()

    const newManifest = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      ID.unique(),
      {
        ...form,
        startTime: startTime,
        endTime: endTime,
        totalPackages: totalPackages,
        kmTotal: kmTotal,
        uploadDate:uploadDate,
        workingHours: workingHours,
        creator: form.userId,
      }
    );



    return newManifest;
  } catch (error) {
    console.error("Error creating manifest post:", error);
    throw new Error(`Failed to create manifest post: ${error.message}`);
  }
}

// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get video posts created by user
export async function getUserPosts(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      [Query.equal("creator", userId)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get video posts that matches search query
export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get latest created video posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get post by ID
export async function getPostById(postId) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      postId
    );

    return post;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update video post
export async function updateVideoPost(postId, data) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      postId,
      data
    );

    return updatedPost;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Delete Video Post
export async function deleteVideoPost(postId) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      postId
    );

    return { success: true };
  } catch (error) {
    throw new Error(error);
  }
}

// Like Video Post
export async function likeVideoPost(postId) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      postId
    );

    const updatedLikes = (post.likes || 0) + 1;

    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.manifestCollectionId,
      postId,
      { likes: updatedLikes }
    );

    return updatedPost;
  } catch (error) {
    throw new Error(error);
  }
}

function parseTimeStringToDate(timeString) {
  // Split the time string into hours, minutes, and period (AM/PM)
  const [time, period] = timeString.split(" ");
  const [hours, minutes] = time.split(":").map((num) => parseInt(num, 10));

  // Convert hours based on AM/PM period
  let adjustedHours = hours;
  if (period === "PM" && hours !== 12) {
    adjustedHours += 12;
  } else if (period === "AM" && hours === 12) {
    adjustedHours = 0; // Midnight hour
  }

  // Create Date object with current date and parsed time
  const currentDate = new Date();
  currentDate.setHours(adjustedHours, minutes, 0, 0);
  return currentDate;
}
