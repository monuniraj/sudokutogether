import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Runtime Error Caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || String(this.state.error || "An unknown error occurred");

      return (
        <div style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          boxSizing: "border-box"
        }}>
          <div style={{
            maxWidth: "480px",
            width: "100%",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "20px",
            padding: "32px 24px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "16px"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "rgba(244, 63, 94, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px"
            }}>
              ⚠️
            </div>

            <h1 style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#ffffff"
            }}>
              Runtime Error Caught
            </h1>

            <p style={{
              margin: 0,
              fontSize: "13px",
              color: "#94a3b8",
              lineHeight: 1.5
            }}>
              An unexpected runtime exception was intercepted before unmounting the application interface.
            </p>

            <div style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              textAlign: "left",
              overflowX: "auto",
              boxSizing: "border-box"
            }}>
              <code style={{
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#fda4af",
                wordBreak: "break-all",
                display: "block"
              }}>
                {errorMessage}
              </code>
            </div>

            <button
              onClick={this.handleReload}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "14px 20px",
                borderRadius: "12px",
                backgroundColor: "#0284c7",
                color: "#ffffff",
                border: "none",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 10px 15px -3px rgba(2, 132, 199, 0.3)"
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
