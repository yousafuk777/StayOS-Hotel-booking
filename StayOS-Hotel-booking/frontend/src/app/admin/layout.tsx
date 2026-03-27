import AdminLayout from '@/components/admin/AdminShell'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
