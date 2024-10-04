// Simulate receiving messages from a remote source
const remoteMessages = [
    { content: "Hello there!", author: "remote" },
    { content: "How are you doing?", author: "remote" }
];

// Example chat data (replace with actual data retrieval logic)
const chats = [
    { id: 'chat1', name: 'Chat 1', messages: [ { content: "Hello there1!", author: "remote" },
    { content: "How are you doing?", author: "remote" }] },
    { id: 'chat2', name: 'Chat 2', messages: [ { content: "Hello there2!", author: "remote" },
    { content: "How are you doing?", author: "remote" }] },
    // Add more chats as needed
];

// Currently selected chat
let currentChatId = null;
let activeConversation = null;
let identity = null;

// Function to render chat list
function renderChatList() {
    const chatListPanel = document.getElementById('chat-list-panel');
    chatListPanel.innerHTML = ''; // Clear existing chat list

    chats.forEach(chat => {
        const chatRow = document.createElement('div');
        chatRow.textContent = chat.name;
        chatRow.classList.add('chat-row');
        chatRow.onclick = () => loadChatMessages(chat.id);
        chatListPanel.appendChild(chatRow);
    });
}

function renderChatElement(conversation) {
    const chatListPanel = document.getElementById('chat-list-panel');
    const chatRow = document.createElement('div');
    chatRow.id = conversation.sid;
    chatRow.textContent = conversation.friendlyName ? conversation.friendlyName : conversation.sid;
    chatRow.classList.add('chat-row');

    chatRow.onclick = () =>{
        loadChatMessagesConv(conversation.sid);

        var chatRows = document.querySelectorAll('#chat-list-panel .chat-row');
        chatRows.forEach(function(row) {
            row.classList.remove('selected-chat-row');
          });
          chatRow.classList.add('selected-chat-row');
    } 
    chatListPanel.appendChild(chatRow);
}


// Function to load chat messages for a given chat
function loadChatMessages(chatId) {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = ''; // Clear existing messages

    const selectedChat = chats.find(chat => chat.id === chatId);
    if (selectedChat) {
        selectedChat.messages.forEach(message => {
            /*const messageDiv = document.createElement('div');
            messageDiv.textContent = message.content;
*/
            const messageDiv = createMessageElement(message.content, message.author);
            chatWindow.appendChild(messageDiv);
        });
    }

    currentChatId = chatId; // Set the current chat
}

function loadChatMessagesConv(chatId) {
 
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = ''; // Clear existing messages
    activeConversation = null;

    convoClient.getConversationBySid(chatId)
        .then(convo =>{
            activeConversation = convo;
            convo.getMessages(20).then( p =>{
                p.items.forEach(message => {
                        
                        const messageDiv = createMessageElement(message.body, message.author, message.dateCreated.toISOString());
                        chatWindow.appendChild(messageDiv);

                    
                        

                });
                chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the latest message
            });

            activeConversation.on('messageAdded', (message) =>{
                const messageDiv = createMessageElement(message.body, message.author,message.dateCreated.toISOString());
                chatWindow.appendChild(messageDiv);
                chatWindow.scrollTop = chatWindow.scrollHeight;
            })
            
        })
    
    

    currentChatId = chatId; // Set the current chat
}


// Function to create a message element and append it to the chat window
function createMessageElement(message, author, date) {
    const messageContDiv =  document.createElement('div');
    messageContDiv.classList.add('message-container', author === identity.value ? 'my-container' : 'remote-container');

    const authorLable =  document.createElement('div');
    authorLable.classList.add('author-label');
    authorLable.textContent = author;


    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', author === identity.value ? 'my-message' : 'remote-message');
    messageDiv.textContent = message;

    const dateLable =  document.createElement('div');
    dateLable.classList.add('date-label');
    dateLable.textContent = date;

    messageContDiv.appendChild(authorLable);
    messageContDiv.appendChild(messageDiv);
    messageContDiv.appendChild(dateLable);

    return messageContDiv;
}

// Function to display a message in the chat window
function displayMessage(message, author,date) {
    const chatWindow = document.getElementById('chat-window');
    const messageElement = createMessageElement(message, author, date);
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the latest message
}

// Function to handle sending a message
function sendMessage() {
    


    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        if(activeConversation){
            activeConversation.sendMessage(message).then(n =>{
                //displayMessage(message, identity.value, nowTime());
                input.value = ''; // Clear the input after sending
            })
            .catch(err => {
                console.error(err);
                displayMessage("Error: " + message, identity.value);
                input.value = ''; // Clear the input after sending
            })
        }

    }
}

function createConversation(){
    if(convoClient != null){
        convoClient.createConversation().then(newConvo =>{
            newConvo.add(identity.value).then(participant =>{
                 
                alert('Conversation created: '  +newConvo.sid )
            })
            
            

        })
    }
}

window.addEventListener("DOMContentLoaded", (event) => {

    // Event listener for the send button
    document.getElementById('send-button').addEventListener('click', sendMessage);

    // Event listener for the enter key in the message input
    document.getElementById('message-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    document.getElementById('create-chat-button').addEventListener('click', createConversation);


    document.getElementById('top-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            if(convoClient == null)
                fetchData();
        }
    });

    // Assuming there is a button with the id 'myButton' in your HTML
    var myButton = document.getElementById('top-button');
    identity = document.getElementById('top-input');


    // Add click event listener to the button
    myButton.addEventListener('click', function() {
        if(convoClient == null)
            fetchData();
        
    });


});


function nowTime(){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);

    return today.toISOString();
}



// Variable to store the retrieved data
let retrievedData;
let dataOK = true;
let convoClient;

// Function to make the HTTP GET request
function fetchData() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        // Parse the JSON response
        retrievedData =  xhr.responseText;
        console.log('Data retrieved successfully:', retrievedData);
        processConversations();
        // You can now use 'retrievedData' in your program
      } else {
        dataOK = false;
        console.error('There was a problem with the request.');
      }
    }
  };
  xhr.open('GET', '/token-generator?identity='+identity.value, true);
  xhr.send();
}


function processConversations(){
    convoClient = new Twilio.Conversations.Client(retrievedData);
    // Before you use the client, subscribe to the `'initialized'` event.
    convoClient.on('initialized', () => {
        // Use the client.

    });
    
    // To catch client initialization errors, subscribe to the `'initFailed'` event.
    convoClient.on('initFailed', ({ error }) => {
        // Handle the error.
        console.error(error);
    });

    convoClient.on('conversationAdded', (conversation)=>{
        renderChatElement(conversation);
    } );


}