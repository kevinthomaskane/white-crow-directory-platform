type LoadingSpinnerProps = {
  message?: string;
};

export function LoadingSpinner({
  message = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
