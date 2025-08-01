import { useState } from 'react'
import { Route, Routes } from "react-router-dom";
import { RegisterProject } from "./components/RegisterProject";
import { Projects } from "./components/Projects";
import { ProjectDetail } from "./components/ProjectDetail";
import Layout from './components/Layout';

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
      </Routes>
    </div>
  )
}

export default App