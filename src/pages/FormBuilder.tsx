
import { useForm, useFieldArray } from "react-hook-form"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Plus, Trash } from "lucide-react"
import { useState } from "react"

type FieldType =
  | "text"
  | "email"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file"

type FormField = {
  type: FieldType
  label: string
  name: string
  placeholder?: string
  required: boolean
  options?: string[] // for select, radio, checkbox
}

type BuilderFormValues = {
  title: string
  description: string
  submissionLimit: number,
  thankYouMessage: string,
  fields: FormField[]
}

export default function FormBuilder() {
  const { register, control, handleSubmit } = useForm<BuilderFormValues>({
    defaultValues: {
      title: "",
      description: "",
      submissionLimit: 1,
      thankYouMessage: "",
      fields: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  })

  const [selectedType, setSelectedType] = useState<FieldType>("text")

  const onSubmit = (data: BuilderFormValues) => {
    console.log("🛠️ Final Form Structure:", data)
  }

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">🧩 Form Builder</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title + Description */}
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Form Title" {...register("title")} />
          <Input placeholder="Form Description" {...register("description")} />
          <Textarea placeholder="Custom Thank You Message" {...register("thankYouMessage")} />
          <Input
            type="number"
            min={0}
            placeholder="Submission Limit (0 = unlimited)"
            {...register("submissionLimit", {
              valueAsNumber: true,
            })}
          />
        </div>

        {/* Fields Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Fields</h3>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border p-4 rounded-lg bg-white shadow-sm space-y-3"
            >
              <select
                {...register(`fields.${index}.type` as const)}
                className="border rounded px-3 py-2"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="radio">Radio</option>
                <option value="checkbox">Checkbox</option>
                <option value="file">File Upload</option>
              </select>

              <Input
                placeholder="Label"
                {...register(`fields.${index}.label`)}
              />
              <Input
                placeholder="Field Name"
                {...register(`fields.${index}.name`)}
              />

              {/* Placeholder for all except file */}
              {["file"].includes(field.type) ? (
                <p className="text-sm text-gray-500">File upload does not need a placeholder.</p>
              ) : (
                <Input
                  placeholder="Placeholder"
                  {...register(`fields.${index}.placeholder`)}
                />
              )}

              {/* Options for select, radio, checkbox */}
              {["select", "radio", "checkbox"].includes(field.type) && (
                <Textarea
                  placeholder="Enter options (comma separated)"
                  {...register(`fields.${index}.options` as const, {
                    setValueAs: (val: string) =>
                      val
                        .split(",")
                        .map((v) => v.trim())
                        .filter((v) => v),
                  })}
                />
              )}

              {/* Required checkbox */}
              <label className="flex gap-2 items-center text-sm">
                <input type="checkbox" {...register(`fields.${index}.required`)} />
                Required
              </label>

              {/* Remove button */}
              <Button
                variant="destructive"
                type="button"
                className="mt-2"
                onClick={() => remove(index)}
              >
                <Trash size={14} className="mr-1" /> Remove Field
              </Button>
            </div>
          ))}

          {/* Add new field */}
          <div className="flex gap-2 items-center">
            <select
              className="border px-3 py-2 rounded"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as FieldType)}
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="radio">Radio</option>
              <option value="checkbox">Checkbox</option>
              <option value="file">File Upload</option>
            </select>
            <Button
              type="button"
              onClick={() =>
                append({
                  type: selectedType,
                  label: "",
                  name: "",
                  placeholder: "",
                  required: false,
                  options:
                    selectedType === "select" ||
                      selectedType === "radio" ||
                      selectedType === "checkbox"
                      ? []
                      : undefined,
                })
              }
            >
              <Plus size={16} className="mr-1" /> Add Field
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <Button type="submit">✅ Save Form</Button>
      </form>
    </div>
  )
}
