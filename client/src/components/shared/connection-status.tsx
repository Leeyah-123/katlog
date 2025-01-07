'use client';

import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected';
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const [showConnected, setShowConnected] = useState(false);

  useEffect(() => {
    if (status === 'connected') {
      setShowConnected(true);
      const timer = setTimeout(() => setShowConnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'disconnected') return null;

  return (
    <AnimatePresence>
      {(true || showConnected) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <Alert
            className={`
              mx-auto max-w-xl rounded-none rounded-b-lg 
              ${
                status === 'connected'
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-blue-500/10 border-blue-500/50'
              }
            `}
          >
            <AlertDescription className="flex items-center gap-2">
              {status === 'connecting' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-blue-400">Connecting to server...</span>
                </>
              )}
              {status === 'connected' && showConnected && (
                <span className="text-green-400">
                  Connected to server successfully!
                </span>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
