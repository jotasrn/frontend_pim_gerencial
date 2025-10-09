import React, { ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

// --- Interfaces para Tipagem ---

// Define os tipos das propriedades que o componente pode receber
interface Props {
  children: ReactNode;
}

// Define os tipos do estado interno do componente
interface State {
  hasError: boolean;
  error: Error | null;
}

class ApiErrorBoundary extends React.Component<Props, State> {
  // Define o estado inicial com os tipos corretos
  public state: State = {
    hasError: false,
    error: null,
  };

  // A função agora recebe um 'error' do tipo 'Error'
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // A função agora recebe 'error' e 'errorInfo' com seus tipos corretos
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ApiErrorBoundary capturou um erro:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Erro na Aplicação
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Ocorreu um erro inesperado. Tente recarregar a página.
              </p>
              {/* Opcional: Exibir detalhes do erro em ambiente de desenvolvimento
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 text-xs text-left bg-gray-100 p-2 rounded">
                  {this.state.error?.toString()}
                </pre>
              )}
              */}
              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar Página
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ApiErrorBoundary;