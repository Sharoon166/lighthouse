import React, { Component, type ErrorInfo, type ReactNode } from "react";

// Define the shape of the props the boundary expects
interface ErrorBoundaryProps {
  children: ReactNode;
  // Fallback can be a straight JSX element OR a render function passing error & reset parameters
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  // Optional logging hook for external production trackers like Sentry
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// Define the shape of the internal state
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  // Sync state so the next render phase paints the error fallback layout
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // Clear error state tracking to re-attempt loading children
  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error } = this.state;

      // Type guard: If fallback is a function execution pattern (Render Prop)
      if (typeof fallback === "function" && error) {
        return fallback(error, this.handleReset);
      }

      // If fallback is just a standard React/JSX element node
      if (fallback && typeof fallback !== "function") {
        return fallback;
      }

      // Hardcoded fallback UI fail-safe if prop is omitted entirely
      return (
        <div style={{ padding: "24px", border: "1px solid red" }}>
          <h2>Something went wrong.</h2>
          <button onClick={this.handleReset}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
