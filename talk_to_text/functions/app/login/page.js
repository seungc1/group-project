'use client';

import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('Google 로그인 실패!');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>TalkToText</h1>
      <p className={styles.subtitle}>Google 계정으로 시작하세요.</p>
      <button className={styles.loginBtn} onClick={handleLogin}>
        Google로 계속하기
      </button>
    </div>
  );
}
// 'use client';

// import { auth } from '@/lib/firebase';
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// import { useRouter } from 'next/navigation';

// export default function LoginPage() {
//   const router = useRouter();

//   const handleGoogleLogin = async () => {
//     try {
//       const provider = new GoogleAuthProvider();
//       await signInWithPopup(auth, provider);
//       router.push('/dashboard'); // 로그인 후 이동할 경로
//     } catch (err) {
//       console.error('Google 로그인 실패:', err);
//       alert('로그인에 실패했습니다.');
//     }
//   };

//   return (
//     <main className="flex flex-col items-center justify-center h-screen">
//       <h1 className="text-2xl font-bold mb-4">로그인</h1>
//       <button
//         onClick={handleGoogleLogin}
//         className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
//       >
//         Google로 로그인하기
//       </button>
//     </main>
//   );
// }

// // 'use client';

// // import { useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { useAuth } from '@/app/context/AuthContext';
// // import Header from '../components/ui/layout/Header/index';

// // export default function Login() {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [error, setError] = useState('');
// //   const router = useRouter();
// //   const { login } = useAuth();

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       await login(email, password);
// //       router.push('/');
// //     } catch (err) {
// //       setError('이메일 또는 비밀번호가 올바르지 않습니다.');
// //     }
// //   };

// //   return (
// //     <>
// //       <Header title="로그인" />
// //       <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
// //         <div className="sm:mx-auto sm:w-full sm:max-w-md">
// //           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
// //             로그인
// //           </h2>
// //         </div>

// //         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
// //           <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
// //             <form className="space-y-6" onSubmit={handleSubmit}>
// //               {error && (
// //                 <div className="text-red-500 text-sm text-center">{error}</div>
// //               )}
// //               <div>
// //                 <label htmlFor="email" className="block text-sm font-medium text-gray-700">
// //                   이메일
// //                 </label>
// //                 <div className="mt-1">
// //                   <input
// //                     id="email"
// //                     name="email"
// //                     type="email"
// //                     autoComplete="email"
// //                     required
// //                     value={email}
// //                     onChange={(e) => setEmail(e.target.value)}
// //                     className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
// //                   />
// //                 </div>
// //               </div>

// //               <div>
// //                 <label htmlFor="password" className="block text-sm font-medium text-gray-700">
// //                   비밀번호
// //                 </label>
// //                 <div className="mt-1">
// //                   <input
// //                     id="password"
// //                     name="password"
// //                     type="password"
// //                     autoComplete="current-password"
// //                     required
// //                     value={password}
// //                     onChange={(e) => setPassword(e.target.value)}
// //                     className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
// //                   />
// //                 </div>
// //               </div>

// //               <div>
// //                 <button
// //                   type="submit"
// //                   className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
// //                 >
// //                   로그인
// //                 </button>
// //               </div>
// //             </form>
// //           </div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // } 