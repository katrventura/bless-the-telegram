function addMessageClasses() {
    // Get all messages
    const messages = document.querySelectorAll('.message.default');
    
    messages.forEach(message => {
      // Check for sender identity
      const initialsElement = message.querySelector('.initials');
      const fromNameElement = message.querySelector('.from_name');
      
      // Identify KV's messages
      const isKvMessage = 
        (initialsElement && initialsElement.textContent.trim() === 'KV') || 
        (fromNameElement && fromNameElement.textContent.trim().includes('Kat Ventura'));
      
      // Identify MA's messages
      const isMaMessage = 
        (initialsElement && initialsElement.textContent.trim() === 'MA') || 
        (fromNameElement && fromNameElement.textContent.trim().includes('Marco Azurin'));
      
      // Add appropriate class based on sender
      if (isKvMessage) {
        message.classList.add('message-kat');
      } else if (isMaMessage) {
        message.classList.add('message-marco');
      }
      
      // Also add class to the message body for more specific styling options
      const messageBody = message.querySelector('.body');
      if (messageBody) {
        if (isKvMessage) {
          messageBody.classList.add('body-kat');
        } else if (isMaMessage) {
          messageBody.classList.add('body-marco');
        }
      }
    });
    
    // Handle joined messages (consecutive messages from same sender)
    const joinedMessages = document.querySelectorAll('.message.default.joined');
    joinedMessages.forEach(joinedMessage => {
      // Find the previous message to determine the sender
      const messageId = joinedMessage.id;
      if (!messageId) return;
      
      const prevMessageId = parseInt(messageId.replace('message', '')) - 1;
      const prevMessage = document.getElementById('message' + prevMessageId);
      
      if (prevMessage) {
        // Check if previous message has a specific class and add the same to this one
        if (prevMessage.classList.contains('message-kat')) {
          joinedMessage.classList.add('message-kat');
          
          const messageBody = joinedMessage.querySelector('.body');
          if (messageBody) {
            messageBody.classList.add('body-kat');
          }
        } else if (prevMessage.classList.contains('message-marco')) {
          joinedMessage.classList.add('message-marco');
          
          const messageBody = joinedMessage.querySelector('.body');
          if (messageBody) {
            messageBody.classList.add('body-marco');
          }
        }
      }
    });
  }
  
  // Update the CheckLocation function to run our class addition
  function CheckLocation() {
    // Call original function logic if needed
    
    // Add message classes
    addMessageClasses();
  }

  /**
 * This script handles the scroll reveal animation for chat messages
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all message elements
    const messages = document.querySelectorAll('.message');
    
    // Set initial state - all messages hidden
    messages.forEach(message => {
      // Make sure messages are initially hidden by the CSS
      message.classList.remove('revealed');
    });
    
    // Create an Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // When a message enters the viewport
        if (entry.isIntersecting) {
          // Add the revealed class after a small delay based on its position
          const message = entry.target;
          const delay = message.dataset.animationDelay || 5;
          
          setTimeout(() => {
            message.classList.add('revealed');
          }, delay);
          
          // Stop observing this message after it's been revealed
          observer.unobserve(message);
        }
      });
    }, {
      root: null, // Use the viewport as the root
      rootMargin: '0px 0px -50px 0px', // Trigger when message is 50px into viewport
      threshold: 0.08 // Trigger when at least 10% of the element is visible
    });
    
    // Set up the observer on all messages with staggered delays
    messages.forEach((message, index) => {
      // Add custom delay based on sequence
      message.dataset.animationDelay = index * 150; // 150ms between each message
      
      // Start observing the message
      observer.observe(message);
    });
    
    // Handle newly added messages
    function prepareNewMessages() {
      // Get all messages that don't have the observer attached yet
      const newMessages = document.querySelectorAll('.message:not([data-observed])');
      
      newMessages.forEach((message) => {
        // Mark as being observed
        message.setAttribute('data-observed', 'true');
        
        // Start with message hidden
        message.classList.remove('revealed');
        
        // Add a slight delay for natural feel
        message.dataset.animationDelay = 200;
        
        // Start observing the message
        observer.observe(message);
      });
    }
    
    // Watch for new messages being added to the DOM
    const chatHistory = document.querySelector('.history');
    if (chatHistory) {
      // Use MutationObserver to detect when new messages are added
      const chatObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // New nodes were added, check for new messages
            prepareNewMessages();
          }
        });
      });
      
      // Start observing the chat history for changes
      chatObserver.observe(chatHistory, { childList: true });
    }
    
    // For manual scroll triggering (useful for testing)
    function triggerScrollCheck() {
      window.dispatchEvent(new Event('scroll'));
    }
    
    // Initial trigger in case some messages are already in view
    setTimeout(triggerScrollCheck, 150);
  });