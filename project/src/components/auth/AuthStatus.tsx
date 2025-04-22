import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthStatus: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-medium mb-2">Authentication Status</h3>
      <div className="space-y-2">
        <p>
          <span className="font-medium">Status:</span>{' '}
          <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </p>
        
        {user && (
          <div>
            <p><span className="font-medium">User ID:</span> {user.id}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
          </div>
        )}
        
        <div className="mt-4">
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthStatus; 