import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Eye, GripVertical, Trash2 } from 'lucide-react';
const FormBuilder = ({formFields,setPreviewMode,previewMode,formSettings,draggedItem,setFormFields,setDraggedItem,handleDragStart,selectedField,setSelectedField,deleteField,renderFormField,saveCurrentForm,selectedForm,setForms}:any) => {
    const handleDragOver = (e:any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e:any, targetIndex: number | null = null) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.source === 'fieldTypes') {
      // Adding new field from sidebar
      const fieldType = draggedItem.item;
      const newField = {
        id: Date.now().toString(),
        type: fieldType.type,
        label: fieldType.label,
        required: false,
        placeholder: `Enter ${fieldType.label.toLowerCase()}`,
        options: ['select', 'radio', 'checkbox'].includes(fieldType.type) ? ['Option 1', 'Option 2'] : []
      };
      
      const newFields = [...formFields];
      if (targetIndex !== null) {
        newFields.splice(targetIndex, 0, newField);
      } else {
        newFields.push(newField);
      }
      setFormFields(newFields);
      
      // Auto-save to forms array
      if (selectedForm && setForms) {
        setForms((prevForms: any[]) =>
          prevForms.map((form: any) =>
            form.id === selectedForm.id 
              ? { ...form, fields: newFields }
              : form
          )
        );
      }
    } else if (draggedItem.source === 'formBuilder') {
      // Reordering existing fields
      const draggedField = draggedItem.item;
      const currentIndex = formFields.findIndex((f:any) => f.id === draggedField.id);
      if (currentIndex === -1 || targetIndex === null || currentIndex === targetIndex) return;
      
      const newFields = [...formFields];
      const [removed] = newFields.splice(currentIndex, 1);
      newFields.splice(targetIndex, 0, removed);
      setFormFields(newFields);
      
      // Auto-save to forms array
      if (selectedForm && setForms) {
        setForms((prevForms: any[]) =>
          prevForms.map((form: any) =>
            form.id === selectedForm.id 
              ? { ...form, fields: newFields }
              : form
          )
        );
      }
    }
    
    setDraggedItem(null);
  };
  return (
     <div className="col-span-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>{formSettings.title}</CardTitle>
                          <CardDescription>{formSettings.description}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                            <Eye className="w-4 h-4 mr-1" />
                            {previewMode ? 'Edit' : 'Preview'}
                          </Button>
                          <Button size="sm" onClick={saveCurrentForm}>
                            Save Form
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e)}
                        className="min-h-96 p-4 border-2 border-dashed rounded-lg space-y-4 border-gray-300 hover:border-gray-400 transition-colors"
                      >
                        {formFields.length === 0 && (
                          <div className="text-center text-gray-500 py-12">
                            <p>Drag fields from the sidebar to build your form</p>
                          </div>
                        )}
                        
                        {previewMode ? (
                          <div className="space-y-6 bg-white p-6 rounded-lg border">
                            <div className="mb-6">
                              <h3 className="text-xl font-semibold mb-2">{formSettings.title}</h3>
                              <p className="text-gray-600">{formSettings.description}</p>
                            </div>
                            {formFields.length > 0 ? (
                              <div className="space-y-4">
                                {formFields.map(renderFormField)}
                                <Button className="w-full mt-6">Submit</Button>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <p>No fields added yet. Switch to edit mode to add fields.</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          formFields.map((field:any, index:number) => (
                            <div
                              key={field.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, field, 'formBuilder')}
                              onDragOver={handleDragOver}
                              onDrop={(e) => {
                                e.stopPropagation();
                                handleDrop(e, index);
                              }}
                              className={`p-4 border rounded-lg bg-white cursor-move hover:shadow-sm transition-shadow ${
                                selectedField?.id === field.id ? 'ring-2 ring-blue-500' : ''
                              }`}
                              onClick={() => setSelectedField(field)}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center space-x-2">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">{field.label}</span>
                                  {field.required && <span className="text-xs bg-gray-100 px-2 py-1 rounded">Required</span>}
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteField(field.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="pointer-events-none">
                                {renderFormField(field)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
  )
}

export default FormBuilder