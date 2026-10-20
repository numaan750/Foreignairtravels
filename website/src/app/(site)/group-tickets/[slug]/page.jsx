import GroupTicketListing from '@/home-components/group-tickets/GroupTicketListing'

export const instant = false

export default async function GroupTicketCategoryPage({ params }) {
  const { slug } = await params
  return <GroupTicketListing slug={slug} />
}
