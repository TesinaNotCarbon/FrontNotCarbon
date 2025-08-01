import React from "react";
import { Navbar } from "./Navbar";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

  return (
    <div className="w-full h-full">
      <div className="w-full h-full">
        <Navbar/>
        {children}
      </div>
    </div>
  );
};

export default Layout;