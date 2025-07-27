export type FormStatus = "draft" | "published"

export interface Field {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  preview?: string;
}

export interface Form {
  _id: string
  id?: string
  title: string
  description: string
  status: FormStatus
  submissionCount: number
  submissions?: number
  createdAt: string
  fields: Field[]
  submissionData?: any[]
}
