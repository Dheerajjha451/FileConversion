import  { createContext, useState, useContext } from 'react';

// Create the context
const FilesContext = createContext();

// Create a provider component
export const FilesProvider = ({ children }) => {
    const [files, setFile] = useState([]);

    return (
        <FilesContext.Provider value={{ files, setFile }}>
            {children}
        </FilesContext.Provider>
    );
};

// Custom hook for using the Files context
export const useFiles = () => useContext(FilesContext);
