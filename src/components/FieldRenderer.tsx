type Props = {
  field: any
  index: number
  register: any
}

export default function FieldRenderer({ field, index, register }: Props) {
  const name = `fields.${index}.value`

  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "date":
      return (
        <div className="space-y-1">
          <label className="block font-medium">{field.label}</label>
          <input
            type={field.type}
            {...register(name)}
            placeholder={field.placeholder}
            className="border rounded px-3 py-2 w-full"
            required={field.required}
          />
        </div>
      )

    case "textarea":
      return (
        <div className="space-y-1">
          <label className="block font-medium">{field.label}</label>
          <textarea
            {...register(name)}
            placeholder={field.placeholder}
            className="border rounded px-3 py-2 w-full"
            required={field.required}
          />
        </div>
      )

    case "file":
      return (
        <div className="space-y-1">
          <label className="block font-medium">{field.label}</label>
          <input type="file" {...register(name)} className="w-full" />
        </div>
      )

    case "select":
      return (
        <div className="space-y-1">
          <label className="block font-medium">{field.label}</label>
          <select
            {...register(name)}
            className="border rounded px-3 py-2 w-full"
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((opt: string, i: number) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )

    case "radio":
      return (
        <div className="space-y-1">
          <label className="block font-medium">{field.label}</label>
          {field.options?.map((opt: string, i: number) => (
            <label key={i} className="flex items-center gap-2">
              <input
                type="radio"
                value={opt}
                {...register(name)}
                required={field.required}
              />
              {opt}
            </label>
          ))}
        </div>
      )

    case "checkbox":
      return (
        <div className="space-y-1">
          <label className="block font-medium">{field.label}</label>
          {field.options?.map((opt: string, i: number) => (
            <label key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={opt}
                {...register(`${name}.${i}`)}
              />
              {opt}
            </label>
          ))}
        </div>
      )

    default:
      return <div className="text-red-500">❌ Unsupported Field Type</div>
  }
}

