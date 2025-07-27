import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicFormViewer from '../components/PublicFormViewer';
import { usePublicForm, useSubmitForm } from '../hooks/useFormsApi';



const PublicFormWithApi: React.FC = () => {
    const { formId } = useParams<{ formId: string }>();
    const navigate = useNavigate();
    
    // Fetch public form data
    const { 
        data: formResponse, 
        isLoading, 
        isError, 
        error 
    } = usePublicForm(formId);
    
    // Submit form mutation
    const submitFormMutation = useSubmitForm();

    // Extract form from response
    const form = formResponse?.data;

    // Handle form submission
    const handleSubmit = async (formId: string, submissionData: any) => {
        try {
            const result = await submitFormMutation.mutateAsync({
                formId,
                submissionData
            });
            
            console.log('✅ Form submitted successfully:', result.data);
            return result.data;
        } catch (error) {
            console.error('❌ Form submission failed:', error);
            throw error;
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading form...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (isError || !form) {
        const errorMessage = (error as any)?.response?.data?.message || 
                           (error as Error)?.message || 
                           'Form not found or not available';
        
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h2>
                    <p className="text-gray-600 mb-6">{errorMessage}</p>
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

    return (
        <>
            <PublicFormViewer 
                form={form} 
                onSubmit={handleSubmit}
                onBack={() => navigate('/')}
                isSubmitting={submitFormMutation.isPending}
            />
            
            {/* Loading overlay during submission */}
            {submitFormMutation.isPending && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Submitting your response...</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default PublicFormWithApi;