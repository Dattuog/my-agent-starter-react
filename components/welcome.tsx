import { CodeBlockIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';

interface WelcomeProps {
  disabled: boolean;
  startButtonText: string;
  onStartCall: () => void;
}

export const Welcome = ({
  disabled,
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeProps) => {
  return (
    <div
      ref={ref}
      inert={disabled}
      className="fixed inset-0 z-10 mx-auto flex h-svh flex-col items-center justify-center text-center bg-[#101a23]"
    >
      <div className="flex flex-col items-center gap-4 bg-[#16202b] rounded-2xl px-8 py-10 shadow-lg">
        <CodeBlockIcon size={56} className="mx-auto mb-2 text-[#0c7ff2]" />
        <h1 className="text-2xl font-bold text-white mb-1">Welcome</h1>
        <p className="text-[#90adcb] text-base mb-4 max-w-xs">
          Start a call to begin your interview session.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={onStartCall}
          className="w-56 font-mono text-base tracking-wide shadow-md"
        >
          {startButtonText}
        </Button>
      </div>
    </div>
  );
};
