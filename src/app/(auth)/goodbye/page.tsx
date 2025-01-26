export default function GoodbyePage() {
  return (
    <div className='container max-w-md py-12'>
      <div className='space-y-6 text-center'>
        <h1 className='text-3xl font-bold'>Account Deleted</h1>
        <p className='text-muted-foreground'>
          Your account has been successfully deleted. We&rsquo;re sorry to see you go!
        </p>
        <p className='text-muted-foreground'>If you change your mind, you can always create a new account.</p>
      </div>
    </div>
  );
}
