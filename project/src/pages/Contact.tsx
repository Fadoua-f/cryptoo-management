import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    document.title = 'Contact | CryptoPortfolio';
  }, []);

  const validateForm = () => {
    const errors: { name?: string; email?: string; message?: string } = {};
    
    if (!name.trim()) {
      errors.name = 'Le nom est requis';
    }
    
    if (!email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!message.trim()) {
      errors.message = 'Le message est requis';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, this would send the form data to a server
      console.log('Form submitted:', { name, email, message });
      
      // Show success message
      setIsSubmitted(true);
      
      // Reset form
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Contactez-nous</h1>
          <p className="text-gray-600 text-center mb-12">
            Une question ou une suggestion ? N'hésitez pas à nous contacter.
          </p>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-primary-600 text-white p-8">
                <h2 className="text-2xl font-bold mb-6">Informations de contact</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="mt-1 mr-4" size={20} />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="mt-1">contact@cryptoportfolio.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="mt-1 mr-4" size={20} />
                    <div>
                      <h3 className="font-medium">Téléphone</h3>
                      <p className="mt-1">+33 1 23 45 67 89</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="mt-1 mr-4" size={20} />
                    <div>
                      <h3 className="font-medium">Adresse</h3>
                      <p className="mt-1">
                        123 Avenue de la Blockchain
                        <br />
                        75001 Paris, France
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12">
                  <h3 className="font-medium mb-4">Suivez-nous</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-primary-500 hover:bg-primary-400 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                      </svg>
                    </a>
                    <a href="#" className="bg-primary-500 hover:bg-primary-400 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                      </svg>
                    </a>
                    <a href="#" className="bg-primary-500 hover:bg-primary-400 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Envoyez-nous un message</h2>
                
                {isSubmitted ? (
                  <div className="bg-success-50 text-success-700 p-4 rounded-md mb-6">
                    <p className="font-medium">Message envoyé avec succès !</p>
                    <p className="mt-1">Nous vous répondrons dans les plus brefs délais.</p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mt-3 text-sm font-medium text-success-700 hover:text-success-800"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`block w-full px-3 py-2 border ${
                          formErrors.name ? 'border-error-500' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                        placeholder="Votre nom"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-error-600">{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`block w-full px-3 py-2 border ${
                          formErrors.email ? 'border-error-500' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                        placeholder="votre@email.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-error-600">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`block w-full px-3 py-2 border ${
                          formErrors.message ? 'border-error-500' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                        placeholder="Comment pouvons-nous vous aider ?"
                      ></textarea>
                      {formErrors.message && (
                        <p className="mt-1 text-sm text-error-600">{formErrors.message}</p>
                      )}
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      <Send size={18} className="mr-2" />
                      Envoyer le message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;