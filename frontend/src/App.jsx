import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Pages/Home/Home";
import MainLayout from "./Pages/More/MainLayout";
import PDF from "./Pages/Home/PDF";
import ThankYouPage from "./Pages/Home/Thanks";

function App() {
  const router = createBrowserRouter([
    {
      path:"/",
      element:<MainLayout/>,
      children:[
        {
          path: "/",
          element: <Home/>,
        },
        {
          path: "/PDF",
          element: <PDF/>,
        },
        {
          path: "/thanks",
          element: <ThankYouPage/>,
        },
      ]
    }
  ]);
  return (
    <div className="App">
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
