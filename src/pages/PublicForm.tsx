import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicFormViewer from '../components/PublicFormViewer';

// This would normally come from a global store or API
// For now, we'll use localStorage to simulate persistence
const getFormsFromStorage = () => {
    const stored = localStorage.getItem('formBuilderForms');
    return stored ? JSON.parse(stored) : [];
};

const saveFormsToStorage = (forms: any[]) => {
    localStorage.setItem('formBuilderForms', JSON.stringify(forms));
};

interface Field {
    id: string;
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
}

interface Form {
    _id: string;
    id?: number;
    title: string;
    description: string;
    status: string;
    submissionCount: number;
    submissions?: number;
    createdAt: string;
    fields: Field[];
    submissionData?: any[];
}

const PublicForm: React.FC = () => {
    const { formId } = useParams<{ formId: string }>();
    const navigate = useNavigate();
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadForm = () => {
            try {
                const forms = getFormsFromStorage();
                const foundForm = forms.find((f: Form) => f.id === parseInt(formId || '0'));
                
                if (!foundForm) {
                    setError('Form not found');
                } else if (foundForm.status !== 'published') {
                    setError('This form is not currently available');
                } else {
                    setForm({
                        ...foundForm,
                        _id: foundForm._id || foundForm.id?.toString() || ''
                    });
                }
            } catch (err) {
                setError('Failed to load form');
            } finally {
                setLoading(false);
            }
        };

        loadForm();
    }, [formId]);

    const handleSubmit = async (formId: string, submissionData: any) => {
        try {
            const forms = getFormsFromStorage();
            const updatedForms = forms.map((f: Form) => {
                if (f.id === parseInt(formId)) {
                    return {
                        ...f,
                        submissions: (f.submissions || 0) + 1,
                        submissionData: [
                            ...(f.submissionData || []),
                            submissionData
                        ]
                    };
                }
                return f;
            });

            saveFormsToStorage(updatedForms);
            
            // Update local state
            if (form) {
                setForm({
                    ...form,
                    _id: form._id || form.id?.toString() || '',
                    submissions: (form.submissions || 0) + 1,
                    submissionData: [
                        ...(form.submissionData || []),
                        submissionData
                    ]
                });
            }
        } catch (err) {
            console.error('Failed to save submission:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading form...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!form) {
        return null;
    }

    return (
        <PublicFormViewer 
            form={form} 
            onSubmit={handleSubmit}
            onBack={() => navigate('/')}
        />
    );
};

export default PublicForm;