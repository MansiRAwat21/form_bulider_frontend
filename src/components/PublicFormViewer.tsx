import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, CheckCircle, ArrowLeft } from 'lucide-react';

interface Form {
    _id: string;
    title: string;
    description: string;
    status: string;
    submissionCount: number;
    createdAt: string;
    fields: Field[];
}

interface Field {
    id: string;
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
}

interface PublicFormViewerProps {
    form: Form;
    onSubmit: (formId: string, data: any) => Promise<any>;
    onBack?: () => void;
    isSubmitting?: boolean;
}

const PublicFormViewer: React.FC<PublicFormViewerProps> = ({ form, onSubmit, onBack, isSubmitting = false }) => {
    const [formData, setFormData] = useState<{[key: string]: any}>({});
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
        
        // Clear error when user starts typing
        if (errors[fieldId]) {
            setErrors(prev => ({
                ...prev,
                [fieldId]: ''
            }));
        }
    };

    const handleFileChange = (fieldId: string, file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleInputChange(fieldId, {
                    file: file,
                    preview: reader.result as string,
                    name: file.name
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        form.fields.forEach(field => {
            if (field.required && (!formData[field.id] || formData[field.id] === '')) {
                newErrors[field.id] = `${field.label} is required`;
            }
            
            if (field.type === 'email' && formData[field.id]) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData[field.id])) {
                    newErrors[field.id] = 'Please enter a valid email address';
                }
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            const submissionData = {
                data: formData
            };
            
            await onSubmit(form._id, submissionData);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit form. Please try again.');
        }
    };

    const renderField = (field: Field) => {
        const hasError = !!errors[field.id];
        const errorMessage = errors[field.id];

        switch (field.type) {
            case 'text':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={field.id}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className={hasError ? 'border-red-500' : ''}
                        />
                        {hasError && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    </div>
                );

            case 'email':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={field.id}
                            type="email"
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className={hasError ? 'border-red-500' : ''}
                        />
                        {hasError && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Textarea
                            id={field.id}
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className={hasError ? 'border-red-500' : ''}
                        />
                        {hasError && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Select onValueChange={(value) => handleInputChange(field.id, value)}>
                            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option, index) => (
                                    <SelectItem key={index} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <div className="space-y-2">
                            {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${field.id}-${index}`}
                                        checked={(formData[field.id] || []).includes(option)}
                                        onCheckedChange={(checked) => {
                                            const currentValues = formData[field.id] || [];
                                            if (checked) {
                                                handleInputChange(field.id, [...currentValues, option]);
                                            } else {
                                                handleInputChange(field.id, currentValues.filter((v: string) => v !== option));
                                            }
                                        }}
                                    />
                                    <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                                </div>
                            ))}
                        </div>
                        {hasError && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <RadioGroup
                            value={formData[field.id] || ''}
                            onValueChange={(value) => handleInputChange(field.id, value)}
                        >
                            {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                                    <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {hasError && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    </div>
                );

            case 'file':
                return (
                    <div key={field.id} className="space-y-2">
                        <Label>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-gray-400 transition-colors relative ${hasError ? 'border-red-500' : 'border-gray-300'}`}>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                            {formData[field.id]?.preview && (
                                <div className="mt-2">
                                    <img
                                        src={formData[field.id].preview}
                                        alt="Preview"
                                        className="mx-auto max-h-48 rounded border"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{formData[field.id].name}</p>
                                </div>
                            )}
                        </div>
                        {hasError && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    </div>
                );

            default:
                return null;
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <Card>
                        <CardContent className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                            <p className="text-gray-600 mb-6">Your form has been submitted successfully.</p>
                            {onBack && (
                                <Button onClick={onBack} variant="outline">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Forms
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {onBack && (
                    <Button onClick={onBack} variant="outline" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Forms
                    </Button>
                )}
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{form.title}</CardTitle>
                        {form.description && (
                            <p className="text-gray-600">{form.description}</p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {form.fields.map(renderField)}
                            
                            <div className="pt-6 border-t">
                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PublicFormViewer;