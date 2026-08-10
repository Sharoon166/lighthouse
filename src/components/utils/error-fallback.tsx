import type { FC } from "react";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

const ErrorFallback: FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div
      style={{
        padding: "24px",
        border: "1px solid #f5c2c2",
        borderRadius: "8px",
        backgroundColor: "#fdf2f2",
        fontFamily: "system-ui, sans-serif",
        maxWidth: "450px",
        margin: "16px auto",
      }}
      role="alert"
    >
      <h3 style={{ margin: "0 0 8px 0", color: "#9b1c1c" }}>
        Something went wrong
      </h3>

      {error && (
        <pre
          style={{
            backgroundColor: "#fff",
            padding: "12px",
            color: "#dc2626",
            overflowX: "auto",
          }}
        >
          {error.message}
        </pre>
      )}

      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          style={{
            backgroundColor: "#dc2626",
            color: "#fff",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔄 Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorFallback;
