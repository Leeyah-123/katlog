import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NotificationPromptProps {
  open: boolean;
  onClose: () => void;
  onEnable: () => void;
}

export function NotificationPrompt({
  open,
  onClose,
  onEnable,
}: NotificationPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable Notifications?</DialogTitle>
          <DialogDescription>
            Would you like to enable sound notifications for new transactions?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Not Now
          </Button>
          <Button onClick={onEnable}>Enable</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
