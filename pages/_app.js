import React from 'react'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        html, body {
          background: #181410;
          color: #F2EADD;
          font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        ::-webkit-scrollbar {
          width: 0;
        }
        a {
          text-decoration: none;
        }
        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 999px;
          outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #F2EADD;
          cursor: pointer;
          border: 3px solid #D08560;
        }
        input[type=range]::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #F2EADD;
          cursor: pointer;
          border: 3px solid #D08560;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        .fade-in { animation: fadeIn 0.5s ease both; }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Sacramento&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Nunito+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
