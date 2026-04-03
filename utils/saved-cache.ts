import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "saved_listings_v1";

export async function getSavedListings(): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("getSavedListings error", err);
    return [];
  }
}

export async function saveListing(item: any): Promise<void> {
  try {
    const list = await getSavedListings();

    const id = String(item?.id ?? "");

    // Create a minimal, serializable snapshot of the listing to store in cache
    const snapshot: any = {
      id,
      title: item?.title ?? item?.propertyName ?? item?.name ?? "",
      subtitle: item?.subtitle ?? item?.location ?? item?.address ?? "",
      price: item?.price ?? item?.rate ?? item?.amount ?? "",
      period: item?.period ?? item?.ratePeriod ?? "",
      // normalize image: prefer { uri } or keep numeric resource id
      image: item?.image?.uri
        ? { uri: String(item.image.uri) }
        : (item?.image ?? null),
      raw: item?.raw ?? undefined,
    };

    // dedupe by string id
    const exists = list.find((x: any) => String(x.id) === id);
    if (!exists) {
      list.unshift(snapshot);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.error("saveListing error", err);
  }
}

export async function removeListing(id: string): Promise<void> {
  try {
    const sid = String(id);
    const list = (await getSavedListings()).filter(
      (x: any) => String(x.id) !== sid,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("removeListing error", err);
  }
}

export async function toggleListing(item: any): Promise<boolean> {
  try {
    const id = String(item?.id ?? "");
    const list = await getSavedListings();
    const exists = list.find((x: any) => String(x.id) === id);
    if (exists) {
      await removeListing(id);
      return false;
    }
    await saveListing(item);
    return true;
  } catch (err) {
    console.error("toggleListing error", err);
    return false;
  }
}

export async function isListingSaved(id: string): Promise<boolean> {
  try {
    const sid = String(id);
    const list = await getSavedListings();
    return list.some((x: any) => String(x.id) === sid);
  } catch (err) {
    return false;
  }
}
