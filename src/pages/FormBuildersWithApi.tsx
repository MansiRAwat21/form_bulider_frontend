import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import FormSetting from '../components/FormSetting';
import FormBuilder from '../components/FormBuilder';
import SelectedFields from '../components/SelectedFields';
import DashboardWithApi from '../components/DashboardWithApi';
import FormSubmissions from '../components/FormSubmissions';
import { useCreateForm, useUpdateForm, useForm, useSubmissions } from '../hooks/useFormsApi';

// Types (keep existing types)
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
    _id: string;
    title: string;
    description: string;
    status: string;
    submissionCount: number;
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

const fieldTypes: FieldType[] = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'select', label: 'Dropdown', icon: '🔽' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'radio', label: 'Radio Button', icon: '🔘' },
    { type: 'file', label: 'File Upload', icon: '📎' }
];

const FormBuildersWithApi: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'builder' | 'submissions'>('dashboard');
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

    // React Query hooks
    const createFormMutation = useCreateForm();
    const updateFormMutation = useUpdateForm();
    
    // Fetch form data when selectedForm changes
    const { data: formData } = useForm(selectedForm?._id, !!selectedForm?._id);
    
    // Fetch submissions data when viewing submissions
    const { data: submissionsData } = useSubmissions(
        selectedForm?._id, 
        {}, 
        activeTab === 'submissions' && !!selectedForm?._id
    );

    // Update local state when form data is fetched
    useEffect(() => {
        if (formData?.data) {
            const form = formData.data;
            setFormFields(form.fields || []);
            setFormSettings({
                title: form.title,
                description: form.description,
                thankYouMessage: form.settings?.thankYouMessage || 'Thank you for your submission!',
                submissionLimit: form.settings?.submissionLimit?.toString() || ''
            });
        }
    }, [formData]);

    // Drag and Drop Functions
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: FieldType | Field, source: 'fieldTypes' | 'formBuilder') => {
        setDraggedItem({ item, source });
        e.dataTransfer.effectAllowed = 'move';
    };

    // Form Builder Functions
    const saveCurrentForm = async () => {
        if (!selectedForm) {
            alert('No form selected to save!');
            return;
        }
        
        // Validation
        if (!formSettings.title.trim()) {
            alert('Form title is required!');
            return;
        }
        
        const formData = {
            title: formSettings.title,
            description: formSettings.description,
            fields: formFields,
            settings: {
                thankYouMessage: formSettings.thankYouMessage,
                submissionLimit: parseInt(formSettings.submissionLimit) || 0
            }
        };
        
        try {
            await updateFormMutation.mutateAsync({
                id: selectedForm._id,
                formData
            });
            
            // Update local state
            setSelectedForm(prev => prev ? {
                ...prev,
                ...formData,
                status: formFields.length > 0 ? 'published' : 'draft'
            } : null);
            
            alert(`Form "${formSettings.title}" saved successfully!`);
        } catch (error) {
            const err = error as any;
            alert('Failed to save form: ' + (err.response?.data?.message || err.message));
        }
    };

    const deleteField = (fieldId: string) => {
        setFormFields(fields => fields.filter(field => field.id !== fieldId));
        setSelectedField(null);
    };

    // Dashboard Functions
    const createNewForm = async () => {
        const newFormData = {
            title: 'Untitled Form',
            description: 'Form description',
            fields: [],
            settings: {
                thankYouMessage: 'Thank you for your submission!',
                submissionLimit: 0
            }
        };

        try {
            const result = await createFormMutation.mutateAsync(newFormData);
            const newForm = result.data;
            
            setSelectedForm(newForm);
            setFormFields([]);
            setFormSettings({
                title: newForm.title,
                description: newForm.description,
                thankYouMessage: 'Thank you for your submission!',
                submissionLimit: ''
            });
            setActiveTab('builder');
        } catch (error) {
            const err = error as any;
            alert('Failed to create form: ' + (err.response?.data?.message || err.message));
        }
    };

    const viewSubmissions = (formId: string) => {
        // Find form from cache or you could fetch it
        // For now, we'll create a minimal form object
        const minimalForm: Form = {
            _id: formId,
            title: 'Loading...',
            description: '',
            status: 'published',
            submissionCount: 0,
            createdAt: new Date().toISOString(),
            fields: []
        };
        setSelectedForm(minimalForm);
        setActiveTab('submissions');
    };

    const copyFormUrl = async (formId: string) => {
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

    const editForm = (formId: string) => {
        // Find form from cache or you could fetch it
        // For now, we'll create a minimal form object
        const minimalForm: Form = {
            _id: formId,
            title: 'Loading...',
            description: '',
            status: 'draft',
            submissionCount: 0,
            createdAt: new Date().toISOString(),
            fields: []
        };
        setSelectedForm(minimalForm);
        // Fields and settings will be updated via useEffect when formData is fetched
        setSelectedField(null);
        setActiveTab('builder');
    };

    // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    //     const file = e.target.files?.[0];
    //     if (!file) return;

    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //         setFormFields((prev: Field[]) =>
    //             prev.map((field, i) =>
    //                 i === index ? { ...field, preview: reader.result as string } : field
    //             )
    //         );
    //     };
    //     reader.readAsDataURL(file);
    // };

    // Render Field in Preview/Form (keep existing implementation)
    const renderFormField = (_field: Field, _index?: number) => {
        // ... existing renderFormField implementation
        // (This would be the same as in your original component)
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
                        <div className="flex space-x-2">
                            <Button 
                                onClick={() => setActiveTab('dashboard')} 
                                variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                            >
                                Dashboard
                            </Button>
                            <Button 
                                onClick={() => setActiveTab('builder')} 
                                variant={activeTab === 'builder' ? 'default' : 'outline'}
                                disabled={!selectedForm}
                            >
                                Form Builder
                            </Button>
                            {selectedForm && (
                                <Button 
                                    onClick={() => setActiveTab('submissions')} 
                                    variant={activeTab === 'submissions' ? 'default' : 'outline'}
                                >
                                    Submissions ({selectedForm.submissionCount || 0})
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Loading state for mutations */}
                {(createFormMutation.isPending || updateFormMutation.isPending) && (
                    <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                        {createFormMutation.isPending ? 'Creating form...' : 'Saving form...'}
                    </div>
                )}

                {activeTab === 'dashboard' && (               
                    <DashboardWithApi
                        createNewForm={createNewForm}
                        editForm={editForm}
                        viewSubmissions={viewSubmissions}
                        copyFormUrl={copyFormUrl}
                    />
                )}

                {activeTab === 'builder' && selectedForm && (
                    <div className="grid grid-cols-12 gap-6">
                        {/* Field Types Sidebar */}
                        <div className="col-span-3 space-y-6">
                            {/* Field Types */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Types</h3>
                                <div className="space-y-2">
                                    {fieldTypes.map((fieldType) => (
                                        <div
                                            key={fieldType.type}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, fieldType, 'fieldTypes')}
                                            className="flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="text-xl mr-3">{fieldType.icon}</span>
                                            <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Form Settings */}
                            <FormSetting 
                                formSettings={formSettings} 
                                setFormSettings={setFormSettings} 
                                selectedForm={selectedForm}
                                setForms={() => {}} // Not needed with API
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
                            setForms={() => {}} // Not needed with API
                        />

                        {/* Field Configuration Sidebar */}
                        <SelectedFields
                            setFormFields={setFormFields}
                            setSelectedField={setSelectedField}
                            selectedField={selectedField}
                            selectedForm={selectedForm}
                            setForms={() => {}} // Not needed with API
                        />
                    </div>
                )}

                {activeTab === 'submissions' && selectedForm && (
                    <FormSubmissions
                        form={{
                            id: selectedForm._id,
                            title: selectedForm.title,
                            description: selectedForm.description,
                            fields: selectedForm.fields,
                            submissions: submissionsData?.data?.submissions || []
                        }}
                        onBack={() => setActiveTab('dashboard')}
                    />
                )}
            </main>
        </div>
    );
};

export default FormBuildersWithApi;