import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
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
import { insertRegionSchema } from '@shared/schema';

interface AddRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegionAdded?: () => void;
  worldId: number;
}

export function AddRegionModal({ isOpen, onClose, onRegionAdded, worldId }: AddRegionModalProps) {
  const { toast } = useToast();
  
  // Using the Zod schema from schema.ts
  const formSchema = insertRegionSchema.extend({
    name: z.string().min(2, "Region name must have at least 2 characters"),
    description: z.string().min(10, "Please provide a more detailed description"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      worldId,
      imageUrl: "",
      type: "Forest",
    }
  });

  // Update worldId when it changes
  React.useEffect(() => {
    form.setValue('worldId', worldId);
  }, [worldId, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await apiRequest('POST', '/api/regions', data);
      
      toast({
        title: "Region created",
        description: "Your new region has been created successfully."
      });
      
      // Refetch the regions list
      queryClient.invalidateQueries({ queryKey: [`/api/worlds/${worldId}/regions`] });
      
      // Call the callback if provided
      if (onRegionAdded) {
        onRegionAdded();
      }
      
      // Close the modal and reset form
      onClose();
      form.reset({
        name: "",
        description: "",
        worldId,
        imageUrl: "",
        type: "Forest",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create region. Please try again.",
        variant: "destructive"
      });
    }
  };

  const regionTypes = [
    "Forest", "Mountain", "Desert", "Plains", "Jungle", 
    "Tundra", "Swamp", "Ocean", "Island", "City", 
    "Village", "Castle", "Dungeon", "Capital", "Wasteland"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-primary">Create New Region</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Region Name</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" placeholder="e.g. Mystic Forest" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Region Type</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm"
                        {...field}
                      >
                        {regionTypes.map(type => (
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-cinzel">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="bg-secondary min-h-[120px]" 
                      placeholder="Describe the geography, climate, and unique features of this region..."
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
                      placeholder="https://example.com/region-image.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <input type="hidden" {...form.register("worldId", { valueAsNumber: true })} />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-accent text-primary hover:bg-accent/90">
                Create Region
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
