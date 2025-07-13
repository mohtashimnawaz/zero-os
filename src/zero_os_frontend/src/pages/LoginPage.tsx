import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="page page-center">
      <div className="container container-tight py-4">
        <div className="text-center mb-4">
          <a href="/" className="navbar-brand navbar-brand-autodark">
            <h1>ZeroOS</h1>
          </a>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card card-md">
            <div className="card-body">
              <h2 className="h2 text-center mb-4">Welcome to ZeroOS</h2>
              <p className="text-muted text-center mb-4">
                Your personal on-chain operating system. Securely store files, notes, and tasks 
                on the Internet Computer blockchain.
              </p>
              <div className="mb-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={login}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"></path>
                    <path d="M7 12h14l-3 -3m0 6l3 -3"></path>
                  </svg>
                  Login with Internet Identity
                </button>
              </div>
              <p className="text-center text-muted mt-3">
                <small>
                  Powered by the Internet Computer blockchain
                </small>
              </p>
            </div>
          </div>
        </motion.div>
        <div className="text-center text-muted mt-3">
          <small>
            🔗 Fully On-Chain • 🔐 Secure • 🌐 Decentralized
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
