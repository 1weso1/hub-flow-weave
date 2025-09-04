import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import N8nPreview from "@/components/N8nPreview";

// Remove old n8n-demo declarations as we're using React Flow now

interface Workflow {
  id: string;
  name: string;
  category: string;
  node_count: number;
  has_credentials: boolean;
  raw_url: string;
  complexity: string;
}

interface WorkflowData {
  name: string;
  nodes: any[];
  connections: any;
  active?: boolean;
  settings?: any;
  staticData?: any;
  pinData?: any;
  versionId?: string;
  meta?: any;
  tags?: any[];
}

const WorkflowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Remove old n8n-demo component loading logic

  useEffect(() => {
    if (!id) return;
    
    const fetchWorkflow = async () => {
      try {
        console.log('Fetching workflow with ID:', id);
        
        const response = await fetch(
          `https://ugjeubqwmgnqvohmrkyv.supabase.co/rest/v1/workflows?select=id,name,category,node_count,has_credentials,raw_url,complexity&id=eq.${id}`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamV1YnF3bWducXZvaG1ya3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzc5NDEsImV4cCI6MjA3MjA1Mzk0MX0.esXYyxM-eQbKBXhG2NKrzLsdiveNo4lBsK_rlv_ebjo`
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch workflow: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Workflow metadata response:', data);
        
        if (data.length === 0) {
          console.error('Workflow not found');
          toast.error("Workflow not found");
          return;
        }

        const workflowInfo = data[0];
        console.log('Workflow info:', workflowInfo);
        setWorkflow(workflowInfo);
        
        // Fetch the actual workflow JSON data
        if (workflowInfo.raw_url) {
          console.log('Starting to fetch workflow JSON from:', workflowInfo.raw_url);
          setDataLoading(true);
          setPreviewError(null);
          
          try {
            console.log('Making fetch request...');
            const workflowResponse = await fetch(workflowInfo.raw_url, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });
            console.log('Workflow JSON response received:', {
              status: workflowResponse.status,
              statusText: workflowResponse.statusText,
              ok: workflowResponse.ok,
              headers: Object.fromEntries(workflowResponse.headers.entries())
            });
            
            if (workflowResponse.ok) {
              console.log('Response OK, parsing JSON...');
              const workflowJson = await workflowResponse.json();
              console.log('Workflow JSON parsed successfully:', {
                hasNodes: !!workflowJson?.nodes,
                nodeCount: workflowJson?.nodes?.length,
                hasConnections: !!workflowJson?.connections,
                workflowName: workflowJson?.name
              });
              console.log('Full workflow data:', workflowJson);
              
              // Validate workflow structure
              if (!workflowJson || !workflowJson.nodes || !Array.isArray(workflowJson.nodes)) {
                console.error('Invalid workflow structure:', {
                  hasWorkflowJson: !!workflowJson,
                  hasNodes: !!workflowJson?.nodes,
                  nodesIsArray: Array.isArray(workflowJson?.nodes),
                  nodesValue: workflowJson?.nodes
                });
                throw new Error('Invalid workflow structure: missing or invalid nodes array');
              }
              
              console.log('Setting workflow data...');
              setWorkflowData(workflowJson);
              console.log('Workflow data set successfully');
            } else {
              console.error('Failed response:', {
                status: workflowResponse.status,
                statusText: workflowResponse.statusText,
                url: workflowInfo.raw_url
              });
              const errorText = await workflowResponse.text().catch(() => 'Could not read error response');
              console.error('Error response body:', errorText);
              throw new Error(`Failed to fetch workflow JSON: ${workflowResponse.status} ${workflowResponse.statusText}`);
            }
          } catch (error) {
            console.error('Comprehensive error details:', {
              error,
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
              url: workflowInfo.raw_url
            });
            setPreviewError(error instanceof Error ? error.message : 'Unknown error occurred');
            toast.error("Failed to load workflow preview: " + (error instanceof Error ? error.message : 'Unknown error'));
          } finally {
            console.log('Fetch operation completed, setting dataLoading to false');
            setDataLoading(false);
          }
        } else {
          console.warn('No raw_url provided for workflow');
          setPreviewError('No workflow data URL available');
        }
      } catch (error) {
        console.error('Error:', error);
        setPreviewError(error instanceof Error ? error.message : 'Failed to load workflow');
        toast.error("Failed to load workflow");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

  const getComplexityColor = (complexity: string, nodeCount: number) => {
    const enhancedComplexity = getEnhancedComplexity(nodeCount);
    if (enhancedComplexity === 'low') return "bg-green-500/20 text-green-400 border-green-500/30";
    if (enhancedComplexity === 'medium') return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getEnhancedComplexity = (nodeCount: number) => {
    if (nodeCount <= 5) return 'low';
    if (nodeCount <= 15) return 'medium';
    return 'high';
  };

  const getComplexityLabel = (nodeCount: number) => {
    const complexity = getEnhancedComplexity(nodeCount);
    return complexity.charAt(0).toUpperCase() + complexity.slice(1);
  };

  const getTriggerType = (workflow: Workflow) => {
    // Simple heuristic based on category or name
    if (workflow.name.toLowerCase().includes('webhook')) return "Webhook";
    if (workflow.name.toLowerCase().includes('manual')) return "Manual";
    if (workflow.name.toLowerCase().includes('schedule')) return "Scheduled";
    if (workflow.node_count === 1) return "Manual";
    if (workflow.node_count > 10) return "Complex";
    return "Simple";
  };

  const downloadWorkflow = () => {
    if (!workflowData || !workflow) return;
    
    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Workflow downloaded successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost" 
            onClick={() => navigate('/workflows')}
            className="mb-8 text-text-mid hover:text-text-high"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-high mb-4">Workflow Not Found</h1>
            <p className="text-text-mid">The workflow you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost" 
            onClick={() => navigate('/workflows')}
            className="text-text-mid hover:text-text-high"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadWorkflow}
              className="glass border-brand-primary/20 hover:border-brand-primary/40"
            >
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
          </div>
        </div>

        {/* Workflow Info */}
        <Card className="glass border-brand-primary/20 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-high mb-2">{workflow.name}</h1>
              <div className="flex items-center gap-3 text-sm text-text-mid">
                <span>ID: {workflow.id}</span>
                <span>•</span>
                <span>Category: {workflow.category}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={workflow.has_credentials ? "destructive" : "default"}>
                {workflow.has_credentials ? "Has Credentials" : "No Credentials"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text-mid">Nodes:</span>
              <Badge variant="outline" className="border-brand-accent/30">
                {workflow.node_count}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-text-mid">Type:</span>
              <Badge variant="outline" className="border-brand-accent/30">
                {getTriggerType(workflow)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-text-mid">Complexity:</span>
              <Badge className={getComplexityColor(workflow.complexity, workflow.node_count)}>
                {getComplexityLabel(workflow.node_count)}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Workflow Preview */}
        <Card className="glass border-brand-primary/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-high">Workflow Preview</h2>
            <div className="text-sm text-text-mid">
              {dataLoading ? 'Loading preview...' : 'Interactive • Zoom & Pan Enabled'}
            </div>
          </div>
          
          {workflowData ? (
            <N8nPreview workflow={workflowData} height="600px" />
          ) : dataLoading ? (
            <div className="bg-card rounded-lg border border-brand-primary/20 p-12 text-center" style={{ height: '600px' }}>
              <div className="animate-pulse">
                <div className="text-text-mid mb-4">Loading workflow preview...</div>
                <div className="h-64 bg-muted rounded mx-auto max-w-md"></div>
              </div>
            </div>
          ) : previewError ? (
            <div className="bg-card rounded-lg border border-brand-primary/20 p-12 text-center" style={{ height: '600px' }}>
              <div>
                <p className="text-red-400 mb-4">
                  Failed to load workflow preview
                </p>
                <p className="text-sm text-text-mid mb-4">
                  Error: {previewError}
                </p>
                {workflow?.raw_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(workflow.raw_url, '_blank')}
                    className="glass border-brand-primary/20 hover:border-brand-primary/40 mb-2 mr-2"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Raw JSON
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="glass border-brand-primary/20 hover:border-brand-primary/40"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-brand-primary/20 p-12 text-center" style={{ height: '600px' }}>
              <div>
                <p className="text-text-mid mb-4">
                  Preview not available for this workflow.
                </p>
                <p className="text-sm text-text-mid">
                  The workflow data could not be loaded from the source.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-sm text-text-mid mb-2">
              This is a read-only preview. Click and drag to pan, scroll to zoom.
            </p>
            <Button
              variant="link" 
              className="text-brand-accent hover:text-brand-primary"
              asChild
            >
              <Link to="/workflows">
                <ExternalLink className="mr-2 h-4 w-4" />
                Browse More Workflows
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowDetail;