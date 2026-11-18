import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

export async function pickProfilePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      permission.canAskAgain
        ? "Photo access is needed to choose a profile picture."
        : "Photo access is disabled. Enable it in your device settings to choose a picture.",
    );
  }

  const selection = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (selection.canceled) {
    return null;
  }

  const asset = selection.assets[0];
  if (!asset?.uri) {
    throw new Error("The selected picture could not be opened.");
  }

  const resized = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 512, height: 512 } }],
    {
      compress: 0.75,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );
  if (!resized.base64) {
    throw new Error("The selected picture could not be saved.");
  }

  return `data:image/jpeg;base64,${resized.base64}`;
}
