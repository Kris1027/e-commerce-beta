import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminNav from '@/components/admin/admin-nav';
import { UserRole } from '@prisma/client';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== UserRole.admin) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav />
      <main className="flex-1 bg-muted/40 overflow-x-hidden">
        <div className="container mx-auto p-6">
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}