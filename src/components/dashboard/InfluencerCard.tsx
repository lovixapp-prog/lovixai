import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clapperboard, MoreVertical, Trash2, PawPrint, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Influencer } from "./AIInfluencer";

interface InfluencerCardProps {
  influencer: Influencer;
  onSelect: () => void;
  onDeleted: () => void;
}

const InfluencerCard = ({ influencer, onSelect, onDeleted }: InfluencerCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('influencers')
        .delete()
        .eq('id', influencer.id);

      if (error) throw error;

      toast.success("Influencer deleted");
      onDeleted();
    } catch (error: any) {
      console.error('Error deleting influencer:', error);
      toast.error("Failed to delete influencer");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div 
        className="group bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer"
        onClick={onSelect}
      >
        {/* Avatar image */}
        <div className="aspect-[3/4] relative overflow-hidden">
          <img
            src={influencer.avatar_image}
            alt={influencer.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Type badge */}
          {influencer.influencer_type && influencer.influencer_type !== "human" && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <Badge className="gap-1 text-[10px] px-1.5 py-0.5 bg-black/60 text-white border-0 backdrop-blur-sm">
                {influencer.influencer_type === "animal" ? (
                  <><PawPrint className="w-2.5 h-2.5" />Animal</>
                ) : (
                  <><Wand2 className="w-2.5 h-2.5" />Custom</>
                )}
              </Badge>
            </div>
          )}

          {/* Actions on hover - hidden on mobile, shown on tap/hover on desktop */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button 
              className="w-full gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10"
            >
              <Clapperboard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">View & Create</span>
              <span className="xs:hidden">Open</span>
            </Button>
          </div>

          {/* More menu - always visible on mobile */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-6 w-6 sm:h-8 sm:w-8 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Info - more compact on mobile */}
        <div className="p-2 sm:p-4 space-y-1 sm:space-y-2">
          <h3 className="font-semibold text-sm sm:text-lg truncate">{influencer.name}</h3>
          <div className="flex flex-wrap gap-0.5 sm:gap-1">
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0">
              {influencer.gender}
            </Badge>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0">
              {influencer.age_range}
            </Badge>
            {influencer.fashion_style && (
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 hidden sm:inline-flex">
                {influencer.fashion_style}
              </Badge>
            )}
          </div>
          {influencer.personality_tags && influencer.personality_tags.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1 pt-1">
              {influencer.personality_tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs text-muted-foreground">
                  #{tag.toLowerCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {influencer.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this influencer and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InfluencerCard;
