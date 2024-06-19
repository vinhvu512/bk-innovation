"use client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Chapter } from "@prisma/client";
import { FileUpload } from "@/components/file-uploader";

interface ChapterSlideFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  slideUrl: z.string().min(1),
});

export const ChapterSlideForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterSlideFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploaded, setIsUploaded] = useState(!!initialData.slideUrl); // Track if slides are uploaded initially
  const router = useRouter();

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slideUrl: initialData?.slideUrl || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        values,
      );
      toast.success("Slides uploaded successfully");
      toggleEditing();
      setIsUploaded(true); // Mark slides as uploaded
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleRemoveSlide = async () => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        slideUrl: "",
      });
      toast.success("Slides removed successfully");
      setIsUploaded(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove slides");
    }
  };

  const handleGenerateVideo = () => {
    // Placeholder for functionality to be implemented later
    toast.success("Generate Video functionality to be implemented");
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        <span>Chapter Slides</span>
        <Button onClick={toggleEditing} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.slideUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Slides
            </>
          )}
          {!isEditing && initialData.slideUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {!isEditing &&
        (!initialData.slideUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <FileText className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-auto mt-2">
            <iframe
              src={initialData.slideUrl}
              className="w-full h-60 rounded-md border object-cover"
              title="Slides"
            />
            <Button
              onClick={handleRemoveSlide}
              className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseAttachment"
            onChange={(url) => {
              if (url) {
                onSubmit({ slideUrl: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Upload the slides or PDF for this chapter.
          </div>
        </div>
      )}

      {isUploaded && !isEditing && (
        <Button
          className="mt-4 w-full md:w-auto md:ml-auto block"
          onClick={handleGenerateVideo}
        >
          Generate Video
        </Button>
      )}
    </div>
  );
};
