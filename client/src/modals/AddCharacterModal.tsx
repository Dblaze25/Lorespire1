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
import { insertCharacterSchema } from '@shared/schema';

interface AddCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterAdded?: () => void;
  worldId: number;
}

export function AddCharacterModal({ isOpen, onClose, onCharacterAdded, worldId }: AddCharacterModalProps) {
  const { toast } = useToast();
  
  // Fetch regions for this world
  const { data: regions } = useQuery({
    queryKey: [`/api/worlds/${worldId}/regions`],
    enabled: !!worldId,
  });
  
  // Fetch locations for this world
  const { data: locations } = useQuery({
    queryKey: [`/api/worlds/${worldId}/locations`],
    enabled: !!worldId,
  });
  
  // Using the Zod schema from schema.ts
  const formSchema = insertCharacterSchema.extend({
    name: z.string().min(2, "Character name must have at least 2 characters"),
    abilities: z.string().transform(val => val ? val.split(',').map(a => a.trim()) : []),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      worldId,
      regionId: null,
      locationId: null,
      description: "",
      appearance: "",
      personality: "",
      abilities: "",
      imageUrl: "",
      race: "",
      characterType: "npc",
    }
  });

  // Update worldId when it changes
  React.useEffect(() => {
    form.setValue('worldId', worldId);
  }, [worldId, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Transform the data to match the API expectations
      const payload = {
        ...data,
        regionId: data.regionId ? Number(data.regionId) : null,
        locationId: data.locationId ? Number(data.locationId) : null,
      };
      
      await apiRequest('POST', '/api/characters', payload);
      
      toast({
        title: "Character created",
        description: "Your new character has been created successfully."
      });
      
      // Refetch the characters list
      queryClient.invalidateQueries({ queryKey: [`/api/worlds/${worldId}/characters`] });
      
      // Call the callback if provided
      if (onCharacterAdded) {
        onCharacterAdded();
      }
      
      // Close the modal and reset form
      onClose();
      form.reset({
        name: "",
        worldId,
        regionId: null,
        locationId: null,
        description: "",
        appearance: "",
        personality: "",
        abilities: "",
        imageUrl: "",
        race: "",
        characterType: "npc",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create character. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update available locations when region changes
  const selectedRegionId = form.watch('regionId');
  const filteredLocations = locations?.filter(location => 
    selectedRegionId ? location.regionId === Number(selectedRegionId) : true
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-primary">Create New Character</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Character Name</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Race</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" placeholder="Human, Elf, Dwarf, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="characterType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Character Type</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm"
                        {...field}
                      >
                        <option value="npc">NPC</option>
                        <option value="ally">Ally</option>
                        <option value="villain">Villain</option>
                      </select>
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
                    <FormLabel className="font-cinzel">Image URL</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        onChange={(e) => {
                          field.onChange(e.target.value ? Number(e.target.value) : null);
                          // Reset location when region changes
                          form.setValue('locationId', null);
                        }}
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
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Location</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        disabled={!selectedRegionId}
                      >
                        <option value="">-- Select Location --</option>
                        {filteredLocations?.map(location => (
                          <option key={location.id} value={location.id}>{location.name}</option>
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
                      className="bg-secondary" 
                      placeholder="Brief character description"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appearance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Appearance</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="bg-secondary" 
                        placeholder="Describe physical appearance"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="personality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Personality</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="bg-secondary" 
                        placeholder="Describe personality traits"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="abilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-cinzel">Abilities (comma-separated)</FormLabel>
                  <FormControl>
                    <Input 
                      className="bg-secondary" 
                      placeholder="e.g. Master Diviner, Arcane Scholar, Telepathic Communication" 
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
                Create Character
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
