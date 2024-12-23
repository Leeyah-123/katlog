'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AccountAction } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AccountActionsProps {
  address: string;
}

export default function AccountActions({ address }: AccountActionsProps) {
  const [actions, setActions] = useState<AccountAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await fetch(`/api/account/${address}`);
        const data = await response.json();
        setActions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching account actions:', error);
        setLoading(false);
      }
    };

    fetchActions();

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(
      `wss://solana-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    );

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_subscribe',
          params: ['logs', { address: [address] }],
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'eth_subscription') {
        // New transaction detected, fetch updated actions
        fetchActions();
      }
    };

    return () => {
      ws.close();
    };
  }, [address]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className={cn('border-b border-white/10')}>
          <TableHead className="text-high-contrast-text font-semibold">
            Type
          </TableHead>
          <TableHead className="text-high-contrast-text font-semibold">
            Amount
          </TableHead>
          <TableHead className="text-high-contrast-text font-semibold">
            From
          </TableHead>
          <TableHead className="text-high-contrast-text font-semibold">
            To
          </TableHead>
          <TableHead className="text-high-contrast-text font-semibold">
            Description
          </TableHead>
          <TableHead className="text-high-contrast-text font-semibold">
            Timestamp
          </TableHead>
          <TableHead className="text-high-contrast-text font-semibold">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actions.map((action) => (
          <TableRow
            key={action.signature}
            className={cn(
              'border-b border-white/10 hover:bg-white/5 transition-colors'
            )}
          >
            {/* <TableCell className="text-high-contrast-text">
              {action.type}
            </TableCell>
            <TableCell className="text-high-contrast-text">
              {action.amount ? `${action.amount} SOL` : 'N/A'}
            </TableCell>
            <TableCell className="text-high-contrast-text">
              {action.from ? <Account address={action.from} /> : 'N/A'}
            </TableCell>
            <TableCell className="text-high-contrast-text">
              {action.to ? <Account address={action.to} /> : 'N/A'}
            </TableCell>
            <TableCell className="text-high-contrast-text">
              {action.description}
            </TableCell>
            <TableCell className="text-high-contrast-text">
              {new Date(action.timestamp * 1000).toLocaleString()}
            </TableCell> */}
            <TableCell>
              <Button
                asChild
                variant="outline"
                className={cn(
                  'text-solana-green hover:text-high-contrast-text hover:bg-solana-green transition-colors'
                )}
              >
                <Link href={`/account/${address}/action/${action.signature}`}>
                  View Details
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
