'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { CreditCard } from 'lucide-react';

const CustomerPortalBtn = ({ disabled }: { disabled?: boolean }) => {
  return (
    <Button
      className='hover:cursor-pointer'
      disabled={disabled}
      onClick={async () => {
        await authClient.customer.portal();
      }}
    >
      <CreditCard className='mr-2 h-4 w-4' />
      Open Customer Portal
    </Button>
  );
};

export default CustomerPortalBtn;
