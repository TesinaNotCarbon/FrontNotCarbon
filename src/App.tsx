import { Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RegisterProject } from "./components/RegisterProject";
import { Projects } from "./components/Projects";
import { ProjectDetail } from "./components/ProjectDetail";
import Layout from './components/Layout';
import { Companies } from "./components/Companies";
import { RegisterCompany } from "./components/RegisterCompany";
import { CompanyDetail } from "./components/CompanyDetail";
import { Admin } from "./components/Admin";
function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={
          <Layout>
            <Projects />
          </Layout>
        } />
        <Route path="/register" element={
          <Layout>
            <RegisterProject />
          </Layout>
        } />
        <Route path="/project/:contractAddress" element={
          <Layout>
            <ProjectDetail />
          </Layout>
        } />
        <Route path="/companies" element={
          <Layout>
            <Companies />
          </Layout>
        } />
        <Route path="/register-company" element={
          <Layout>
            <RegisterCompany />
          </Layout>
        } />
        <Route path="/company/:companyAddress" element={
          <Layout>
            <CompanyDetail />
          </Layout>
        } />
        <Route path="/admin" element={
          <Layout>
            <Admin />
          </Layout>
        } />
      </Routes>
      <ToastContainer />
    </div>
  )
}

export default App