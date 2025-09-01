import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  FolderOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Package,
  Calendar,
  Lock,
  Globe
} from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  workflow_collection_items?: {
    workflows: {
      name: string;
      category: string;
      complexity: string;
    };
  }[];
}

export default function Collections() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create collection form
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    is_public: false
  });

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user]);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchCollections = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workflow_collections')
        .select(`
          id,
          name,
          description,
          is_public,
          created_at,
          updated_at,
          workflow_collection_items!inner (
            workflows!inner (
              name,
              category,
              complexity
            )
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch collections",
        variant: "destructive",
      });
    } finally {
      setLoadingCollections(false);
    }
  };

  const createCollection = async () => {
    if (!user || !newCollection.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('workflow_collections')
        .insert({
          user_id: user.id,
          name: newCollection.name.trim(),
          description: newCollection.description.trim() || null,
          is_public: newCollection.is_public
        })
        .select()
        .single();

      if (error) throw error;

      setCollections(prev => [data, ...prev]);
      setNewCollection({ name: '', description: '', is_public: false });
      setIsCreateModalOpen(false);
      
      toast({
        title: "Collection created",
        description: `${data.name} has been created successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    }
  };

  const deleteCollection = async (collectionId: string, collectionName: string) => {
    try {
      const { error } = await supabase
        .from('workflow_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      setCollections(prev => prev.filter(col => col.id !== collectionId));
      
      toast({
        title: "Collection deleted",
        description: `${collectionName} has been deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      });
    }
  };

  // Filter collections based on search term
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingCollections) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
              <FolderOpen className="w-8 h-8 text-primary" />
              <span>My Collections</span>
              <span className="text-lg font-normal text-muted-foreground">
                {filteredCollections.length} collections
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Organize workflows into collections for better management. Create public collections to share with the community.
            </p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="neon">
                <Plus className="w-4 h-4 mr-2" />
                Create Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/20">
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name *</label>
                  <Input
                    placeholder="Enter collection name"
                    className="glass-card border-border/20"
                    value={newCollection.name}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe your collection..."
                    className="glass-card border-border/20"
                    rows={3}
                    value={newCollection.description}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={newCollection.is_public}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <label htmlFor="is_public" className="text-sm">
                    Make this collection public
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    variant="neon" 
                    onClick={createCollection}
                    disabled={!newCollection.name.trim()}
                  >
                    Create Collection
                  </Button>
                  <Button 
                    variant="glass" 
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            className="pl-10 glass-card border-border/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Collections Grid */}
      {filteredCollections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <Card key={collection.id} className="glass-card border-border/20 hover:border-primary/20 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors flex items-center space-x-2">
                      <span className="truncate">{collection.name}</span>
                      {collection.is_public ? (
                        <Globe className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </CardTitle>
                    
                    {collection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {collection.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4" />
                        <span>{collection.workflow_collection_items?.length || 0} workflows</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(collection.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCollection(collection.id, collection.name)}
                    className="text-red-500 hover:text-red-400 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Collection Preview */}
                {collection.workflow_collection_items && collection.workflow_collection_items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Workflows Preview:</h4>
                    <div className="space-y-1">
                      {collection.workflow_collection_items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="truncate">{item.workflows?.name}</span>
                          <Badge variant="secondary" className="text-xs ml-2">
                            {item.workflows?.complexity}
                          </Badge>
                        </div>
                      ))}
                      {collection.workflow_collection_items.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{collection.workflow_collection_items.length - 3} more workflows
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="glass" size="sm" className="flex-1" disabled>
                    <Eye className="w-4 h-4 mr-2" />
                    View (Soon)
                  </Button>
                  
                  <Button variant="glass" size="sm" className="flex-1" disabled>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit (Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-3">
            {searchTerm ? 'No matching collections' : 'No collections yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm 
              ? `No collections match "${searchTerm}". Try a different search term.`
              : 'Create your first collection to organize workflows by theme, project, or use case.'
            }
          </p>
          <div className="space-x-4">
            {searchTerm ? (
              <Button 
                variant="glass" 
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            ) : null}
            <Button 
              variant="neon"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}