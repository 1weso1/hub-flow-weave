import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkflowPreview } from '@/components/WorkflowPreview';
import { 
  ArrowLeft,
  Download,
  Heart,
  Share,
  Calendar,
  Package,
  Users,
  Zap,
  Shield,
  Info
} from 'lucide-react';

interface WorkflowType {
  id: string;
  name: string;
  category: string;
  complexity: string;
  node_count: number;
  has_credentials: boolean;
  size_bytes: number;
  updated_at: string;
  created_at: string;
  slug: string;
}

export default function WorkflowDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workflow, setWorkflow] = useState<WorkflowType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchWorkflow();
    }
  }, [slug]);

  useEffect(() => {
    if (workflow && user) {
      checkFavorite();
      fetchDownloadCount();
    }
  }, [workflow, user]);

  const fetchWorkflow = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      setWorkflow(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Workflow not found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user || !workflow) return;
    
    try {
      const { data, error } = await supabase
        .from('workflow_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('workflow_id', workflow.id)
        .single();
        
      setIsFavorite(!!data && !error);
    } catch (error) {
      // Not a favorite
      setIsFavorite(false);
    }
  };

  const fetchDownloadCount = async () => {
    if (!workflow) return;
    
    try {
      const { count, error } = await supabase
        .from('workflow_downloads')
        .select('*', { count: 'exact', head: true })
        .eq('workflow_id', workflow.id);
        
      if (!error) {
        setDownloadCount(count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch download count:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !workflow) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('workflow_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('workflow_id', workflow.id);
          
        if (error) throw error;
        setIsFavorite(false);
        
        toast({
          title: "Removed from favorites",
          description: "Workflow removed from your favorites",
        });
      } else {
        const { error } = await supabase
          .from('workflow_favorites')
          .insert({
            user_id: user.id,
            workflow_id: workflow.id
          });
          
        if (error) throw error;
        setIsFavorite(true);
        
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

  const downloadWorkflow = async () => {
    if (!user || !workflow) {
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

      // Mock workflow JSON structure
      const workflowData = {
        name: workflow.name,
        category: workflow.category,
        complexity: workflow.complexity,
        node_count: workflow.node_count,
        has_credentials: workflow.has_credentials,
        created_at: workflow.created_at,
        updated_at: workflow.updated_at,
        // Mock workflow structure - in reality this would come from the raw_url
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

      // Update download count
      setDownloadCount(prev => prev + 1);

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

  const shareWorkflow = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Workflow link copied to clipboard",
    });
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workflow not found</h1>
          <p className="text-muted-foreground mb-6">The workflow you're looking for doesn't exist.</p>
          <Link to="/workflows">
            <Button variant="neon">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Workflows
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/workflows" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workflows
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-3">{workflow.name}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-sm">
                {workflow.category}
              </Badge>
              <Badge className={`text-sm ${getComplexityColor(workflow.complexity)}`}>
                {workflow.complexity}
              </Badge>
              
              {workflow.has_credentials && (
                <Badge variant="outline" className="text-sm border-yellow-500/20 text-yellow-400">
                  <Shield className="w-3 h-3 mr-1" />
                  Requires Credentials
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>{workflow.node_count} nodes</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{downloadCount} downloads</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Updated {new Date(workflow.updated_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>{(workflow.size_bytes / 1024).toFixed(1)}KB</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="glass"
              onClick={shareWorkflow}
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            {user && (
              <Button
                variant="glass"
                onClick={toggleFavorite}
                className={isFavorite ? 'text-red-500' : ''}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
            )}
            
            <Button
              variant="neon"
              onClick={downloadWorkflow}
              disabled={!user}
            >
              <Download className="w-4 h-4 mr-2" />
              {user ? 'Download JSON' : 'Sign In to Download'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          <Card className="glass-card border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Workflow Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowPreview workflow={workflow} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>Workflow Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">
                    A {workflow.complexity.toLowerCase()} automation workflow in the {workflow.category} category 
                    with {workflow.node_count} nodes. 
                    {workflow.has_credentials ? ' Requires external service credentials.' : ' No external credentials required.'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Use Cases</h4>
                  <p className="text-muted-foreground">
                    Perfect for automating {workflow.category.toLowerCase()} processes and workflows. 
                    Suitable for {workflow.complexity === 'Easy' ? 'beginners' : workflow.complexity === 'Medium' ? 'intermediate users' : 'advanced users'}.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/20">
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Complexity:</span>
                    <p className="font-medium">{workflow.complexity}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Node Count:</span>
                    <p className="font-medium">{workflow.node_count}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">File Size:</span>
                    <p className="font-medium">{(workflow.size_bytes / 1024).toFixed(1)}KB</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{workflow.category}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Downloads:</span>
                    <p className="font-medium">{downloadCount}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Authentication:</span>
                    <p className="font-medium">{workflow.has_credentials ? 'Required' : 'Not Required'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card className="glass-card border-border/20">
            <CardHeader>
              <CardTitle>Workflow Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Workflow ID:</span>
                    <p className="font-mono text-sm">{workflow.id}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Slug:</span>
                    <p className="font-mono text-sm">{workflow.slug}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Created Date:</span>
                    <p className="text-sm">{new Date(workflow.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Last Updated:</span>
                    <p className="text-sm">{new Date(workflow.updated_at).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">File Size (bytes):</span>
                    <p className="font-mono text-sm">{workflow.size_bytes.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Total Downloads:</span>
                    <p className="text-sm">{downloadCount}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}