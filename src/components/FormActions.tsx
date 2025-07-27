import { Button } from "./ui/button"

interface Props {
  formId: string
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onEdit: (id: string) => void
}

export default function FormActions({ formId, onDelete, onDuplicate, onEdit }: Props) {
  return (
    <div className="space-x-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(formId)}>
        Edit
      </Button>
      <Button variant="outline" size="sm" onClick={() => onDuplicate(formId)}>
        Duplicate
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete(formId)}>
        Delete
      </Button>
    </div>
  )
}
