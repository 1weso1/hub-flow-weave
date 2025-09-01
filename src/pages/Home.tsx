import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Workflow, 
  Zap, 
  Shield, 
  Download,
  Users,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Workflow,
      title: "2,000+ Workflows",
      description: "Extensive library of automation workflows for every need"
    },
    {
      icon: Zap,
      title: "Interactive Previews",
      description: "Visualize workflow logic with React Flow diagrams"
    },
    {
      icon: Shield,
      title: "Secure Downloads",
      description: "Protected JSON downloads for authenticated users"
    },
    {
      icon: Users,
      title: "Collections",
      description: "Create and manage your personal workflow collections"
    }
  ];

  const stats = [
    { label: "Workflows", value: "2,000+" },
    { label: "Categories", value: "20+" },
    { label: "Downloads", value: "50K+" },
    { label: "Users", value: "5K+" }
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-purple/10 animate-float" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <Badge 
              variant="outline" 
              className="mb-6 glass-card text-primary border-primary/20 animate-glow-pulse"
            >
              ✨ The Ultimate Automation Hub
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Automation
              </span>
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover, preview, and download thousands of automation workflows. 
              From simple tasks to complex integrations - find the perfect workflow 
              for your automation needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/workflows">
                <Button variant="hero" size="xl" className="animate-glow-pulse">
                  Browse Workflows
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="glass" size="xl">
                  Sign Up Free
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="glass-card p-6 text-center animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-2xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to discover and manage automation workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="glass-card border-border/20 hover:border-primary/20 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-gradient-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Streamline Your Automation Journey
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Access a comprehensive library of automation workflows, 
                from simple task automation to complex business processes.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  "Browse by category, complexity, or node count",
                  "Interactive workflow previews with zoom and pan",
                  "Secure JSON downloads for implementation",
                  "Personal collections and favorites",
                  "Community-driven workflow library"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link to="/workflows">
                <Button variant="neon" size="lg">
                  Explore Workflows
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="glass-card p-8 rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Workflow className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Email Automation</div>
                        <div className="text-sm text-muted-foreground">Marketing</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Easy</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
                        <Download className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Data Pipeline</div>
                        <div className="text-sm text-muted-foreground">Data Processing</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Advanced</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Social Media Bot</div>
                        <div className="text-sm text-muted-foreground">Social</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 rounded-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Automate?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of automation enthusiasts and start building 
              better workflows today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="xl">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/workflows">
                <Button variant="glass" size="xl">
                  Browse Workflows
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}