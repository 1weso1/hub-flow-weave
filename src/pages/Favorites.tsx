import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart,
  Search,
  Eye,
  Download,
  Trash2,
  Package,
  Calendar,
  Zap,
  Shield
} from 'lucide-react';

interface FavoriteWorkflow {
  id: string;
  created_at: string;
  workflows: {
    id: string;
    name: string;
    category: string;
    complexity: string;
    node_count: number;
    has_credentials: boolean;
    size_bytes: number;
    updated_at: string;
    slug: string;
  };
}

export default function Favorites() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [favorites, setFavorites] = useState<FavoriteWorkflow[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workflow_favorites')
        .select(`
          id,
          created_at,
          workflows:workflow_id (
            id,
            name,
            category,
            complexity,
            node_count,
            has_credentials,
            size_bytes,
            updated_at,
            slug
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch favorites",
        variant: "destructive",
      });
    } finally {
      setLoadingFavorites(false);
    }
  };

  const removeFavorite = async (favoriteId: string, workflowName: string) => {
    try {
      const { error } = await supabase
        .from('workflow_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      
      toast({
        title: "Removed from favorites",
        description: `${workflowName} removed from your favorites`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const downloadWorkflow = async (workflow: FavoriteWorkflow['workflows']) => {
    if (!user) return;

    try {
      // Record the download
      await supabase
        .from('workflow_downloads')
        .insert({
          user_id: user.id,
          workflow_id: workflow.id
        });

      // Mock workflow JSON structure
      const workflowData = {
        name: workflow.name,
        category: workflow.category,
        complexity: workflow.complexity,
        node_count: workflow.node_count,
        has_credentials: workflow.has_credentials,
        // Mock workflow structure
        nodes: Array.from({ length: workflow.node_count }, (_, i) => ({
          id: `node-${i + 1}`,
          type: 'default',
          position: { x: Math.random() * 400, y: Math.random() * 300 },
          data: { label: `Node ${i + 1}` }
        })),
        connections: []
      };

      const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflow.slug}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `Downloaded ${workflow.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: "Failed to download workflow",
        variant: "destructive",
      });
    }
  };

  // Filter favorites based on search term
  const filteredFavorites = favorites.filter(favorite =>
    favorite.workflows?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.workflows?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading || loadingFavorites) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center space-x-3">
          <Heart className="w-8 h-8 text-red-500" />
          <span>My Favorites</span>
          <span className="text-lg font-normal text-muted-foreground">
            {filteredFavorites.length} workflows
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Your saved workflows for quick access. Download, preview, or remove workflows from your favorites list.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search favorites..."
            className="pl-10 glass-card border-border/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((favorite) => (
            <Card key={favorite.id} className="glass-card border-border/20 hover:border-primary/20 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                      {favorite.workflows?.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {favorite.workflows?.category}
                      </Badge>
                      <Badge className={`text-xs ${getComplexityColor(favorite.workflows?.complexity)}`}>
                        {favorite.workflows?.complexity}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(favorite.id, favorite.workflows?.name || 'Workflow')}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Added {new Date(favorite.created_at).toLocaleDateString()}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Workflow Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>{favorite.workflows?.node_count} nodes</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Shield className={`w-4 h-4 ${favorite.workflows?.has_credentials ? 'text-yellow-400' : 'text-green-400'}`} />
                    <span>{favorite.workflows?.has_credentials ? 'Credentials' : 'No Auth'}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(favorite.workflows?.updated_at || '').toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    <span>{((favorite.workflows?.size_bytes || 0) / 1024).toFixed(1)}KB</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Link to={`/workflows/${favorite.workflows?.slug}`} className="flex-1">
                    <Button variant="glass" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </Link>
                  
                  <Button
                    variant="neon"
                    size="sm"
                    onClick={() => favorite.workflows && downloadWorkflow(favorite.workflows)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-3">
            {searchTerm ? 'No matching favorites' : 'No favorites yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm 
              ? `No favorites match "${searchTerm}". Try a different search term.`
              : 'Start building your collection by adding workflows to your favorites.'
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
            <Link to="/workflows">
              <Button variant="neon">
                <Search className="w-4 h-4 mr-2" />
                Browse Workflows
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}