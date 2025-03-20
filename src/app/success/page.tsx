export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { checkout_id } = await searchParams;
  return <div>Thank you! Your checkout is now being processed. Your checkout ID is {checkout_id}</div>;
}
