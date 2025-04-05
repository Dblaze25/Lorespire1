import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { World, LoreEntry } from '@shared/schema';
import WorldSelector from '@/components/WorldSelector';
import { Button } from '@/components/ui/button';
import { Plus, Search, BookOpen, Trash2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import FantasyBorder from '@/components/ui/fantasy-border';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export default function Lore() {
  const [currentWorldId, setCurrentWorldId] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddLoreModalOpen, setIsAddLoreModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLoreId, setEditingLoreId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: worlds } = useQuery({
    queryKey: ['/api/worlds'],
  });

  const { data: loreEntries, isLoading } = useQuery({
    queryKey: [`/api/worlds/${currentWorldId}/lore`],
    enabled: !!currentWorldId,
  });

  // Set initial world ID once data is loaded
  useEffect(() => {
    if (worlds && worlds.length > 0 && !currentWorldId) {
      setCurrentWorldId(worlds[0].id);
    }
  }, [worlds, currentWorldId]);

  const handleWorldChange = (worldId: number) => {
    setCurrentWorldId(worldId);
  };

  // Extract unique categories from lore entries
  const categories = loreEntries 
    ? ['all', ...new Set(loreEntries.map((entry: LoreEntry) => entry.category))]
    : ['all'];

  const filteredLoreEntries = loreEntries?.filter((entry: LoreEntry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Form schema for adding/editing lore
  const loreFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    category: z.string().min(1, "Category is required"),
    imageUrl: z.string().optional(),
    worldId: z.number()
  });

  const form = useForm<z.infer<typeof loreFormSchema>>({
    resolver: zodResolver(loreFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "Historical Events",
      imageUrl: "",
      worldId: currentWorldId
    },
  });

  // Handle edit lore entry
  const handleEditLore = (loreEntry: LoreEntry) => {
    setEditingLoreId(loreEntry.id);
    form.reset({
      title: loreEntry.title,
      content: loreEntry.content || "",
      category: loreEntry.category || "Historical Events",
      imageUrl: loreEntry.imageUrl || "",
      worldId: loreEntry.worldId
    });
    setIsEditMode(true);
    setIsAddLoreModalOpen(true);
  };

  // Handle delete lore entry
  const handleDeleteLore = async (loreId: number) => {
    try {
      await apiRequest('DELETE', `/api/lore/${loreId}`);
      queryClient.invalidateQueries({ queryKey: [`/api/worlds/${currentWorldId}/lore`] });
      toast({
        title: "Lore entry deleted",
        description: "The lore entry has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lore entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof loreFormSchema>) => {
    try {
      if (isEditMode && editingLoreId) {
        await apiRequest('PUT', `/api/lore/${editingLoreId}`, data);
        toast({
          title: "Lore updated",
          description: "Your lore entry has been updated successfully."
        });
      } else {
        await apiRequest('POST', `/api/lore`, data);
        toast({
          title: "Lore created",
          description: "Your new lore entry has been created successfully."
        });
      }
      queryClient.invalidateQueries({ queryKey: [`/api/worlds/${currentWorldId}/lore`] });
      setIsAddLoreModalOpen(false);
      form.reset();
      setIsEditMode(false);
      setEditingLoreId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lore entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Reset form when opening modal for new entry
  const handleAddNewLore = () => {
    form.reset({
      title: "",
      content: "",
      category: "Historical Events",
      imageUrl: "",
      worldId: currentWorldId
    });
    setIsEditMode(false);
    setEditingLoreId(null);
    setIsAddLoreModalOpen(true);
  };

  return (
    <>
      <WorldSelector currentWorldId={currentWorldId} onWorldChange={handleWorldChange} />

      <FantasyBorder className="bg-card p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-3xl font-cinzel font-bold text-primary">World Lore</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input 
                className="pl-8 bg-secondary border-accent/30"
                placeholder="Search lore..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 bg-secondary border border-accent/30 rounded-sm text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <Button 
                className="bg-accent text-primary hover:bg-accent/90 flex items-center whitespace-nowrap"
                onClick={handleAddNewLore}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Lore
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">Loading lore entries...</div>
        ) : filteredLoreEntries?.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <p className="mb-4 text-foreground/70">No lore entries found. Start writing your world's history!</p>
            <Button 
              className="bg-accent text-primary hover:bg-accent/90"
              onClick={handleAddNewLore}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Lore Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredLoreEntries?.map((loreEntry: LoreEntry) => (
              <div key={loreEntry.id} className="bg-secondary p-6 rounded-sm fantasy-border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-cinzel font-bold text-primary">{loreEntry.title}</h3>
                      <Badge className="ml-3 bg-primary/20 text-primary">{loreEntry.category}</Badge>
                    </div>
                    
                    <div className="prose prose-sm max-w-none mt-4">
                      {loreEntry.imageUrl && (
                        <div className="float-right ml-4 mb-4 w-1/4">
                          <img 
                            src={loreEntry.imageUrl}
                            alt={loreEntry.title}
                            className="rounded-sm"
                          />
                        </div>
                      )}
                      <p className="whitespace-pre-line">{loreEntry.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditLore(loreEntry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive border-destructive hover:bg-destructive hover:text-secondary"
                      onClick={() => handleDeleteLore(loreEntry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </FantasyBorder>

      {/* Add/Edit Lore Modal */}
      <Dialog open={isAddLoreModalOpen} onOpenChange={setIsAddLoreModalOpen}>
        <DialogContent className="bg-card max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-cinzel text-primary">
              {isEditMode ? 'Edit Lore Entry' : 'Create New Lore Entry'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Title</FormLabel>
                    <FormControl>
                      <Input className="bg-secondary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-cinzel">Category</FormLabel>
                      <FormControl>
                        <select className="w-full h-10 px-3 py-2 bg-secondary border border-accent/30 rounded-sm text-sm" {...field}>
                          <option value="Historical Events">Historical Events</option>
                          <option value="Factions & Organizations">Factions & Organizations</option>
                          <option value="Myths & Legends">Myths & Legends</option>
                          <option value="Religion & Deities">Religion & Deities</option>
                          <option value="Notable Figures">Notable Figures</option>
                          <option value="Magic & Artifacts">Magic & Artifacts</option>
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
                      <FormLabel className="font-cinzel">Image URL (optional)</FormLabel>
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
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-cinzel">Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="bg-secondary min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <input type="hidden" {...form.register("worldId", { valueAsNumber: true })} />
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsAddLoreModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent text-primary hover:bg-accent/90">
                  {isEditMode ? 'Update Lore' : 'Create Lore'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
