import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout";
import IntroOverlay from "./components/IntroOverlay";


import Home from "./pages/index";
import About from "./pages/about";
import Shop from "./pages/shop";
import Contact from "./pages/contact";
import Cart from "./pages/cart";
import CheckoutPage from "./pages/checkout";
import PaymentSuccess from "./pages/payment-success";
// import PaymentCancel from "./pages/payment-cancel";
// import shop from "/pages/shop";
import Account from "./pages/account";
import Collection from "./pages/collections";
import AdminDashboard from "./pages/admin-dashboard";


export default function App() {
  return (
    <>
      <IntroOverlay />

      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/collections/:slug" element={<Collection />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          {/* <Route path="/payment-cancel" element={<PaymentCancel />} /> */}
          {/* <Route path="/shop" element={<shop />} /> */}
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </>
  );
}