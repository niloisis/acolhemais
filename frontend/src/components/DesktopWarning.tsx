import { useState, useEffect } from "react";

export default function DesktopWarning() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth > 450);
    };

    checkScreenSize(); // Verifica no primeiro render
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!isDesktop) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <img src="public/images/window_alert.png" alt="Acesse pelo celular" className="max-w-full max-h-full" />
      </div>
      <style>
        {`
          body {
            overflow: hidden; 
          }
        `}
      </style>
    </>
  );
  
}