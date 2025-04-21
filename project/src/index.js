import { initWeb3, sendETH, loadTransactionHistory } from './blockchain';

// Initialiser Web3 dès le chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
  // Initialiser la connexion blockchain
  const connected = await initWeb3();
  if (connected) {
    console.log("Connecté à la blockchain avec succès!");
    
    // Configurer le formulaire d'envoi d'ETH
    setupSendForm();
  }
});

// Configurer le formulaire d'envoi
function setupSendForm() {
  const sendForm = document.querySelector('#send-form');
  if (!sendForm) return;
  
  sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const toAddress = document.querySelector('#recipient-address').value;
    const amount = document.querySelector('#eth-amount').value;
    
    if (!toAddress || !amount) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    
    // Désactiver le bouton pendant la transaction
    const submitButton = sendForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Transaction en cours...";
    
    try {
      const result = await sendETH(toAddress, amount);
      
      if (result.success) {
        alert(`Transaction réussie! Hash: ${result.transactionHash}`);
        // Réinitialiser le formulaire
        sendForm.reset();
      } else {
        alert(`Échec de la transaction: ${result.error}`);
      }
    } catch (error) {
      alert(`Erreur: ${error.message}`);
    } finally {
      // Réactiver le bouton
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer";
    }
  });
}