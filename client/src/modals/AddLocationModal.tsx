import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { insertLocationSchema } from '@shared/schema';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationAdded?: () => void;
  worldId: number;
  regionId?: number;
}

export function AddLocationModal({ 
  isOpen, 
  onClose, 
  onLocationAdded, 
  worldId,
  regionId
}: AddLocationModalProps) {
  const { toast } = useToast();
  
  // Fetch regions for this world
  const { data: regions } = useQuery({
    queryKey: [`/api/worlds/${worldId}/regions`],
    enabled: !!worldId,
  });
  
  // Using the Zod schema from schema.ts
  const formSchema = insertLocationSchema.extend({
    name: z.string().min(2, "Location name must have at least 2 characters"),
    description: z.string().min(10, "Please provide a more detailed description"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      regionId: regionId || null,
      imageUrl: "",
      locationType: "City",
      x: 250,
      y: 250,
      markerType: "standard",
    }
  });

  // Update regionId when it changes from props
  React.useEffect(() => {
    if (regionId) {
      form.setValue('regionId', regionId);
    }
  }, [regionId, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Transform the data to match the API expectations
      const payload = {
        ...data,
        regionId: Number(data.regionId),
        x: Number(data.x),
        y: Number(data.y),
      };
      
      await apiRequest('POST', '/api/locations', payload);
      
      toast({
        title: "Location created",
        description: "Your new location has been created successfully."
      });
      
      // Refetch relevant data
      queryClient.invalidateQueries({ queryKey: [`/api/worlds/${worldId}/locations`] });
      if (data.regionId) {
        queryClient.invalidateQueries({ queryKey: [`/api/regions/${data.regionId}/locations`] });
      }
      
      // Call the callback if provided
      if (onLocationAdded) {
        onLocationAdded();
      }
      
      // Close the modal and reset form
      onClose();
      form.reset({
        name: "",
        description: "",
        regionId: regionId || null,
        imageUrl: "",
        locationType: "City",
        x: 250,
        y: 250,
        markerType: "standard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create location. Please try again.",
        variant: "destructive"
      });
    }
  };

  const locationTypes = [
    "City", "Town", "Village", "Castle", "Ruin", 
    "Dungeon", "Temple", "Cave", "Forest", "Mountain", 
    "Lake", "River", "Bridge", "Tower", "Battlefield",
    "Tavern", "Inn", "Shop", "Port", "Camp", "Sacred Site", "Lair"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-primary">Create New Location</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Location Name</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" placeholder="e.g. Eldoria Castle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="locationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Location Type</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm"
                        {...field}
                      >
                        {locationTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="regionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-cinzel">Region</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">-- Select Region --</option>
                      {regions?.map(region => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-cinzel">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="bg-secondary" 
                      placeholder="Describe this location and its significance..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-cinzel">Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      className="bg-secondary" 
                      placeholder="https://example.com/location-image.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="markerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Marker Type</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm"
                        {...field}
                      >
                        <option value="standard">Standard</option>
                        <option value="quest">Quest Location</option>
                        <option value="danger">Danger Zone</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="x"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">X Coordinate</FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-secondary" 
                        type="number" 
                        min="0" 
                        max="1000" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="y"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Y Coordinate</FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-secondary" 
                        type="number" 
                        min="0" 
                        max="1000" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-accent text-primary hover:bg-accent/90">
                Create Location
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
