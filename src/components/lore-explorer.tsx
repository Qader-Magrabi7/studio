"use client";

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Compass, BookOpen, Save, MapPin, Search, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateStoryAction, saveLocationAction } from '@/app/actions';
import type { SavedLocation, Story } from '@/lib/types';
import placeholderData from '@/lib/placeholder-images.json';

export function LoreExplorer({ initialLocations }: { initialLocations: SavedLocation[] }) {
  const [locationInput, setLocationInput] = useState('');
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(initialLocations);
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSavedLocations(initialLocations);
  }, [initialLocations]);

  const handleGenerateStory = (location: string) => {
    if (!location) {
      toast({
        variant: "destructive",
        title: "No Location",
        description: "Please enter a location to get a story.",
      });
      return;
    }

    startGenerating(async () => {
      setStory(null);
      setLocationInput(location);
      setCurrentLocation(location);
      const result = await generateStoryAction(location);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else if (result.data) {
        setStory(result.data);
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleGenerateStory(locationInput);
  };
  
  const handleDetectLocation = () => {
    setIsDetecting(true);
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
      });
      setIsDetecting(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setIsDetecting(false);
        toast({
          title: "Location Detected",
          description: "Click 'Generate Story' to uncover tales from your current location.",
        });
        handleGenerateStory(locationString);
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Geolocation Error",
          description: error.message,
        });
        setIsDetecting(false);
      }
    );
  };

  const handleSaveLocation = () => {
    if (!currentLocation) return;
    
    if (savedLocations.some(loc => loc.name === currentLocation)) {
      toast({
        title: "Already Saved",
        description: "This location is already in your collection."
      });
      return;
    }

    startSaving(async () => {
      const result = await saveLocationAction(currentLocation);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: result.error,
        });
      } else {
        toast({
          title: "Location Saved!",
          description: `"${currentLocation}" has been added to your collection.`,
        });
      }
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="p-4 flex items-center justify-between border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary tracking-tight">Lore Explorer</h1>
          </div>
        </header>

        <Sidebar>
          <SidebarHeader className="p-4">
            <h2 className="font-headline text-xl font-semibold flex items-center gap-2">
              <BookOpen className="text-primary"/>
              Saved Locations
            </h2>
          </SidebarHeader>
          <SidebarContent>
            <ScrollArea className="h-full">
              <SidebarMenu>
                {savedLocations.length > 0 ? (
                  savedLocations.map((loc) => (
                    <SidebarMenuItem key={loc.id}>
                      <SidebarMenuButton onClick={() => handleGenerateStory(loc.name)} isActive={currentLocation === loc.name} tooltip={loc.name}>
                        <span>{loc.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No saved locations yet. Explore and save some stories!
                  </div>
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <main className="flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out">
            <div className="max-w-4xl mx-auto grid gap-8">
              <Card className="shadow-lg border-primary/20">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Discover a New Story</CardTitle>
                  <CardDescription>Enter a location or use your current one to generate a unique story.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="e.g., Eiffel Tower, Paris"
                        className="pl-10 text-base"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        disabled={isGenerating || isDetecting}
                      />
                    </div>
                    <Button type="submit" disabled={isGenerating || isDetecting || !locationInput} className="w-full sm:w-auto">
                      {isGenerating && !isDetecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Compass className="mr-2 h-4 w-4" />}
                      Generate Story
                    </Button>
                    <Button type="button" variant="outline" onClick={handleDetectLocation} disabled={isGenerating || isDetecting} className="w-full sm:w-auto">
                      {isDetecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                      Detect Location
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {isGenerating ? (
                <StorySkeleton />
              ) : story ? (
                <Card className="shadow-lg border-primary/20 animate-in fade-in-50 duration-500">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <CardTitle className="font-headline text-3xl">{story.title}</CardTitle>
                        <CardDescription>A story about {currentLocation}</CardDescription>
                      </div>
                      <Button onClick={handleSaveLocation} disabled={isSaving} className="w-full sm:w-auto shrink-0">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Place
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[40vh] md:h-[50vh] pr-4">
                      <article className="prose dark:prose-invert max-w-none text-foreground/90 leading-loose font-body whitespace-pre-wrap">
                        {story.story}
                      </article>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <WelcomeMessage />
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const StorySkeleton = () => (
  <Card className="shadow-md">
    <CardHeader>
      <Skeleton className="h-8 w-3/4 rounded-md bg-muted-foreground/10" />
      <Skeleton className="h-4 w-1/2 rounded-md bg-muted-foreground/10 mt-2" />
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-full rounded-md bg-muted-foreground/10" />
      <Skeleton className="h-4 w-full rounded-md bg-muted-foreground/10" />
      <Skeleton className="h-4 w-5/6 rounded-md bg-muted-foreground/10" />
      <Skeleton className="h-4 w-full rounded-md bg-muted-foreground/10" />
      <Skeleton className="h-4 w-full rounded-md bg-muted-foreground/10" />
      <Skeleton className="h-4 w-3/4 rounded-md bg-muted-foreground/10" />
    </CardContent>
  </Card>
);

const WelcomeMessage = () => {
    const image = placeholderData.placeholderImages[0];

    return (
        <Card className="text-center p-8 border-2 border-dashed rounded-lg animate-in fade-in-50 duration-500 shadow-lg border-primary/20">
            <Image 
                src={image.imageUrl}
                alt={image.description}
                width={1200}
                height={400}
                data-ai-hint={image.imageHint}
                className="mx-auto rounded-md mb-6 object-cover aspect-[3/1]"
                priority
            />
            <h2 className="font-headline text-2xl font-semibold mb-2">Your Journey Begins</h2>
            <p className="text-muted-foreground max-w-md mx-auto">The world is full of stories waiting to be told. Enter a location above to uncover its hidden tales.</p>
        </Card>
    );
};
