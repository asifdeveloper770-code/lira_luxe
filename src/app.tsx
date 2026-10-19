import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

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
import FAQ from "./pages/faq";
import Shipping from "./pages/shipping";
import Returns from "./pages/returns";

// React Router keeps the old scroll position when you change page, so a footer link
// looked like it "did nothing". Go to the top (or to the #section) on every navigation.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const t = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 96;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 60);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);
  return null;
}


export default function App() {
  return (
    <>
      <IntroOverlay />
      <ScrollToTop />

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
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
        </Routes>
      </Layout>
    </>
  );
}
