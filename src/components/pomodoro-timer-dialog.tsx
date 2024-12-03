'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AnimatedCircularProgressBar from '@/components/ui/animated-circular-progress-bar';
import { toast } from 'sonner';
import { Play, Pause, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Motivational quotes for focus and productivity
const MOTIVATIONAL_QUOTES = [
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  {
    text: 'Success is not final, failure is not fatal: It is the courage to continue that counts.',
    author: 'Winston Churchill',
  },
  { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: 'Steve Jobs' },
  { text: "It always seems impossible until it's done.", author: 'Nelson Mandela' },
  { text: "Don't watch the clock; do what it does. Keep going.", author: 'Sam Levenson' },
  { text: 'Hardships often prepare ordinary people for an extraordinary destiny.', author: 'C.S. Lewis' },
  { text: "Believe you can and you're halfway there.", author: 'Theodore Roosevelt' },
  { text: 'I am not a product of my circumstances. I am a product of my decisions.', author: 'Stephen Covey' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
];

interface PomodoroTimerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  todoTitle: string;
}

export function PomodoroTimerDialog({ isOpen, onClose, onComplete, todoTitle }: PomodoroTimerDialogProps) {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const completedRef = useRef(false);
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [showQuote, setShowQuote] = useState(true);
  const [showMusic, setShowMusic] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showCloseAlert, setShowCloseAlert] = useState(false);

  // Trigger confetti
  const triggerConfetti = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 999999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  // Change quote periodically
  useEffect(() => {
    let quoteInterval: NodeJS.Timeout;
    let fadeInterval: NodeJS.Timeout;

    if (isRunning) {
      quoteInterval = setInterval(() => {
        setShowQuote(false); // Trigger fade out
        fadeInterval = setTimeout(() => {
          setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
          setShowQuote(true); // Trigger fade in
        }, 500); // Wait for fade out to complete
      }, 60000); // Change quote every minute
    }

    return () => {
      if (quoteInterval) clearInterval(quoteInterval);
      if (fadeInterval) clearTimeout(fadeInterval);
    };
  }, [isRunning]);

  // Reset timer when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(duration * 60);
      setIsRunning(false);
      completedRef.current = false;
    }
  }, [isOpen, duration]);

  // Initialize quote when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
      setShowQuote(true);
    }
  }, [isOpen]);

  // Timer logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setIsRunning(false);
            completedRef.current = true;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, timeLeft]);

  // Handle completion
  useEffect(() => {
    if (completedRef.current) {
      completedRef.current = false;
      onComplete();
      triggerConfetti();
      toast.success('Pomodoro completed! Todo marked as done.', {
        icon: '🎉',
      });
      // Auto close dialog after completion
      setTimeout(() => onClose(), 2500); // Increased to allow confetti to finish
    }
  }, [timeLeft, onComplete, onClose, triggerConfetti]);

  // Close handler with confirmation
  const handleClose = useCallback(() => {
    if (isRunning) {
      setShowCloseAlert(true);
      return;
    }
    setIsRunning(false);
    // reset duration
    setDuration(25);
    setTimeLeft(duration * 60);
    setShowMusic(false);
    onClose();
  }, [isRunning, duration, onClose]);

  // Confirm close action
  const confirmClose = useCallback(() => {
    setIsRunning(false);
    // reset duration
    setDuration(25);
    setTimeLeft(duration * 60);
    setShowMusic(false);
    setShowCloseAlert(false);
    onClose();
  }, [duration, onClose]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Constrain duration input
  const handleDurationChange = useCallback((value: string) => {
    const parsed = parseInt(value);
    const constrainedValue = Math.max(1, Math.min(60, parsed || 1));
    setDuration(constrainedValue);
    setTimeLeft(constrainedValue * 60);
  }, []);

  // Toggle timer
  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  // Function to focus iframe
  const focusIframe = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showMusic) return;

      // Focus iframe on music button press
      if (e.key === 'm') {
        focusIframe();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMusic, focusIframe]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <span>{todoTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence>
          {showMusic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden'
            >
              <div className='aspect-video w-full'>
                <iframe
                  ref={iframeRef}
                  src='https://www.lofi.cafe'
                  className='size-full rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  allow='autoplay'
                  tabIndex={0}
                />
                <p className='mt-2 text-xs leading-5 text-muted-foreground'>
                  Press <kbd className='rounded border border-border bg-muted px-1.5'>M</kbd> to focus music player. Use{' '}
                  <kbd className='rounded border border-border bg-muted px-1.5'>Space</kbd> to play/pause,{' '}
                  <kbd className='rounded border border-border bg-muted px-1.5'>←</kbd>
                  <kbd className='rounded border border-border bg-muted px-1.5'>→</kbd> for previous/next song, and{' '}
                  <kbd className='rounded border border-border bg-muted px-1.5'>↑</kbd>
                  <kbd className='rounded border border-border bg-muted px-1.5'>↓</kbd> for volume.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='flex flex-col items-center gap-4 py-2'>
          <AnimatedCircularProgressBar
            max={duration * 60}
            min={0}
            value={timeLeft}
            gaugePrimaryColor='hsl(var(--primary))'
            gaugeSecondaryColor='hsl(var(--muted))'
            reverse
            className='size-40'
          >
            <motion.span
              initial={{ scale: 1 }}
              animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1, repeat: isRunning ? Infinity : 0, ease: 'easeInOut' }}
              className='text-2xl'
            >
              {formatTime(timeLeft)}
            </motion.span>
          </AnimatedCircularProgressBar>

          <AnimatePresence mode='wait'>
            {showQuote && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className='h-12 space-y-0.5 text-center'
              >
                <p className='line-clamp-2 text-sm italic text-muted-foreground'>&quot;{currentQuote.text}&quot;</p>
                <p className='text-xs text-muted-foreground/60'>- {currentQuote.author}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className='flex w-full flex-row items-end gap-2'>
            <div className='w-1/2 space-y-2'>
              <Label htmlFor='duration' className='text-sm font-medium'>
                Duration (minutes)
              </Label>
              <Input
                type='number'
                id='duration'
                min={1}
                max={60}
                value={duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                disabled={isRunning}
              />
            </div>
            <Button
              variant='outline'
              size='icon'
              className={cn('h-10 w-10 shrink-0 flex-grow transition-colors', isRunning && 'bg-primary/10')}
              onClick={toggleTimer}
            >
              {isRunning ? <Pause className='size-4' /> : <Play className='size-4' />}
            </Button>
            <Button
              variant='outline'
              size='icon'
              className={cn('h-10 w-10 shrink-0 flex-grow transition-colors', showMusic && 'bg-primary/10')}
              onClick={() => setShowMusic(!showMusic)}
            >
              <Music2 className='size-4 transition-colors' />
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={showCloseAlert} onOpenChange={setShowCloseAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Close</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>Timer is still running. Are you sure you want to cancel?</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCloseAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
