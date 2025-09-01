import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User,
  Download,
  Heart,
  FolderOpen,
  Calendar,
  TrendingUp,
  Package,
  Star,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  downloads: number;
  favorites: number;
  collections: number;
  recentDownloads: any[];
  recentFavorites: any[];
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<DashboardStats>({
    downloads: 0,
    favorites: 0,
    collections: 0,
    recentDownloads: [],
    recentFavorites: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchDashboardStats = async () => {
    if (!user) return;
    
    try {
      // Fetch download count
      const { count: downloadsCount } = await supabase
        .from('workflow_downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch favorites count
      const { count: favoritesCount } = await supabase
        .from('workflow_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch collections count
      const { count: collectionsCount } = await supabase
        .from('workflow_collections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch recent downloads
      const { data: recentDownloads } = await supabase
        .from('workflow_downloads')
        .select(`
          downloaded_at,
          workflows:workflow_id (
            name,
            category,
            slug,
            complexity
          )
        `)
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false })
        .limit(5);

      // Fetch recent favorites
      const { data: recentFavorites } = await supabase
        .from('workflow_favorites')
        .select(`
          created_at,
          workflows:workflow_id (
            name,
            category,
            slug,
            complexity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        downloads: downloadsCount || 0,
        favorites: favoritesCount || 0,
        collections: collectionsCount || 0,
        recentDownloads: recentDownloads || [],
        recentFavorites: recentFavorites || []
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here's your automation hub activity and statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card border-border/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.downloads}</div>
            <p className="text-xs text-muted-foreground">
              Workflow JSON files downloaded
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.favorites}</div>
            <p className="text-xs text-muted-foreground">
              Workflows saved to favorites
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.collections}</div>
            <p className="text-xs text-muted-foreground">
              Personal workflow collections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Downloads */}
        <Card className="glass-card border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Recent Downloads</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentDownloads.length > 0 ? (
              <div className="space-y-4">
                {stats.recentDownloads.map((download, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{download.workflows?.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {download.workflows?.category}
                          </Badge>
                          <Badge className={`text-xs ${getComplexityColor(download.workflows?.complexity)}`}>
                            {download.workflows?.complexity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(download.downloaded_at).toLocaleDateString()}
                      </p>
                      <Link to={`/workflows/${download.workflows?.slug}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No downloads yet</p>
                <Link to="/workflows">
                  <Button variant="neon" size="sm" className="mt-3">
                    Browse Workflows
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Favorites */}
        <Card className="glass-card border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Recent Favorites</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentFavorites.length > 0 ? (
              <div className="space-y-4">
                {stats.recentFavorites.map((favorite, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{favorite.workflows?.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {favorite.workflows?.category}
                          </Badge>
                          <Badge className={`text-xs ${getComplexityColor(favorite.workflows?.complexity)}`}>
                            {favorite.workflows?.complexity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(favorite.created_at).toLocaleDateString()}
                      </p>
                      <Link to={`/workflows/${favorite.workflows?.slug}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No favorites yet</p>
                <Link to="/workflows">
                  <Button variant="neon" size="sm" className="mt-3">
                    Discover Workflows
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card border-border/20 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/workflows" className="block">
              <Button variant="glass" className="w-full h-20 flex-col">
                <Package className="w-6 h-6 mb-2" />
                <span>Browse Workflows</span>
              </Button>
            </Link>
            
            <Link to="/favorites" className="block">
              <Button variant="glass" className="w-full h-20 flex-col">
                <Heart className="w-6 h-6 mb-2" />
                <span>My Favorites</span>
              </Button>
            </Link>
            
            <Link to="/collections" className="block">
              <Button variant="glass" className="w-full h-20 flex-col">
                <FolderOpen className="w-6 h-6 mb-2" />
                <span>Collections</span>
              </Button>
            </Link>
            
            <Button variant="glass" className="w-full h-20 flex-col" disabled>
              <Calendar className="w-6 h-6 mb-2" />
              <span>Activity (Soon)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}