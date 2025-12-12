import { getSavedLocations } from '@/lib/firebase';
import { LoreExplorer } from '@/components/lore-explorer';
import type { SavedLocation } from '@/lib/types';

export const revalidate = 0;

export default async function Home() {
  const savedLocationsData = await getSavedLocations();
  // Firestore timestamps are not serializable, so we need to convert them.
  const initialLocations = JSON.parse(JSON.stringify(savedLocationsData)) as SavedLocation[];

  return <LoreExplorer initialLocations={initialLocations} />;
}
