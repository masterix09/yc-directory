"use client";
import { useActionState, useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPitch } from "@/lib/actions";

const StartupForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState("");
  const router = useRouter();

  const handleFormSubmit = async (prevState: unknown, formData: FormData) => {
    try {
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        link: formData.get("link") as string,
        pitch,
      };

      await formSchema.parseAsync(formValues);

      console.log("formValues ===> ", formValues);

      const result = await createPitch(prevState, formData, pitch);

      console.log("results ===> ", result);

      if (result.status === "SUCCESS") {
        toast.success("Success", {
          description: "Your startup pitch has been created successfully",
        });
        router.push(`/startup/${result._id}`);
      }

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;

        console.log(fieldErrors);

        setErrors(fieldErrors as unknown as Record<string, string>);

        toast.error("Error", {
          description: "Please check your inputs and try again",
        });

        return { prevState, error: "Validation field", status: "ERROR" };
      }

      toast.error("Error", {
        description: "Unexpected Error",
      });

      return { prevState, error: "Unexpected Error", status: "ERROR" };
    }
  };

  const [, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

  return (
    <form action={formAction} className="startup-form">
      <div className="">
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
        />
        {errors?.title && <p className="startup-form_error">{errors.title}</p>}
      </div>

      <div className="">
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_input"
          required
          placeholder="Startup Description"
        />
        {errors?.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>

      <div className="">
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          className="startup-form_input"
          required
          placeholder="Startup Category (tech, Eductaion...)"
        />
        {errors?.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>

      <div className="">
        <label htmlFor="link" className="startup-form_label">
          Image URL
        </label>
        <Input
          id="link"
          name="link"
          className="startup-form_input"
          required
          placeholder="Startup Image URL"
        />
        {errors?.link && <p className="startup-form_error">{errors.link}</p>}
      </div>

      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>
        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value as string)}
          id="pitch"
          height={300}
          style={{ borderRadius: 20, overflow: "hidden", padding: 3 }}
          textareaProps={{
            placeholder:
              "Breafly describe your idea and what problem it solves",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />
        {errors?.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      <Button
        type="submit"
        className="startup-form_btn text-white"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Your Startup"}
        <Send className="size-5 ml-2" />
      </Button>
    </form>
  );
};

export default StartupForm;
