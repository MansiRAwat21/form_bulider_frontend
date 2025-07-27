import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsApi, submissionsApi, publicApi, filesApi } from '../services/api';

// Query Keys
export const QUERY_KEYS = {
  FORMS: 'forms',
  FORM: 'form',
  PUBLIC_FORM: 'public-form',
  SUBMISSIONS: 'submissions',
  SUBMISSION: 'submission',
  FORM_STATS: 'form-stats',
  SUBMISSION_STATS: 'submission-stats',
};

// Forms Hooks
export const useForms = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FORMS, params],
    queryFn: () => formsApi.getForms(params),
    staleTime: 1000 * 60 * 5, // 5 minutes

  });
};

export const useForm = (id:any, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FORM, id],
    queryFn: () => formsApi.getForm(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePublicForm = (id:any, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PUBLIC_FORM, id],
    queryFn: () => publicApi.getPublicForm(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFormStats = (id:any, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FORM_STATS, id],
    queryFn: () => formsApi.getFormStats(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Form Mutations
export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsApi.createForm,
    onSuccess: (data:any) => {
      // Invalidate and refetch forms list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FORMS] });
      
      // Add the new form to cache
      queryClient.setQueryData([QUERY_KEYS.FORM, data.data._id], data);
      
      console.log('✅ Form created successfully:', data.data.title);
    },
    onError: (error:any) => {
      console.error('❌ Failed to create form:', error.response?.data?.message || error.message);
    }
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => formsApi.updateForm(id, formData),
    onSuccess: (data:any, variables:any) => {
      // Update the specific form in cache
      queryClient.setQueryData([QUERY_KEYS.FORM, variables.id], data);
      
      // Invalidate forms list to reflect changes
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FORMS] });
      
      console.log('✅ Form updated successfully:', data.data.title);
    },
    onError: (error:any) => {
      console.error('❌ Failed to update form:', error.response?.data?.message || error.message);
    }
  });
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsApi.deleteForm,
    onSuccess: (deletedId) => {
      // Remove from forms list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FORMS] });
      
      // Remove the specific form from cache
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.FORM, deletedId] });
      
      console.log('✅ Form deleted successfully');
    },
    onError: (error:any) => {
      console.error('❌ Failed to delete form:', error.response?.data?.message || error.message);
    }
  });
};

export const usePublishForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsApi.publishForm,
    onSuccess: (data, formId) => {
      // Update form cache with new status
      queryClient.setQueryData([QUERY_KEYS.FORM, formId], data);
      
      // Invalidate forms list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FORMS] });
      
      console.log('✅ Form published successfully');
    }
  });
};

export const useUnpublishForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsApi.unpublishForm,
    onSuccess: (data, formId) => {
      // Update form cache with new status
      queryClient.setQueryData([QUERY_KEYS.FORM, formId], data);
      
      // Invalidate forms list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FORMS] });
      
      console.log('✅ Form unpublished successfully');
    }
  });
};

export const useDuplicateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsApi.duplicateForm,
    onSuccess: (data:any) => {
      // Add duplicated form to cache
      queryClient.setQueryData([QUERY_KEYS.FORM, data.data._id], data);
      
      // Invalidate forms list to include new form
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FORMS] });
      
      console.log('✅ Form duplicated successfully:', data.data.title);
    }
  });
};

// Submissions Hooks
export const useSubmissions = (formId:any, params = {}, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBMISSIONS, formId, params],
    queryFn: () => submissionsApi.getSubmissions(formId, params),
    enabled: !!formId && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useSubmission = (id:any, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBMISSION, id],
    queryFn: () => submissionsApi.getSubmission(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSubmissionStats = (formId:any, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBMISSION_STATS, formId],
    queryFn: () => submissionsApi.getSubmissionStats(formId),
    enabled: !!formId && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Submission Mutations
export const useSubmitForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formId, submissionData }) => submissionsApi.submitForm(formId, submissionData),
    onSuccess: (data:any, variables:any) => {
      // Invalidate submissions for this form
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.SUBMISSIONS, variables.formId] 
      });
      
      // Invalidate form stats
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.FORM_STATS, variables.formId] 
      });
      
      // Invalidate submission stats
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.SUBMISSION_STATS, variables.formId] 
      });
      
      console.log('✅ Form submitted successfully:', data.data.submissionId);
    },
    onError: (error:any) => {
      console.error('❌ Failed to submit form:', error.response?.data?.message || error.message);
    }
  });
};

export const useDeleteSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submissionsApi.deleteSubmission,
    onSuccess: (_, submissionId) => {
      // Invalidate all submissions queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBMISSIONS] });
      
      // Remove specific submission from cache
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.SUBMISSION, submissionId] });
      
      console.log('✅ Submission deleted successfully');
    }
  });
};

// File Upload Hook
export const useFileUpload = () => {
  return useMutation({
    mutationFn: ({ file, fieldId }: { file: File; fieldId: string }) => filesApi.uploadFile(file, fieldId),
    onError: (error:any) => {
      console.error('❌ Failed to upload file:', error.response?.data?.message || error.message);
    }
  });
};

// Export CSV Hook
export const useExportSubmissions = () => {
  return useMutation({
    mutationFn: submissionsApi.exportSubmissions,
    onSuccess: (response:any, formId) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `form_${formId}_submissions.csv`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Submissions exported successfully');
    },
    onError: (error:any) => {
      console.error('❌ Failed to export submissions:', error.response?.data?.message || error.message);
    }
  });
};