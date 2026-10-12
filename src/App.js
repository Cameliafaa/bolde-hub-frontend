import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Overview from "./pages/overview/overview";
import ProgramCenter from "./pages/programCenter/programCenter";
import ProgramDetail from "./pages/programCenter/programDetail";
import DevelopmentCenter from "./pages/developmentCenter/developmentCenter";
import DevelopmentDetail from "./pages/developmentCenter/developmentDetail";
import SalesToolsKit from "./pages/salesTools/salesToolsKit";
import Profile from "./pages/profile/profile";
import Login from "./pages/auth/login";
import Position from "./pages/masterData/position/position";
import Channel from "./pages/masterData/channel";
import Access from "./pages/userManagement/access/access";
import Certificate from "./pages/masterData/certificate";
import ResetPassword from "./pages/auth/resetPassword";
import LetterDetail from "./pages/circularLetter/letterDetail";
import Feedback from "./pages/salesTools/feedback/feedback";
import TaskDetail from "./pages/requestToMarketing/taskDetail";
import Employee from "./pages/userManagement/employee/employee";
import SalesToolsCategory from "./pages/salesTools/salesToolsCategory";
import SalesToolsFile from "./pages/salesTools/salesToolsFile";
import EditProfile from "./pages/profile/editProfile";
import ChangePassword from "./pages/profile/changePassword";
import UserApproval from "./pages/masterData/userApproval/userApproval";
import ApprovalProvider from "./context/approvalProvider";
import ProfileDevelopmentDetail from "./pages/profile/detailDevelopment";
import NewsDetail from "./components/overview/news/detailNews";
import News from "./pages/masterData/news/news";
import ProductManagement from "./pages/masterData/productManagement.jsx/productManagement";
import ExcelViewer from "./utils/excelViewer/excelViewer";
import SubMenus from "./pages/masterData/subMenu/subMenu";
import { MenuProvider } from "./context/menuContext";
import AreaProvinceManagement from "./pages/masterData/province/areaContainer";
import Store from "./pages/masterData/store/store";
import Banner from "./pages/masterData/banner/banner";
import SummaryDetail from "./components/overview/summary/summaryDetail";
import CompanyProfile from "./pages/companyprofile/companyProfile";
import Survey from "./pages/masterData/survey/survey";
import SurveyUserList from "./pages/survey/survey";
import SurveyUserFill from "./pages/survey/surveyFill";
import SurveyDetail from "./pages/masterData/survey/surveyDetail";
import { CircularSummaryProvider } from "./context/circularSummaryContext";
import SignUp from "./pages/auth/signUp";
import WarrantyClaims from "./pages/warranty/warranty";
import WarrantyDetail from "./pages/warranty/warrantyDetail";
import CircularLetter from "./pages/circularLetter/circularLetter";
import SummaryDetailSpecial from "./components/overview/summary/summaryDetailSpecial";
import AnnouncementPage from "./pages/overview/announcement/announcement";
import Announcement from "./pages/masterData/announcement/announcement";
import AnnouncementDetailPage from "./pages/overview/announcement/announcementDetail";
import { initOneSignal } from "./utils/oneSignal/oneSignal";
import ReportAutomationDashboard from "./pages/report/reportReal";
import TaskWorkspace from "./pages/report/taskWorkspace";
import TaskReportDetail from "./pages/report/taskDetail";
import RequestToMarketing from "./pages/requestToMarketing/rtm";
import AccessCategory from "./pages/userManagement/accessCategories/accessCategories";
import ApprovalWorkspace from "./pages/report/approvalWorkspace";
import TeamWorkspace from "./pages/report/teamworkspace";
import DevelopmentCategory from "./pages/masterData/devCategory/devCategory";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));

    const userId = user?.user_id || user?.id;

    if (userId) {
      initOneSignal(user);
    }
  }, []);

  return (
    <Router>
      <ApprovalProvider>
        <MenuProvider>
          <CircularSummaryProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/excel-viewer" element={<ExcelViewer />} />

              <Route
                path="/*"
                element={
                  <div className="min-h-screen bg-gray-50">
                    <Sidebar
                      isOpen={isSidebarOpen}
                      setIsOpen={setIsSidebarOpen}
                    />

                    <main
                      className={`
      min-h-screen
      min-w-0
      overflow-x-hidden
      py-8
      transition-all
      duration-300

      px-4
      sm:px-5
      md:px-6
      lg:px-6
      xl:px-5
      2xl:px-6

      ${
        isSidebarOpen
          ? "lg:ml-[20rem] lg:w-[calc(100%-20rem)]"
          : "lg:ml-[6.5rem] lg:w-[calc(100%-6.5rem)]"
      }
    `}
                    >
                      <Routes>
                        <Route path="/overview" element={<Overview />} />
                        <Route
                          path="/overview/announcement"
                          element={<AnnouncementPage />}
                        />
                        <Route
                          path="/overview/announcement/:id"
                          element={<AnnouncementDetailPage />}
                        />
                        <Route
                          path="/summary/regular/:id"
                          element={<SummaryDetail />}
                        />
                        <Route
                          path="/summary/special/:id"
                          element={<SummaryDetailSpecial />}
                        />
                        <Route path="/news/:id" element={<NewsDetail />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route
                          path="/profile/development/:id"
                          element={<ProfileDevelopmentDetail />}
                        />
                        <Route path="/edit-profile" element={<EditProfile />} />
                        <Route
                          path="/change-password"
                          element={<ChangePassword />}
                        />
                        <Route path="/circular" element={<CircularLetter />} />
                        <Route
                          path="/circular/:id"
                          element={<LetterDetail />}
                        />
                        <Route
                          path="/program-center"
                          element={<ProgramCenter />}
                        />
                        <Route
                          path="/program-detail/:id"
                          element={<ProgramDetail />}
                        />
                        <Route
                          path="/development"
                          element={<DevelopmentCenter />}
                        />
                        <Route
                          path="/development-detail/:id"
                          element={<DevelopmentDetail />}
                        />
                        {/* <Route
                      path="/development-assignment/:developmentId/:videoTitle"
                      element={<DevelopmentQuiz />}
                    /> */}
                        <Route
                          path="/sales-tools"
                          element={<SalesToolsKit />}
                        />
                        <Route
                          path="/sales-tools/:categoryId"
                          element={<SalesToolsCategory />}
                        />
                        <Route
                          path="/sales-tools/files/:categoryId/:folderId"
                          element={<SalesToolsFile />}
                        />
                        <Route path="/feedback" element={<Feedback />} />
                        <Route
                          path="/request"
                          element={<RequestToMarketing />}
                        />
                        <Route
                          path="/request/task-detail/:id"
                          element={<TaskDetail />}
                        />
                        <Route
                          path="/warranty-claims"
                          element={<WarrantyClaims />}
                        />
                        <Route
                          path="/warranty-claims/detail/:id"
                          element={<WarrantyDetail />}
                        />

                        <Route
                          path="/province"
                          element={<AreaProvinceManagement />}
                        />
                        <Route path="/store" element={<Store />} />
                        <Route path="/positions" element={<Position />} />
                        {/* <Route path="/areas" element={<Area />} /> */}
                        <Route
                          path="/areas"
                          element={<AreaProvinceManagement />}
                        />
                        <Route path="/channels" element={<Channel />} />
                        <Route
                          path="/program-categories"
                          element={<ProductManagement />}
                        />
                        <Route path="/approval" element={<UserApproval />} />
                        <Route path="/certificate" element={<Certificate />} />
                        <Route path="/news" element={<News />} />
                        <Route path="/survey" element={<Survey />} />
                        <Route
                          path="/survey/:surveyId/responses"
                          element={<SurveyDetail />}
                        />
                        <Route path="/sub-menus" element={<SubMenus />} />
                        <Route path="/banner" element={<Banner />} />
                        <Route
                          path="/announcement"
                          element={<Announcement />}
                        />
                        <Route
                          path="/dev-categories"
                          element={<DevelopmentCategory />}
                        />

                        <Route path="/access" element={<Access />} />
                        <Route
                          path="/access-category"
                          element={<AccessCategory />}
                        />
                        <Route path="/employee" element={<Employee />} />

                        <Route
                          path="/company-profile"
                          element={<CompanyProfile />}
                        />
                        <Route
                          path="/report-automation"
                          element={<ReportAutomationDashboard />}
                        />
                        <Route
                          path="/report-automation/tasks"
                          element={<TaskWorkspace />}
                        />
                        <Route
                          path="/report-automation/team"
                          element={<TeamWorkspace />}
                        />
                        <Route
                          path="/report-automation/task-detail/:id"
                          element={<TaskReportDetail />}
                        />
                        <Route
                          path="/report-automation/approvals"
                          element={<ApprovalWorkspace />}
                        />
                        <Route
                          path="/survey-user"
                          element={<SurveyUserList />}
                        />
                        <Route
                          path="/survey-user/:surveyId"
                          element={<SurveyUserFill />}
                        />
                      </Routes>
                    </main>
                  </div>
                }
              />
            </Routes>
          </CircularSummaryProvider>
        </MenuProvider>
      </ApprovalProvider>
    </Router>
  );
};

export default App;
