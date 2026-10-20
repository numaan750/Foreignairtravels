import GroupTicketListing from '@/home-components/group-tickets/GroupTicketListing'

export default async function GroupTicketCategoryPage({ params }) {
  const { slug } = await params
  return <GroupTicketListing slug={slug} />
}
