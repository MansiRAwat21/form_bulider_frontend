import { Route, Routes } from 'react-router-dom'
import './App.css'
import FormBuilders from './pages/FormBuildersWithApi'
import PublicForm from './pages/PublicFormWithApi'
import QueryProvider from './providers/QueryProvider'

function App() {
  return (
    <QueryProvider>
      <Routes>
        <Route path="/" element={<FormBuilders />} />
        <Route path="/form/:formId" element={<PublicForm />} />
      </Routes>
    </QueryProvider>
  )
}

export default App
