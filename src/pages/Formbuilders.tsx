import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {  Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import FormSetting from '../components/FormSetting';
import FormBuilder from '../components/FormBuilder';
import SelectedFields from '../components/SelectedFields';
import Dashboard from '../components/Dashboard';
import FormSubmissions from '../components/FormSubmissions';

// Types
interface Field {
    id: string;
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    preview?: string;
}

interface Form {
    id: number;
    _id?: string;
    title: string;
    description: string;
    status: string;
    submissions: number;
    createdAt: string;
    fields: Field[];
    submissionData?: any[];
}

interface FormSettings {
    title: string;
    description: string;
    thankYouMessage: string;
    submissionLimit: string;
}

interface DraggedItem {
    item: FieldType | Field;
    source: 'fieldTypes' | 'formBuilder';
}

interface FieldType {
    type: string;
    label: string;
    icon: string;
}

// Dummy data
const dummyForms: Form[] = [
    {
        id: 1,
        title: 'Customer Feedback Form',
        description: 'Collect valuable feedback from customers',
        status: 'published',
        submissions: 145,
        createdAt: '2024-01-15',
        fields: [
            { id: '1', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
            { id: '2', type: 'email', label: 'Email Address', required: true, placeholder: 'your@email.com' },
            { id: '3', type: 'select', label: 'Rating', required: true, options: ['Excellent', 'Good', 'Average', 'Poor'] },
            { id: '4', type: 'textarea', label: 'Comments', required: false, placeholder: 'Share your feedback...' }
        ]
    }
];

const fieldTypes: FieldType[] = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'select', label: 'Dropdown', icon: '🔽' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'radio', label: 'Radio Button', icon: '🔘' },
    { type: 'file', label: 'File Upload', icon: '📎' }
];

// Storage functions
const getFormsFromStorage = (): Form[] => {
    const stored = localStorage.getItem('formBuilderForms');
    return stored ? JSON.parse(stored) : dummyForms;
};

const saveFormsToStorage = (forms: Form[]) => {
    localStorage.setItem('formBuilderForms', JSON.stringify(forms));
};

