"use client";

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Compass, BookOpen, Save, MapPin, Search, Loader2, Globe, Users, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateStoryAction, saveLocationAction } from '@/app/actions';
import type { SavedLocation, Story } from '@/lib/types';
import placeholderData from '@/lib/placeholder-images.json';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';


export function LoreExplorer({ initialLocations }: { initialLocations: SavedLocation[] }) {
  const [locationInput, setLocationInput] = useState('');
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(initialLocations);
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


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
    
    setIsSidebarOpen(false);

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
        setLocationInput(locationString);
        handleGenerateStory(locationString);
        setIsDetecting(false);
        toast({
          title: "Location Detected",
          description: "Generating a story for your current location.",
        });
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 flex items-center justify-between border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary tracking-tight">Lore Explorer</h1>
        </div>
        <Dialog open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <BookOpen className="h-4 w-4" />
                    <span className="sr-only">Open Saved Locations</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="text-primary"/>
                    Saved Locations
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] mt-4">
                    {savedLocations.length > 0 ? (
                    savedLocations.map((loc) => (
                        <Button
                            key={loc.id}
                            variant={currentLocation === loc.name ? "secondary" : "ghost"}
                            className="w-full justify-start truncate"
                            onClick={() => handleGenerateStory(loc.name)}
                        >
                            {loc.name}
                        </Button>
                    ))
                    ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                        No saved locations yet. Explore and save some stories!
                    </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto grid gap-8">
          <Card 
            className="shadow-lg relative overflow-hidden bg-cover bg-center text-white"
            style={{backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Discover a New Story</CardTitle>
                <CardDescription className="text-gray-300">Enter a location or use your current one to generate a unique story.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                    <Input
                      type="text"
                      placeholder="e.g., Eiffel Tower, Paris"
                      className="pl-10 text-base bg-white/10 text-white placeholder:text-gray-300 border-white/20 focus:ring-primary"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      disabled={isGenerating || isDetecting}
                    />
                  </div>
                  <Button type="submit" disabled={isGenerating || isDetecting || !locationInput} className="w-full sm:w-auto">
                    {isGenerating && !isDetecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Compass className="mr-2 h-4 w-4" />}
                    Generate Story
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleDetectLocation} disabled={isGenerating || isDetecting} className="w-full sm:w-auto">
                    {isDetecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    Detect Location
                  </Button>
                </form>
              </CardContent>
            </div>
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
          <AboutTeamSection />
          <ContactUsSection />
        </div>
      </main>
    </div>
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

const AboutTeamSection = () => (
    <Card 
        className="shadow-lg relative overflow-hidden bg-cover bg-center text-white"
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}
    >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Users /> About Our Team
                </CardTitle>
                <CardDescription className="text-gray-300">The creators behind Lore Explorer.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Team member 1"/>
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">Jane Doe</h3>
                    <p className="text-sm text-gray-300">Lead Developer</p>
                    <p className="text-xs mt-2 text-gray-400">Architect of the story engine and finder of cosmic tales.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704e" alt="Team member 2" />
                        <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">John Smith</h3>
                    <p className="text-sm text-gray-300">UI/UX Designer</p>
                    <p className="text-xs mt-2 text-gray-400">Designer of stellar interfaces and navigator of user journeys.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704f" alt="Team member 3" />
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">AI Oracle</h3>
                    <p className="text-sm text-gray-300">The Storyteller</p>
                    <p className="text-xs mt-2 text-gray-400">The AI that weaves the lore of the universe for your exploration.</p>
                </div>
            </CardContent>
        </div>
    </Card>
);

const ContactUsSection = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Message Sent!",
                description: "Thank you for reaching out. We'll get back to you soon.",
            });
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Mail /> Contact Us
                </CardTitle>
                <CardDescription>Have questions or feedback? Send us a message.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleContactSubmit} className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input placeholder="Your Name" required className="bg-background border-input"/>
                        <Input type="email" placeholder="Your Email" required className="bg-background border-input"/>
                    </div>
                    <Textarea placeholder="Your message..." required rows={5} className="bg-background border-input" />
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Message
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
