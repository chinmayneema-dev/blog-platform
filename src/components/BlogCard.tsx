import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    author_id: string;
    profiles: {
      full_name: string;
    };
  };
  currentUserId: string;
  onDelete: () => void;
}

export const BlogCard = ({ blog, currentUserId, onDelete }: BlogCardProps) => {
  const navigate = useNavigate();
  const isAuthor = blog.author_id === currentUserId;

  const handleDelete = async () => {
    const { error } = await supabase.from("blogs").delete().eq("id", blog.id);

    if (error) {
      toast.error("Failed to delete blog");
      console.error(error);
    } else {
      toast.success("Blog deleted successfully");
      onDelete();
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Card className="flex flex-col transition-all hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
        <CardDescription>
          By {blog.profiles.full_name} •{" "}
          {new Date(blog.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {truncateContent(blog.content)}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/blog/${blog.id}`)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Eye className="mr-2 h-4 w-4" />
            Read
          </Button>
          {isAuthor && (
            <>
              <Button
                onClick={() => navigate(`/edit/${blog.id}`)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Blog</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this blog? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
