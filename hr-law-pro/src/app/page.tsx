import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/actions'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect('/admin')
  } else {
    redirect('/login')
  }
}