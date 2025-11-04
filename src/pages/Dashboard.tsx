import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenLine, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BlogCard } from "@/components/BlogCard";

interface Blog {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
      
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load blogs");
        console.error(error);
      } else {
        setBlogs(data || []);
      }
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel("blogs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blogs",
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-[var(--shadow-card)]">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <PenLine className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">BlogSpace</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/create")} className="bg-gradient-to-r from-primary to-accent">
              <PenLine className="mr-2 h-4 w-4" />
              Write
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Discover Stories</h2>
          <p className="text-muted-foreground">Read, write, and share your thoughts</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search blogs by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No blogs found</CardTitle>
              <CardDescription>
                {searchQuery
                  ? "Try a different search term"
                  : "Be the first to write a blog!"}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                currentUserId={currentUserId}
                onDelete={() => {
                  setBlogs(blogs.filter((b) => b.id !== blog.id));
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