const FormBuilders: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'builder' | 'submissions'>('dashboard');
    const [forms, setForms] = useState<Form[]>([]);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const [formFields, setFormFields] = useState<Field[]>([]);
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const [previewMode, setPreviewMode] = useState<boolean>(false);
    const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
    const [formSettings, setFormSettings] = useState<FormSettings>({
        title: 'Untitled Form',
        description: 'Form description',
        thankYouMessage: 'Thank you for your submission!',
        submissionLimit: ''
    });

    // Load forms from localStorage on component mount
    useEffect(() => {
        const savedForms = getFormsFromStorage();
        setForms(savedForms);
    }, []);

    // Save forms to localStorage whenever forms state changes
    useEffect(() => {
        if (forms.length > 0) {
            saveFormsToStorage(forms);
        }
    }, [forms]);

    // Drag and Drop Functions
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: FieldType | Field, source: 'fieldTypes' | 'formBuilder') => {
        setDraggedItem({ item, source });
        e.dataTransfer.effectAllowed = 'move';
    };

    // Form Builder Functions
    const saveCurrentForm = () => {
        if (!selectedForm) {
            alert('No form selected to save!');
            return;
        }
        
        // Validation
        if (!formSettings.title.trim()) {
            alert('Form title is required!');
            return;
        }
        
        const updatedForm: Form = {
            ...selectedForm,
            title: formSettings.title,
            description: formSettings.description,
            fields: formFields,
            status: formFields.length > 0 ? 'published' : 'draft'
        };
        
        setForms(prevForms => 
            prevForms.map(form => 
                form.id === selectedForm.id ? updatedForm : form
            )
        );
        
        setSelectedForm(updatedForm);
        alert(`Form "${formSettings.title}" saved successfully! Status: ${updatedForm.status}`);
        setActiveTab('dashboard')
    };

    const deleteField = (fieldId: string) => {
        setFormFields(fields => fields.filter(field => field.id !== fieldId));
        setSelectedField(null);
        
        // Auto-save when field is deleted
        if (selectedForm) {
            const updatedFields = formFields.filter(field => field.id !== fieldId);
            const updatedForm = { ...selectedForm, fields: updatedFields };
            setForms(prevForms => 
                prevForms.map(form => 
                    form.id === selectedForm.id ? updatedForm : form
                )
            );
        }
    };

    // Dashboard Functions
    const createNewForm = () => {
        const newForm: Form = {
            id: Date.now(),
            title: 'Untitled Form',
            description: 'Form description',
            status: 'draft',
            submissions: 0,
            createdAt: new Date().toISOString().split('T')[0],
            fields: []
        };
        setForms([...forms, newForm]);
        setSelectedForm(newForm);
        setFormFields([]);
        setFormSettings({
            title: newForm.title,
            description: newForm.description,
            thankYouMessage: 'Thank you for your submission!',
            submissionLimit: ''
        });
        setActiveTab('builder');
    };

    const duplicateForm = (form: Form) => {
        const duplicated: Form = {
            ...form,
            id: Date.now(),
            title: `${form.title} (Copy)`,
            submissions: 0,
            status: 'draft', // New duplicated forms start as drafts
            createdAt: new Date().toISOString().split('T')[0]
        };
        setForms([...forms, duplicated]);
    };
    
    const toggleFormStatus = (formId: number) => {
        setForms(prevForms => 
            prevForms.map(form => {
                if (form.id === formId) {
                    const newStatus = form.status === 'published' ? 'draft' : 'published';
                    return { ...form, status: newStatus };
                }
                return form;
            })
        );
    };

    const deleteForm = (formId: number) => {
        setForms(forms.filter(form => form.id !== formId));
    };

    const viewSubmissions = (form: Form) => {
        setSelectedForm(form);
        setActiveTab('submissions');
    };

    const copyFormUrl = async (formId: number) => {
        const url = `${window.location.origin}/form/${formId}`;
        try {
            await navigator.clipboard.writeText(url);
            alert('Form URL copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Form URL copied to clipboard!');
        }
    };

    const editForm = (form: Form) => {
        setSelectedForm(form);
        setFormFields(form.fields || []);
        setSelectedField(null); // Clear selected field when switching forms
        setFormSettings({
            title: form.title,
            description: form.description,
            thankYouMessage: 'Thank you for your submission!',
            submissionLimit: ''
        });
        setActiveTab('builder');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormFields((prev: Field[]) =>
                prev.map((field, i) =>
                    i === index ? { ...field, preview: reader.result as string } : field
                )
            );
        };
        reader.readAsDataURL(file);
    };

    // Render Field in Preview/Form
    const renderFormField = (field: Field, index?: number) => {
        switch (field.type) {
            case 'text':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                        <Input placeholder={field.placeholder} />
                    </div>
                );

            case 'email':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                        <Input type="email" placeholder={field.placeholder} />
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                        <Textarea placeholder={field.placeholder} />
                    </div>
                );

            case 'select':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option: string, index: number) => (
                                    <SelectItem key={index} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                        <div className="space-y-2">
                            {field.options?.map((option: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Checkbox id={`${field.id}-${index}`} />
                                    <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                        <RadioGroup>
                            {field.options?.map((option: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                                    <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                );

            case 'file':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>

                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors relative"
                        >
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => index !== undefined && handleImageChange(e, index)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>

                            {field.preview && (
                                <div className="mt-2">
                                    <img
                                        src={field.preview}
                                        alt="Preview"
                                        className="mx-auto max-h-48 rounded border"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )


            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
                        <div className="flex space-x-2">
                            <Button onClick={() => setActiveTab('dashboard')} variant={activeTab === 'dashboard' ? 'default' : 'outline'}>
                                Dashboard
                            </Button>
                            <Button onClick={() => setActiveTab('builder')} variant={activeTab === 'builder' ? 'default' : 'outline'}>
                                Form Builder
                            </Button>
                            {selectedForm && (
                                <Button onClick={() => setActiveTab('submissions')} variant={activeTab === 'submissions' ? 'default' : 'outline'}>
                                    Submissions ({selectedForm.submissions || 0})
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && (               
                    <Dashboard
                        forms={forms}
                        createNewForm={createNewForm}
                        editForm={editForm}
                        duplicateForm={duplicateForm}
                        deleteForm={deleteForm}
                        toggleFormStatus={toggleFormStatus}
                        viewSubmissions={viewSubmissions}
                        copyFormUrl={copyFormUrl}
                    />
                )}

                {activeTab === 'builder' && (
                    <div className="grid grid-cols-12 gap-6">
                        {/* Field Types Sidebar */}
                        <div className="col-span-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Field Types</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {fieldTypes.map((fieldType) => (
                                            <div
                                                key={fieldType.type}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, fieldType, 'fieldTypes')}
                                                className="p-3 border rounded-lg cursor-move hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                                            >
                                                <span className="text-lg">{fieldType.icon}</span>
                                                <span className="text-sm font-medium">{fieldType.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Settings */}

                            <FormSetting 
                                formSettings={formSettings} 
                                setFormSettings={setFormSettings} 
                                selectedForm={selectedForm}
                                setForms={setForms}
                            />
                        </div>

                        {/* Form Builder Area */}
                        <FormBuilder
                            formFields={formFields}
                            previewMode={previewMode}
                            setPreviewMode={setPreviewMode}
                            formSettings={formSettings}
                            draggedItem={draggedItem} 
                            setFormFields={setFormFields} 
                            setDraggedItem={setDraggedItem}
                            handleDragStart={handleDragStart} 
                            selectedField={selectedField} 
                            setSelectedField={setSelectedField}
                            deleteField={deleteField} 
                            renderFormField={renderFormField}
                            saveCurrentForm={saveCurrentForm}
                            selectedForm={selectedForm}
                            setForms={setForms}
                        />

                        {/* Field Configuration Sidebar */}
                        <SelectedFields
                            setFormFields={setFormFields}
                            setSelectedField={setSelectedField}
                            selectedField={selectedField}
                            selectedForm={selectedForm}
                            setForms={setForms}
                        />
                    </div>
                )}

                {activeTab === 'submissions' && selectedForm && (
                    <FormSubmissions
                        form={{
                            ...selectedForm,
                            id: selectedForm.id?.toString() || selectedForm._id || '',
                            submissions: selectedForm.submissionData || []
                        }}
                        onBack={() => setActiveTab('dashboard')}
                    />
                )}
            </main>
        </div>
    );
};

export default FormBuilders;