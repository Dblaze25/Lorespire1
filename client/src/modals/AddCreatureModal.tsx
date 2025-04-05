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
import { insertCreatureSchema } from '@shared/schema';

interface AddCreatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatureAdded?: () => void;
  worldId: number;
}

export function AddCreatureModal({ isOpen, onClose, onCreatureAdded, worldId }: AddCreatureModalProps) {
  const { toast } = useToast();
  
  // Fetch regions for this world
  const { data: regions } = useQuery({
    queryKey: [`/api/worlds/${worldId}/regions`],
    enabled: !!worldId,
  });
  
  // Using the Zod schema from schema.ts
  const formSchema = insertCreatureSchema.extend({
    name: z.string().min(2, "Creature name must have at least 2 characters"),
    specialAttacks: z.string().transform(val => val ? val.split(',').map(a => a.trim()) : []),
    // For JSON fields in form, we'll need to handle conversion
    abilities: z.string().transform(val => {
      try {
        const parsed = JSON.parse(val);
        return parsed;
      } catch (e) {
        // If not valid JSON, try to parse as comma-separated key-value pairs
        const result: Record<string, number> = {};
        val.split(',').forEach(pair => {
          const [key, value] = pair.split(':');
          if (key && value) {
            result[key.trim()] = parseInt(value.trim());
          }
        });
        return result;
      }
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      worldId,
      regionId: null,
      imageUrl: "",
      description: "",
      creatureType: "",
      rarity: "common",
      challengeRating: "1",
      armorClass: 10,
      hitPoints: "",
      speed: "",
      abilities: '{"STR": 10, "DEX": 10, "CON": 10, "INT": 10, "WIS": 10, "CHA": 10}',
      specialAttacks: "",
      elementType: "",
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
      };
      
      await apiRequest('POST', '/api/creatures', payload);
      
      toast({
        title: "Creature created",
        description: "Your new creature has been added to the bestiary."
      });
      
      // Refetch the creatures list
      queryClient.invalidateQueries({ queryKey: [`/api/worlds/${worldId}/creatures`] });
      
      // Call the callback if provided
      if (onCreatureAdded) {
        onCreatureAdded();
      }
      
      // Close the modal and reset form
      onClose();
      form.reset({
        name: "",
        worldId,
        regionId: null,
        imageUrl: "",
        description: "",
        creatureType: "",
        rarity: "common",
        challengeRating: "1",
        armorClass: 10,
        hitPoints: "",
        speed: "",
        abilities: '{"STR": 10, "DEX": 10, "CON": 10, "INT": 10, "WIS": 10, "CHA": 10}',
        specialAttacks: "",
        elementType: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create creature. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-primary">Add New Creature</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Creature Name</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="creatureType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Creature Type</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" placeholder="Beast, Dragon, Undead, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Rarity</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm"
                        {...field}
                      >
                        <option value="common">Common</option>
                        <option value="rare">Rare</option>
                        <option value="legendary">Legendary</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="elementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Element Type (optional)</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" placeholder="Fire, Water, Shadow, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="challengeRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Challenge Rating</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="armorClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Armor Class</FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-secondary" 
                        type="number" 
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
                name="hitPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Hit Points</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" placeholder="e.g. 45 (6d10 + 12)" {...field} />
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
                    <FormLabel className="font-cinzel">Region (optional)</FormLabel>
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
                name="speed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Speed</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" placeholder="e.g. 30 ft., fly 60 ft." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-cinzel">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="bg-secondary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="abilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-cinzel">Abilities (JSON or KEY:VALUE format)</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="bg-secondary" 
                      placeholder={'{"STR": 10, "DEX": 10, "CON": 10, "INT": 10, "WIS": 10, "CHA": 10}'}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-foreground/70">
                    Enter as JSON object or comma-separated key:value pairs (e.g. STR:16, DEX:14)
                  </p>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialAttacks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-cinzel">Special Attacks (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="bg-secondary" 
                      placeholder="Fire Breath (Recharge 5-6): 90-foot cone, 24d6 fire damage"
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
                Create Creature
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
