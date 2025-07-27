import { Button } from './ui/button'
import { BarChart3, Copy, Edit, Plus, Trash2, Link } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

const Dashboard = ({createNewForm,forms,editForm,duplicateForm,deleteForm,toggleFormStatus,viewSubmissions,copyFormUrl}:any) => {
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">My Forms</h2>
                <Button onClick={createNewForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Form
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form:any) => (
                    <Card key={form.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{form.title}</CardTitle>
                                    <CardDescription>{form.description}</CardDescription>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant={form.status === 'published' ? 'default' : 'secondary'}
                                    onClick={() => toggleFormStatus(form.id)}
                                    className="text-xs px-2 py-1 h-auto"
                                >
                                    {form.status}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm text-gray-600 mb-4">
                                <span>{form.submissions} submissions</span>
                                <span>Created {form.createdAt}</span>
                            </div>
                            <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => editForm(form)} title="Edit form">
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => copyFormUrl(form.id)}
                                    disabled={form.status !== 'published'}
                                    title={form.status === 'published' ? 'Copy form URL' : 'Form must be published to share'}
                                >
                                    <Link className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => duplicateForm(form)} title="Duplicate form">
                                    <Copy className="w-4 h-4" />
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => viewSubmissions(form)}
                                    title="View submissions"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    {form.submissions > 0 && (
                                        <span className="ml-1 text-xs">{form.submissions}</span>
                                    )}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteForm(form.id)} title="Delete form">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default Dashboard