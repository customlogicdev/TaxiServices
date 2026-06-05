// app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/login'); }, [router]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC' }}>
      <p style={{ color: '#64748B', fontSize: '18px' }}>Redirecting to admin panel...</p>
    </div>
  );
}
// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function Home() {
//   const router = useRouter();

//   useEffect(() => {
//     router.replace('/admin/login');
//   }, [router]);

//   return (
//     <div style={{
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       height: '100vh',
//       background: '#F8FAFC',
//     }}>
//       <p style={{ color: '#64748B', fontSize: '18px' }}>Redirecting to admin panel...</p>
//     </div>
//   );
// }