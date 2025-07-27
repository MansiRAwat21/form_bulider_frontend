import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Download, Eye, Calendar, User } from 'lucide-react';

interface Submission {
    _id: string;
    submittedAt: string;
    data: { [key: string]: any };
    [key: string]: any;
}

interface Form {
    id: string;
    title: string;
    description: string;
    fields: Field[];
    submissions?: Submission[];
}

interface Field {
    id: string;
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
}

interface FormSubmissionsProps {
    form: Form;
    onBack: () => void;
}

const FormSubmissions: React.FC<FormSubmissionsProps> = ({ form, onBack }) => {
    const submissions = form.submissions || [];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const renderFieldValue = (field: Field, value: any) => {
        if (!value && value !== 0) return '-';

        switch (field.type) {
            case 'checkbox':
                return Array.isArray(value) ? value.join(', ') : value;
            case 'file':
                return value.name ? (
                    <div className="flex items-center space-x-2">
                        <span>{value.name}</span>
                        {value.preview && (
                            <img 
                                src={value.preview} 
                                alt="Uploaded file" 
                                className="w-8 h-8 object-cover rounded border"
                            />
                        )}
                    </div>
                ) : value;
            default:
                return typeof value === 'object' ? JSON.stringify(value) : String(value);
        }
    };

    const exportToCSV = () => {
        if (submissions.length === 0) return;

        const headers = ['Submission ID', 'Submitted At', ...form.fields.map(f => f.label)];
        const rows = submissions.map(submission => [
            submission._id,
            formatDate(submission.submittedAt),
            ...form.fields.map(field => {
                const value = submission.data[field.id];
                if (field.type === 'checkbox' && Array.isArray(value)) {
                    return value.join('; ');
                }
                if (field.type === 'file' && value?.name) {
                    return value.name;
                }
                return value || '';
            })
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_submissions.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Button onClick={onBack} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
                            <p className="text-gray-600">{submissions.length} submissions</p>
                        </div>
                    </div>
                    
                    {submissions.length > 0 && (
                        <Button onClick={exportToCSV}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    )}
                </div>

                {submissions.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                            <p className="text-gray-500">Submissions will appear here once users start filling out your form.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {submissions.map((submission, index) => (
                            <Card key={submission.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center space-x-2">
                                            <User className="w-5 h-5" />
                                            <span>Submission #{submissions.length - index}</span>
                                        </CardTitle>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(submission.submittedAt)}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {form.fields.map(field => (
                                            <div key={field.id} className="space-y-1">
                                                <Label className="font-medium text-gray-700">
                                                    {field.label}
                                                </Label>
                                                <div className="p-2 bg-gray-50 rounded border min-h-[2.5rem] flex items-center">
                                                    {renderFieldValue(field, submission.data[field.id])}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Add Label component if not imported
const Label: React.FC<{className?: string; children: React.ReactNode}> = ({ className, children }) => (
    <label className={className}>{children}</label>
);

export default FormSubmissions;