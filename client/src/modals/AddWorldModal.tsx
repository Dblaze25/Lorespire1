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
import { insertWorldSchema } from '@shared/schema';

interface AddWorldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorldAdded?: () => void;
}

export function AddWorldModal({ isOpen, onClose, onWorldAdded }: AddWorldModalProps) {
  const { toast } = useToast();
  
  // Using the Zod schema from schema.ts
  const formSchema = insertWorldSchema.extend({
    name: z.string().min(2, "World name must have at least 2 characters"),
    description: z.string().min(10, "Please provide a more detailed description"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      userId: 1, // Default user ID
      imageUrl: "",
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await apiRequest('POST', '/api/worlds', data);
      
      toast({
        title: "World created",
        description: "Your new world has been created successfully."
      });
      
      // Refetch the worlds list
      queryClient.invalidateQueries({ queryKey: ['/api/worlds'] });
      
      // Call the callback if provided
      if (onWorldAdded) {
        onWorldAdded();
      }
      
      // Close the modal and reset form
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create world. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-primary">Create New World</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-cinzel">World Name</FormLabel>
                  <FormControl>
                    <Input className="bg-secondary" placeholder="e.g. The Forgotten Realms" {...field} />
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
                      placeholder="Describe your world's history, key features, and unique elements..." 
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
                  <FormLabel className="font-cinzel">Map Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      className="bg-secondary" 
                      placeholder="https://example.com/my-world-map.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <input type="hidden" {...form.register("userId", { valueAsNumber: true })} />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-accent text-primary hover:bg-accent/90">
                Create World
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
