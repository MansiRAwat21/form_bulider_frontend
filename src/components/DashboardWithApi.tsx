import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Edit, 
  Copy, 
  Trash2, 
  Plus,
  Download,
  Share2,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { AxiosError } from 'axios';

interface DashboardWithApiProps {
  createNewForm: () => void;
  editForm: (formId: string) => void;
  viewSubmissions: (formId: string) => void;
  copyFormUrl: (formId: string) => void;
}

import { 
  useForms, 
  useDeleteForm, 
  useDuplicateForm, 
  usePublishForm, 
  useUnpublishForm,
  useExportSubmissions 
} from '../hooks/useFormsApi';

const DashboardWithApi:React.FC<DashboardWithApiProps>  = ({ 
  createNewForm, 
  editForm, 
  viewSubmissions,
  copyFormUrl 
}) => {
  // Fetch forms using React Query
  const { 
    data: formsResponse, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useForms();
  
  // Mutations
  const deleteFormMutation = useDeleteForm();
  const duplicateFormMutation = useDuplicateForm();
  const publishFormMutation = usePublishForm();
  const unpublishFormMutation = useUnpublishForm();
  const exportSubmissionsMutation = useExportSubmissions();

  // Extract forms from response
  const forms = formsResponse?.data?.forms || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">Forms Dashboard</h2>
          <Button onClick={createNewForm}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Form
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">Forms Dashboard</h2>
          <Button onClick={createNewForm}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Form
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-2">⚠️</div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Forms</h3>
              <p className="text-red-700 mb-4">
                { ((error as AxiosError)?.response?.data as any)?.message || (error as any)?.message || 'Unable to connect to server'}
              </p>
              <div className="space-x-2">
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
                <Button onClick={createNewForm}>
                  Create New Form
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle form actions
  const handleDeleteForm = async (formId:any) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      try {
        await deleteFormMutation.mutateAsync(formId);
      } catch (error:any) {
        alert('Failed to delete form: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDuplicateForm = async (formId:any) => {
    try {
      const result:any = await duplicateFormMutation.mutateAsync(formId);
      console.log('Form duplicated:', result.data.title);
    } catch (error:any) {
      alert('Failed to duplicate form: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleFormStatus = async (form:any) => {
    try {
      if (form.status === 'published') {
        await unpublishFormMutation.mutateAsync(form._id);
      } else {
        await publishFormMutation.mutateAsync(form._id);
      }
    } catch (error:any) {
      alert('Failed to update form status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleExportSubmissions = async (formId:any) => {
    try {
      await exportSubmissionsMutation.mutateAsync(formId);
    } catch (error:any) {
      alert('Failed to export submissions: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCopyFormUrl = (formId:any) => {
    const url = `${window.location.origin}/form/${formId}`;
    if (copyFormUrl) {
      copyFormUrl(formId);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Form URL copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Form URL copied to clipboard!');
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Forms Dashboard</h2>
          <p className="text-gray-600 mt-1">
            {forms.length === 0 ? 'No forms yet' : `${forms.length} form${forms.length === 1 ? '' : 's'} total`}
          </p>
        </div>
        <Button onClick={createNewForm}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Form
        </Button>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms created yet</h3>
            <p className="text-gray-500 mb-6">Create your first form to get started collecting responses.</p>
            <Button onClick={createNewForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form:any) => (
            <Card key={form._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 line-clamp-2">{form.title}</CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">{form.description}</p>
                  </div>
                  <Badge 
                    variant={form.status === 'published' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {form.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{form.submissionCount || 0} submissions</span>
                    <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editForm(form._id)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    
                    {/* <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewSubmissions(form._id)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View ({form.submissionCount || 0})
                    </Button> */}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleFormStatus(form)}
                      disabled={publishFormMutation.isPending || unpublishFormMutation.isPending}
                      className="flex-1"
                    >
                      {form.status === 'published' ? (
                        <>
                          <PauseCircle className="w-3 h-3 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>

                    {form.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyFormUrl(form._id)}
                        title="Copy public URL"
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateForm(form._id)}
                      disabled={duplicateFormMutation.isPending}
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Duplicate
                    </Button>

                    {form.submissionCount > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportSubmissions(form._id)}
                        disabled={exportSubmissionsMutation.isPending}
                        title="Export CSV"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteForm(form._id)}
                      disabled={deleteFormMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                      title="Delete form"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Loading States */}
      {(deleteFormMutation.isPending || 
        duplicateFormMutation.isPending || 
        publishFormMutation.isPending || 
        unpublishFormMutation.isPending ||
        exportSubmissionsMutation.isPending) && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Processing...
        </div>
      )}
    </div>
  );
};

export default DashboardWithApi;