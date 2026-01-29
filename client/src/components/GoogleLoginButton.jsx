import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google-login', {
        token: credentialResponse.credential,
      });

      console.log('Login Success:', res.data);
      // Save user to context or local storage if needed
      // For now, assuming cookie handles session as per existing auth
      // You might want to reload or update context here
      navigate('/');
      window.location.reload(); // Simple reload to refresh auth state
    } catch (error) {
      console.error('Login Failed:', error);
    }
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <div className="my-4 flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="filled_black"
        shape="pill"
      />
    </div>
  );
};

export default GoogleLoginButton;
