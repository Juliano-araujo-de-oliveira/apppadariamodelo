import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] p-4 text-center">
          <div className="max-w-md w-full bg-[#2a2a2a] rounded-xl p-8 border border-white/10 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="bg-red-500/20 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado.</h1>
            <p className="text-gray-400 mb-6">
              Encontramos um erro inesperado. Tente recarregar a página.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-black/50 rounded text-left overflow-auto max-h-40">
                <p className="text-red-400 font-mono text-xs">{this.state.error.toString()}</p>
              </div>
            )}

            <Button 
              onClick={this.handleReload}
              className="w-full bg-[#8B6F47] hover:bg-[#6d5638] text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;