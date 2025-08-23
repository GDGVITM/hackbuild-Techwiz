// 'use client';

// import { useAuth } from '@/context/AuthContext';
// import { useEffect, useState } from 'react';

// export default function DebugPage() {
//   const { user, token, isAuthenticated, loading } = useAuth();
//   const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);
//   const [cookies, setCookies] = useState<string>('');
//   const [healthStatus, setHealthStatus] = useState<any>(null);
//   const [authMeStatus, setAuthMeStatus] = useState<any>(null);

//   useEffect(() => {
//     // Get token from localStorage
//     const storedToken = localStorage.getItem('authToken');
//     setLocalStorageToken(storedToken);

//     // Get cookies
//     setCookies(document.cookie);
//   }, []);

//   const testHealth = async () => {
//     try {
//       const response = await fetch('/api/health');
//       const data = await response.json();
//       setHealthStatus(data);
//     } catch (error) {
//       setHealthStatus({ error: error.message });
//     }
//   };

//   const testAuthMe = async () => {
//     try {
//       const response = await fetch('/api/auth/me', {
//         credentials: 'include'
//       });
//       const data = await response.json();
//       setAuthMeStatus(data);
//     } catch (error) {
//       setAuthMeStatus({ error: error.message });
//     }
//   };

//   return (
//     <div className="container mx-auto p-8">
//       <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>

//       <div className="space-y-4">
//         <div className="bg-gray-100 p-4 rounded">
//           <h2 className="font-semibold mb-2">AuthContext State:</h2>
//           <pre className="text-sm">
//             {JSON.stringify({
//               loading,
//               isAuthenticated,
//               user,
//               hasToken: !!token,
//               tokenLength: token?.length
//             }, null, 2)}
//           </pre>
//         </div>

//         <div className="bg-gray-100 p-4 rounded">
//           <h2 className="font-semibold mb-2">LocalStorage:</h2>
//           <pre className="text-sm">
//             {JSON.stringify({
//               hasStoredToken: !!localStorageToken,
//               storedTokenLength: localStorageToken?.length,
//               hasStoredUser: !!localStorage.getItem('authUser')
//             }, null, 2)}
//           </pre>
//         </div>

//         <div className="bg-gray-100 p-4 rounded">
//           <h2 className="font-semibold mb-2">Cookies:</h2>
//           <pre className="text-sm">{cookies}</pre>
//         </div>

//         <div className="bg-gray-100 p-4 rounded">
//           <h2 className="font-semibold mb-2">API Tests:</h2>
//           <div className="space-y-2">
//             <button 
//               onClick={testHealth}
//               className="bg-green-500 text-white px-4 py-2 rounded mr-2"
//             >
//               Test /api/health
//             </button>
//             <button 
//               onClick={testAuthMe}
//               className="bg-blue-500 text-white px-4 py-2 rounded"
//             >
//               Test /api/auth/me
//             </button>
//           </div>

//           {healthStatus && (
//             <div className="mt-4">
//               <h3 className="font-medium">Health Status:</h3>
//               <pre className="text-sm bg-white p-2 rounded mt-1">
//                 {JSON.stringify(healthStatus, null, 2)}
//               </pre>
//             </div>
//           )}

//           {authMeStatus && (
//             <div className="mt-4">
//               <h3 className="font-medium">Auth/me Status:</h3>
//               <pre className="text-sm bg-white p-2 rounded mt-1">
//                 {JSON.stringify(authMeStatus, null, 2)}
//               </pre>
//             </div>
//           )}
//         </div>

//         <div className="bg-gray-100 p-4 rounded">
//           <h2 className="font-semibold mb-2">Quick Actions:</h2>
//           <div className="space-y-2">
//             <button 
//               onClick={() => {
//                 localStorage.clear();
//                 window.location.reload();
//               }}
//               className="bg-red-500 text-white px-4 py-2 rounded mr-2"
//             >
//               Clear LocalStorage & Reload
//             </button>
//             <button 
//               onClick={() => {
//                 window.location.href = '/auth/login';
//               }}
//               className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
//             >
//               Go to Login
//             </button>
//             <button 
//               onClick={() => {
//                 window.location.href = '/dashboard/business';
//               }}
//               className="bg-green-500 text-white px-4 py-2 rounded"
//             >
//               Test Business Dashboard
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function DebugPage() {
  const { user, token, isAuthenticated, loading } = useAuth();
  const [cookieToken, setCookieToken] = useState<string | null>(null);
  const [cookies, setCookies] = useState<string>('');
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [authMeStatus, setAuthMeStatus] = useState<any>(null);

  useEffect(() => {
    // Get token from cookies
    const storedToken = Cookies.get('authToken');
    setCookieToken(storedToken);
    // Get all cookies
    setCookies(document.cookie);
  }, []);

  const testHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      setHealthStatus({ error: error.message });
    }
  };

  const testAuthMe = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      const data = await response.json();
      setAuthMeStatus(data);
    } catch (error) {
      setAuthMeStatus({ error: error.message });
    }
  };

  const clearCookiesAndReload = () => {
    // Clear all cookies
    const allCookies = document.cookie.split(';');
    for (let i = 0; i < allCookies.length; i++) {
      const cookie = allCookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">AuthContext State:</h2>
          <pre className="text-sm">
            {JSON.stringify({
              loading,
              isAuthenticated,
              user,
              hasToken: !!token,
              tokenLength: token?.length
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Cookies:</h2>
          <pre className="text-sm">
            {JSON.stringify({
              hasCookieToken: !!cookieToken,
              cookieTokenLength: cookieToken?.length,
              allCookies: cookies
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">API Tests:</h2>
          <div className="space-y-2">
            <button
              onClick={testHealth}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
              Test /api/health
            </button>
            <button
              onClick={testAuthMe}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Test /api/auth/me
            </button>
          </div>

          {healthStatus && (
            <div className="mt-4">
              <h3 className="font-medium">Health Status:</h3>
              <pre className="text-sm bg-white p-2 rounded mt-1">
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            </div>
          )}

          {authMeStatus && (
            <div className="mt-4">
              <h3 className="font-medium">Auth/me Status:</h3>
              <pre className="text-sm bg-white p-2 rounded mt-1">
                {JSON.stringify(authMeStatus, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Quick Actions:</h2>
          <div className="space-y-2">
            <button
              onClick={clearCookiesAndReload}
              className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            >
              Clear Cookies & Reload
            </button>
            <button
              onClick={() => {
                window.location.href = '/auth/login';
              }}
              className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
            >
              Go to Login
            </button>
            <button
              onClick={() => {
                window.location.href = '/dashboard/business';
              }}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Test Business Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}