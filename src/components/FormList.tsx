import type { Form } from "../types/form"
import FormActions from "./FormActions"

interface Props {
  forms: Form[]
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onEdit: (id: string) => void
}

export default function FormList({ forms, onDelete, onDuplicate, onEdit }: Props) {
  if (!forms.length) {
    return <p className="text-sm text-gray-500">No forms created yet.</p>
  }

  return (
    <div className="space-y-4">
      {forms.map((form) => (
        <div
          key={form.id}
          className="border p-4 rounded-lg shadow-sm flex justify-between items-center"
        >
          <div>
            <h2 className="text-lg font-medium">{form.title}</h2>
            <p className="text-sm text-gray-500">
              {form.status} · {form.submissions} submissions · {form.createdAt}
            </p>
          </div>

          <FormActions
            formId={form.id || form._id || ''}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  )
}
