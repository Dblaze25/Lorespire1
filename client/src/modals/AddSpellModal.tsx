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
import { insertSpellSchema, type Character } from '@shared/schema';

interface AddSpellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpellAdded?: () => void;
  worldId: number;
}

export function AddSpellModal({ isOpen, onClose, onSpellAdded, worldId }: AddSpellModalProps) {
  const { toast } = useToast();
  
  // Fetch characters for this world
  const { data: characters } = useQuery<Character[]>({
    queryKey: [`/api/worlds/${worldId}/characters`],
    enabled: !!worldId && isOpen,
  });
  
  // Using the Zod schema from schema.ts
  const formSchema = insertSpellSchema.extend({
    name: z.string().min(2, "Spell name must have at least 2 characters"),
    level: z.string().transform(val => parseInt(val)),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      worldId,
      level: "1",
      school: "Evocation",
      castingTime: "1 action",
      range: "60 feet",
      components: "V, S",
      duration: "Instantaneous",
      description: "",
      imageUrl: "",
      creatorCharacterId: null,
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
        level: Number(data.level),
      };
      
      await apiRequest('POST', '/api/spells', payload);
      
      toast({
        title: "Spell created",
        description: "Your new spell has been added to the spellbook."
      });
      
      // Refetch the spells list
      queryClient.invalidateQueries({ queryKey: [`/api/worlds/${worldId}/spells`] });
      
      // Call the callback if provided
      if (onSpellAdded) {
        onSpellAdded();
      }
      
      // Close the modal and reset form
      onClose();
      form.reset({
        name: "",
        worldId,
        level: "1",
        school: "Evocation",
        castingTime: "1 action",
        range: "60 feet",
        components: "V, S",
        duration: "Instantaneous",
        description: "",
        imageUrl: "",
        creatorCharacterId: null,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create spell. Please try again.",
        variant: "destructive"
      });
    }
  };

  const spellSchools = [
    "Abjuration", "Conjuration", "Divination", "Enchantment", 
    "Evocation", "Illusion", "Necromancy", "Transmutation"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-primary">Add New Spell</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Spell Name</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-cinzel">Level</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm"
                          {...field}
                        >
                          <option value="0">Cantrip</option>
                          <option value="1">1st</option>
                          <option value="2">2nd</option>
                          <option value="3">3rd</option>
                          <option value="4">4th</option>
                          <option value="5">5th</option>
                          <option value="6">6th</option>
                          <option value="7">7th</option>
                          <option value="8">8th</option>
                          <option value="9">9th</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-cinzel">School</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm"
                          {...field}
                        >
                          {spellSchools.map(school => (
                            <option key={school} value={school}>{school}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="castingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Casting Time</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Range</FormLabel>
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
                name="components"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Components</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Duration</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" {...field} />
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
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="creatorCharacterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Creator (optional)</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value, 10) : null);
                        }}
                      >
                        <option value="">Select character (optional)</option>
                        {characters && characters.map((character) => (
                          <option key={character.id} value={character.id}>
                            {character.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <input type="hidden" {...form.register("worldId", { valueAsNumber: true })} />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-accent text-primary hover:bg-accent/90">
                Create Spell
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
