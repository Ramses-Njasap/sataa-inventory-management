/** @type {import('tailwindcss').Config} */
   module.exports = {
     content: ['./src/renderer/src/**/*.{jsx,js}'],
     theme: {
       extend: {
         colors: {
           zinc: {
             50: '#fafafa',
             100: '#f4f4f5',
             200: '#e5e7eb',
             500: '#6b7280',
             800: '#1f2937',
           },
           slate: {
             50: '#f8fafc',
             100: '#f1f5f9',
             200: '#e2e8f0',
             300: '#cbd5e1',
             600: '#475569',
             900: '#0f172a',
           },
           rose: {
             50: '#fff1f2',
             200: '#fecdd3',
             400: '#f43f5e',
           },
         },
       },
     },
     plugins: [],
};