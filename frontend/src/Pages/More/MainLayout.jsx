import { Outlet } from "react-router-dom";

const MainLayout = () => {

  return (
    <div className="relative">
      <div className="z-10">
        <Outlet />
      </div>
      <div className=" w-full">

      </div>

    </div>
  );
};

export default MainLayout;
