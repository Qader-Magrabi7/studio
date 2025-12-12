"use server";

import { revalidatePath } from "next/cache";
import { generateLocationStory } from "@/ai/flows/generate-location-story";
import { summarizeLocationDetails } from "@/ai/flows/summarize-location-details";
import { addSavedLocation } from "@/lib/firebase";

export async function generateStoryAction(location: string) {
  if (!location) {
    return { error: "Please provide a location." };
  }
  try {
    const story = await generateLocationStory({ location });
    return { data: story };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate story. Please try again." };
  }
}

export async function saveLocationAction(location: string) {
    if (!location) {
        return { error: "Invalid location to save." };
    }
    try {
        const { summary } = await summarizeLocationDetails({ locationName: location });
        const newLocation = await addSavedLocation(location, summary);
        revalidatePath("/");
        return { data: newLocation };
    } catch (error) {
        console.error(error);
        return { error: "Failed to save location. Please make sure your Firebase project is configured correctly." };
    }
}
