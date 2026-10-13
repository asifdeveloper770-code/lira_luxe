import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app";
import "./styles.css";

import { CartProvider } from "./components/CartContext";
import { SiteImagesProvider } from "./lib/site-images";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteImagesProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </SiteImagesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
