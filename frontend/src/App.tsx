import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import { AdminPage } from "./Pages/AdminPage";
import { ReviewsPage } from "./Pages/ReviewsPage";
import { HomePage } from "./Pages/HomePage";
import { ProductDetailsPage } from "./Pages/ProductDetailsPage";
import { DemoPage } from "./Pages/DemoPage";
import { ContactPage } from "./Pages/ContactPage";
import { SuccessPage } from "./Pages/SuccessPage";
import { CancelPage } from "./Pages/CancelPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Shared site chrome stays around the page routes below. */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/details" element={<ProductDetailsPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
