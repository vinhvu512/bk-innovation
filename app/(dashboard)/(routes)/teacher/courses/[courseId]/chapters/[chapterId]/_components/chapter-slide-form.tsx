"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, FileText } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter } from "@prisma/client";
import { FileUpload } from "@/components/file-uploader";

interface ChapterSlideFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  slideUrl: z.string().min(1, "Slide URL is required"),
});

export const ChapterSlideForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterSlideFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEditing = () => setIsEditing(!isEditing);

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
      toast.success("Chapter updated");
      toggleEditing();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
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
              Add Slides/PDF
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
          <div className="mt-2">
            <a
              href={initialData.slideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Slides/PDF
            </a>
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
      {initialData.slideUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Slides or PDFs can take a few minutes to process. Refresh the page if
          they do not appear.
        </div>
      )}
    </div>
  );
};
