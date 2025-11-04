import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface BlogDetail {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string;
  };
}

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load blog");
        navigate("/");
        return;
      }

      setBlog(data);
      setLoading(false);
    };

    fetchBlog();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">{blog.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{blog.profiles.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(blog.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {blog.content}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
