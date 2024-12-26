import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WatchlistAccountTransaction } from '@/hooks/use-websocket-connection';
import { cn } from '@/lib/utils';
import { Account } from '../account';
import { Signature } from '../signature';

interface TransactionsTableProps {
  transactions: WatchlistAccountTransaction[];
}

export default function TransactionsTable({
  transactions,
}: TransactionsTableProps) {
  return transactions.length > 0 ? (
    <Table>
      <TableHeader>
        <TableRow className={cn('border-b border-white/20')}>
          <TableHead className="text-high-contrast-text font-semibold">
            Signature
          </TableHead>
          <TableHead className="text-high-contrast-text font-semibold">
            From
          </TableHead>
          <TableHead className="text-high-contrast-text font-semibold">
            To
          </TableHead>
          <TableHead className="text-high-contrast-text font-semibold">
            Action
          </TableHead>
          <TableHead className="text-high-contrast-text font-semibold">
            Timestamp
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow
            key={tx.concernedAddress + tx.action.signature}
            className={cn(
              'border-b border-white/20 hover:bg-white/10 transition-colors'
            )}
          >
            <TableCell className="text-high-contrast-text">
              <Signature signature={tx.action.signature} link />
            </TableCell>
            <TableCell className="text-high-contrast-text">
              {tx.action.from ? (
                <>
                  {tx.concernedAddress === tx.action.from ? (
                    <>
                      {tx.label} (<Account address={tx.action.from} link />)
                    </>
                  ) : (
                    <Account address={tx.action.from} link />
                  )}
                </>
              ) : (
                'N/A'
              )}
            </TableCell>
            <TableCell className="text-high-contrast-text">
              {tx.action.to ? (
                <>
                  {tx.concernedAddress === tx.action.to ? (
                    <>
                      {tx.label} (<Account address={tx.action.to} link />)
                    </>
                  ) : (
                    <Account address={tx.action.to} link />
                  )}
                </>
              ) : (
                'N/A'
              )}
            </TableCell>
            <TableCell className="text-high-contrast-text">
              {tx.action.action}
            </TableCell>
            <TableCell className="text-high-contrast-text">
              {new Date(tx.action.timestamp).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <p className="w-full text-center p-3">No transaction to be displayed</p>
  );
}
