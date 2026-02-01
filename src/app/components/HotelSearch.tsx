import { useEffect } from "react";

declare global {
  interface Window {
    EGWidgets?: {
      init: () => void;
    };
  }
}

export function HotelSearch() {
  useEffect(() => {
    const scriptId = "expedia-widget-script";

    const initWidget = () => {
      if (window.EGWidgets && typeof window.EGWidgets.init === "function") {
        window.EGWidgets.init();
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js";
      script.async = true;

      script.onload = () => {
        initWidget();
      };

      document.body.appendChild(script);
    } else {
      // Script já existe → só inicializa
      initWidget();
    }
  }, []);

  return (
    <div className="mb-6 w-full lg:w-[80%] mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">
        🏨 Buscar Hospedagem
      </h2>

      <div
        className="eg-widget bg-white rounded-xl shadow-sm border border-gray-200"
        data-widget="search"
        data-program="br-hcom"
        data-lobs="stays"
        data-network="pz"
        data-camref="1100l5D8Wx"
        data-pubref=""
      />
    </div>
  );
}
