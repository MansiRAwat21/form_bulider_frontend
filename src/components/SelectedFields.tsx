import React from 'react'
import { Button } from './ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { Label } from '@radix-ui/react-label'
import { Checkbox } from '@radix-ui/react-checkbox'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

// Add Field type (should be moved to a shared types file in a real project)
export interface Field {
    id: string;
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    preview?: string;
}

interface SelectedFieldsProps {
    setFormFields: React.Dispatch<React.SetStateAction<Field[]>>;
    setSelectedField: React.Dispatch<React.SetStateAction<Field | null>>;
    selectedField: Field | null;
    selectedForm?: any;
    setForms?: React.Dispatch<React.SetStateAction<any[]>>;
}

const SelectedFields = ({ setFormFields, setSelectedField, selectedField, selectedForm, setForms }: SelectedFieldsProps) => {
    const addOption = (fieldId: string) => {
        setFormFields((prevFields: Field[]) => {
            return prevFields.map((field: Field) => {
                if (field.id === fieldId) {
                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                    const updatedField = { ...field, options: newOptions };

                    // 👇 Update selectedField immediately
                    setSelectedField(updatedField);

                    return updatedField;
                }
                return field;
            });
        });
    };
    const updateField = (fieldId: string, updates: Partial<Field>) => {
        setFormFields((fields: Field[]) => {
            const updatedFields = fields.map((field: Field) =>
                field.id === fieldId ? { ...field, ...updates } : field
            );
            
            // Auto-save to forms array if form is selected
            if (selectedForm && setForms) {
                setForms((prevForms: any[]) =>
                    prevForms.map((form: any) =>
                        form.id === selectedForm.id 
                            ? { ...form, fields: updatedFields }
                            : form
                    )
                );
            }
            
            // Update selected field if it's the one being modified
            if (selectedField?.id === fieldId) {
                setSelectedField({ ...selectedField, ...updates });
            }
            
            return updatedFields;
        });
    };

    const updateOption = (fieldId: string, optionIndex: number, value: string) => {
        setFormFields((fields: Field[]) => {
            return fields.map((field: Field) => {
                if (field.id === fieldId) {
                    const newOptions = [...(field.options || [])];
                    newOptions[optionIndex] = value;
                    const updatedField = { ...field, options: newOptions };
                    // Update selectedField if it's the one being modified
                    if (selectedField?.id === fieldId) {
                        setSelectedField(updatedField);
                    }
                    return updatedField;
                }
                return field;
            });
        });
    };

    const removeOption = (fieldId: string, optionIndex: number) => {
        setFormFields((prevFields: Field[]) =>
            prevFields.map((field: Field) => {
                if (field.id === fieldId) {
                    const newOptions = field.options ? field.options.filter((_, index) => index !== optionIndex) : [];
                    const updatedField = { ...field, options: newOptions };

                    // Update selectedField if it's the one being modified
                    if (selectedField?.id === fieldId) {
                        setSelectedField(updatedField);
                    }

                    return updatedField;
                }
                return field;
            })
        );
    };
    return (
        <div className="col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>Field Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedField ? (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="field-label" className='mb-2'>Label</Label>
                                <Input
                                    id="field-label"
                                    value={selectedField.label}
                                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="field-placeholder" className='mb-2'>Placeholder</Label>
                                <Input
                                    id="field-placeholder"
                                    value={selectedField.placeholder || ''}
                                    onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="field-required"
                                    checked={selectedField.required}
                                    onCheckedChange={(checked) => updateField(selectedField.id, { required: checked === true })}
                                />
                                <Label htmlFor="field-required">Required field</Label>
                            </div>

                            {(['select', 'radio', 'checkbox'].includes(selectedField.type)) && (
                                <div>
                                    <Label>Options</Label>
                                    <div className="space-y-2 mt-2">
                                        {selectedField.options?.map((option: any, index: number) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Input
                                                    value={option}
                                                    onChange={(e) => updateOption(selectedField.id, index, e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => removeOption(selectedField.id, index)}
                                                    disabled={(selectedField.options?.length ?? 0) <= 1}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => addOption(selectedField.id)}
                                            className="w-full"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Option
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            Select a field to configure its settings
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default SelectedFields