import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Search,
  Filter,
  Download,
  Eye,
  Heart,
  Plus,
  Workflow,
  Clock,
  Zap,
  Shield,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkflowType {
  id: string;
  name: string;
  category: string;
  complexity: string;
  node_count: number;
  has_credentials: boolean;
  size_bytes: number;
  updated_at: string;
  slug: string;
}

export default function Workflows() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');
  const [credentialsFilter, setCredentialsFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch workflows
  useEffect(() => {
    fetchWorkflows();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchWorkflows = async () => {
    try {
      let query = supabase
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      setWorkflows(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workflow_favorites')
        .select('workflow_id')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const favoriteIds = new Set(data?.map(f => f.workflow_id) || []);
      setFavorites(favoriteIds);
    } catch (error: any) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const toggleFavorite = async (workflowId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      if (favorites.has(workflowId)) {
        // Remove favorite
        const { error } = await supabase
          .from('workflow_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('workflow_id', workflowId);
          
        if (error) throw error;
        
        const newFavorites = new Set(favorites);
        newFavorites.delete(workflowId);
        setFavorites(newFavorites);
        
        toast({
          title: "Removed from favorites",
          description: "Workflow removed from your favorites",
        });
      } else {
        // Add favorite
        const { error } = await supabase
          .from('workflow_favorites')
          .insert({
            user_id: user.id,
            workflow_id: workflowId
          });
          
        if (error) throw error;
        
        const newFavorites = new Set(favorites);
        newFavorites.add(workflowId);
        setFavorites(newFavorites);
        
        toast({
          title: "Added to favorites",
          description: "Workflow added to your favorites",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const downloadWorkflow = async (workflow: WorkflowType) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to download workflows",
        variant: "destructive",
      });
      return;
    }

    try {
      // Record the download
      await supabase
        .from('workflow_downloads')
        .insert({
          user_id: user.id,
          workflow_id: workflow.id
        });

      // In a real implementation, you would fetch the actual workflow JSON
      // For now, we'll create a mock download
      const workflowData = {
        name: workflow.name,
        category: workflow.category,
        complexity: workflow.complexity,
        node_count: workflow.node_count,
        // Mock workflow structure
        nodes: [],
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

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || workflow.category === categoryFilter;
    const matchesComplexity = complexityFilter === 'all' || workflow.complexity === complexityFilter;
    const matchesCredentials = credentialsFilter === 'all' || 
                              (credentialsFilter === 'yes' && workflow.has_credentials) ||
                              (credentialsFilter === 'no' && !workflow.has_credentials);

    return matchesSearch && matchesCategory && matchesComplexity && matchesCredentials;
  });

  // Get unique categories and complexities for filters
  const categories = [...new Set(workflows.map(w => w.category))];
  const complexities = [...new Set(workflows.map(w => w.complexity))];

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Workflow Library
          <span className="ml-3 text-lg font-normal text-muted-foreground">
            {filteredWorkflows.length} workflows
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Discover and download automation workflows from our comprehensive library. 
          Preview workflows, add to favorites, and download JSON files for your projects.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 mb-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                className="pl-10 glass-card border-border/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="glass-card border-border/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Complexity Filter */}
          <Select value={complexityFilter} onValueChange={setComplexityFilter}>
            <SelectTrigger className="glass-card border-border/20">
              <SelectValue placeholder="Complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {complexities.map(complexity => (
                <SelectItem key={complexity} value={complexity}>{complexity}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Credentials Filter */}
          <Select value={credentialsFilter} onValueChange={setCredentialsFilter}>
            <SelectTrigger className="glass-card border-border/20">
              <SelectValue placeholder="Credentials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Requires Credentials</SelectItem>
              <SelectItem value="no">No Credentials</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="glass-card border-border/20">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">Recently Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="complexity">Complexity</SelectItem>
              <SelectItem value="node_count">Node Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="glass-card border-border/20 hover:border-primary/20 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                    {workflow.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {workflow.category}
                    </Badge>
                    <Badge className={`text-xs ${getComplexityColor(workflow.complexity)}`}>
                      {workflow.complexity}
                    </Badge>
                  </div>
                </div>
                
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(workflow.id)}
                    className={`ml-2 ${favorites.has(workflow.id) ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(workflow.id) ? 'fill-current' : ''}`} />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Workflow Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Workflow className="w-4 h-4" />
                  <span>{workflow.node_count} nodes</span>
                </div>
                
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Shield className={`w-4 h-4 ${workflow.has_credentials ? 'text-yellow-400' : 'text-green-400'}`} />
                  <span>{workflow.has_credentials ? 'Credentials' : 'No Auth'}</span>
                </div>

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(workflow.updated_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Zap className="w-4 h-4" />
                  <span>{(workflow.size_bytes / 1024).toFixed(1)}KB</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Link to={`/workflows/${workflow.slug}`} className="flex-1">
                  <Button variant="glass" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </Link>
                
                <Button
                  variant="neon"
                  size="sm"
                  onClick={() => downloadWorkflow(workflow)}
                  disabled={!user}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {user ? 'Download' : 'Sign In'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button 
            variant="glass" 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setComplexityFilter('all');
              setCredentialsFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}