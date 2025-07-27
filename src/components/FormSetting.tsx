import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Label } from '@radix-ui/react-label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

const FormSetting = ({ formSettings, setFormSettings, selectedForm, setForms }: any) => {
    
    const updateFormSettings = (updates: any) => {
        const newSettings = { ...formSettings, ...updates };
        setFormSettings(newSettings);
        
        // Auto-save to forms array if form is selected
        if (selectedForm && setForms) {
            setForms((prevForms: any[]) =>
                prevForms.map((form: any) =>
                    form.id === selectedForm.id 
                        ? { 
                            ...form, 
                            title: newSettings.title,
                            description: newSettings.description 
                          }
                        : form
                )
            );
        }
    };
    return (
        <div>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Form Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="form-title" className='mb-2'>Form Title</Label>
                        <Input
                            id="form-title"
                            value={formSettings.title}
                            onChange={(e) => updateFormSettings({ title: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="form-description" className='mb-2'>Description</Label>
                        <Textarea
                            id="form-description"
                            value={formSettings.description}
                            onChange={(e) => updateFormSettings({ description: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="thank-you-message" className='mb-2'>Thank You Message</Label>
                        <Textarea
                            id="thank-you-message"
                            value={formSettings.thankYouMessage}
                            onChange={(e) => updateFormSettings({ thankYouMessage: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default FormSetting