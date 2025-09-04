import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Workflow, Zap, Download, Heart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="glass-card p-4 rounded-2xl">
                <Workflow className="w-16 h-16 text-primary" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Automation Hub
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover, download, and deploy powerful workflow automations. 
              Browse 2,000+ pre-built workflows to accelerate your projects.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/workflows">
                <Button size="lg" variant="neon" className="text-lg px-8 py-4">
                  Browse Workflows
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Preview</h3>
              <p className="text-muted-foreground">
                Interactive workflow previews with zoom, pan, and detailed node inspection.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">One-Click Download</h3>
              <p className="text-muted-foreground">
                Download workflows as JSON files ready for import into your automation platform.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personal Collections</h3>
              <p className="text-muted-foreground">
                Save favorites and organize workflows into custom collections for easy access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to automate your workflow?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of developers and automation enthusiasts building the future.
          </p>
          <Link to="/workflows">
            <Button size="lg" variant="neon">
              Start Browsing
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
