'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WatchlistAccountTransaction } from '@/hooks/use-websocket-connection';
import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import { Account } from '../account';
import { Signature } from '../signature';

interface TransactionsTableProps {
  transactions: WatchlistAccountTransaction[];
}

export default function TransactionsTable({
  transactions,
}: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg bg-purple-800/20 text-purple-100/60">
        No transaction to be displayed
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-purple-800/20">
      <Table>
        <TableHeader>
          <TableRow className="border-purple-600/20 hover:bg-transparent">
            <TableHead className="text-purple-100/60">Signature</TableHead>
            <TableHead className="text-purple-100/60">From</TableHead>
            <TableHead className="text-purple-100/60">To</TableHead>
            <TableHead className="text-purple-100/60">Action</TableHead>
            <TableHead className="text-purple-100/60">Timestamp</TableHead>
            <TableHead className="text-purple-100/60">Success</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence initial={false}>
            {transactions.map((tx) => (
              <motion.tr
                key={tx.action.signature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="border-purple-600/20 hover:bg-purple-700/20 transition-colors"
              >
                <TableCell className="font-mono text-sm">
                  <Signature signature={tx.action.signature} link />
                </TableCell>
                <TableCell>
                  {tx.action.from ? (
                    <div className="flex items-center space-x-2">
                      <Account address={tx.action.from} />
                      {tx.concernedAddress === tx.action.from && tx.label && (
                        <span className="text-purple-300/60">({tx.label})</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-purple-300/60">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {tx.action.to ? (
                    <div className="flex items-center space-x-2">
                      <Account address={tx.action.to} />
                      {tx.concernedAddress === tx.action.to && tx.label && (
                        <span className="text-purple-300/60">({tx.label})</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-purple-300/60">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="inline-flex px-2 py-1 rounded-full bg-purple-600/20 text-purple-200 text-sm">
                    {tx.action.action}
                  </span>
                </TableCell>
                <TableCell className="text-purple-100/60">
                  {new Date(tx.action.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="text-purple-100/60">
                  {tx.action.success ? (
                    <span className="px-2 py-1 rounded-full bg-green-500 text-purple-200">
                      Yes
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-red-500 text-purple-200">
                      No
                    </span>
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
