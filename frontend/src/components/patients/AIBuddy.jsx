import '../../styles/PatientDashboard.css';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../utils/api';
import ReactMarkdown from 'react-markdown';

const AIBuddy = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/patients/chat-history`, { withCredentials: true });
      if (response.data.messages && response.data.messages.length > 0) {
        setMessages(response.data.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        // Set welcome message if no history
        setMessages([{
          id: 1,
          type: 'ai',
          text: 'Hello! 👋 I\'m your AI Health Assistant powered by Google Gemini. I can help you with:\n\n• General health information and questions\n• Understanding medical terms and conditions\n• Wellness tips and advice\n• Answering questions about your medications\n\nHow can I assist you today?',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Set welcome message on error
      setMessages([{
        id: 1,
        type: 'ai',
        text: 'Hello! 👋 I\'m your AI Health Assistant powered by Google Gemini. How can I assist you today?',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const saveChatHistory = async (updatedMessages) => {
    try {
      await axios.post(
        `${API_URL}/api/patients/chat-history`,
        { messages: updatedMessages },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/patients/chat-history`, { withCredentials: true });
      setMessages([{
        id: Date.now(),
        type: 'ai',
        text: 'Chat history cleared. How can I help you today?',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error deleting chat history:', error);
      alert('Failed to delete chat history. Please try again.');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const getAIResponse = async (userMessage, files = []) => {
    try {
      const formData = new FormData();
      formData.append('prompt', userMessage);
      
      // Append image files
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await axios.post(
        `${API_URL}/api/ai/generate-response`,
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    const currentMessage = inputMessage;
    const currentFiles = selectedFiles;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: currentMessage,
      files: currentFiles.map(f => ({ name: f.name, size: f.size })),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedFiles([]);
    setIsTyping(true);

    try {
      // Build context-aware prompt
      let prompt = currentMessage;
      if (currentFiles.length > 0) {
        prompt += `\n\nI'm uploading ${currentFiles.length} image(s). Please analyze them and help me understand what they show.`;
      }
      
      // Add healthcare context
      prompt = `${prompt}\n\nPlease provide accurate, helpful medical information. Remind me to consult with my healthcare provider for personalized advice if needed.`;

      const aiResponseText = await getAIResponse(prompt, currentFiles);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      
      // Save chat history to database
      await saveChatHistory(updatedMessages);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: 'Sorry, I encountered an error processing your request. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="ai-buddy-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 150px)',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginRight: '60px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '2px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🤖
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>AI Health Buddy</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Your personal health assistant</p>
          </div>
        </div>
        
        {/* Clear History Button */}
        {messages.length > 1 && (
          <button
            onClick={handleClearHistory}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#cc0000'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ff4444'}
          >
            🗑️ Clear History
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="messages-container" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f8f9fa'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#888'
          }}>
            <p>Loading chat history...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                animation: 'slideIn 0.3s ease'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: message.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              backgroundColor: message.type === 'user' ? '#007bff' : '#fff',
              color: message.type === 'user' ? '#fff' : '#333',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              wordWrap: 'break-word'
            }}>
              <div style={{ 
                margin: 0, 
                fontSize: '15px', 
                lineHeight: '1.6'
              }}>
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p style={{ margin: '0 0 8px 0' }} {...props} />,
                    ul: ({node, ...props}) => <ul style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
                    ol: ({node, ...props}) => <ol style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
                    li: ({node, ...props}) => <li style={{ marginBottom: '4px' }} {...props} />,
                    strong: ({node, ...props}) => <strong style={{ fontWeight: '600' }} {...props} />,
                    em: ({node, ...props}) => <em style={{ fontStyle: 'italic' }} {...props} />,
                    h1: ({node, ...props}) => <h1 style={{ fontSize: '20px', margin: '12px 0 8px 0', fontWeight: '600' }} {...props} />,
                    h2: ({node, ...props}) => <h2 style={{ fontSize: '18px', margin: '10px 0 6px 0', fontWeight: '600' }} {...props} />,
                    h3: ({node, ...props}) => <h3 style={{ fontSize: '16px', margin: '8px 0 4px 0', fontWeight: '600' }} {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline ? 
                        <code style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '14px' }} {...props} /> :
                        <code style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '6px', fontSize: '14px', overflowX: 'auto' }} {...props} />
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
              
              {message.files && message.files.length > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  {message.files.map((file, idx) => (
                    <div key={idx} style={{ 
                      fontSize: '13px', 
                      opacity: 0.9,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '4px'
                    }}>
                      <span>📎</span>
                      <span>{file.name}</span>
                      <span style={{ fontSize: '11px' }}>({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                  ))}
                </div>
              )}
              
              <p style={{ 
                margin: '6px 0 0 0', 
                fontSize: '11px', 
                opacity: 0.7,
                textAlign: 'right'
              }}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
          ))
        )}

        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              gap: '4px'
            }}>
              <div className="typing-dot" style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#888', 
                borderRadius: '50%',
                animation: 'typing 1.4s infinite'
              }}></div>
              <div className="typing-dot" style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#888', 
                borderRadius: '50%',
                animation: 'typing 1.4s infinite 0.2s'
              }}></div>
              <div className="typing-dot" style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#888', 
                borderRadius: '50%',
                animation: 'typing 1.4s infinite 0.4s'
              }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {selectedFiles.map((file, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: '#fff',
              borderRadius: '20px',
              border: '1px solid #dee2e6',
              fontSize: '13px'
            }}>
              <span>📄</span>
              <span>{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0 4px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div style={{
        padding: '20px',
        borderTop: '2px solid #f0f0f0',
        backgroundColor: '#fff',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end'
      }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,.pdf,.doc,.docx"
          style={{ display: 'none' }}
        />
        
        <button
          onClick={() => fileInputRef.current.click()}
          style={{
            padding: '12px',
            border: '2px solid #007bff',
            backgroundColor: '#fff',
            color: '#007bff',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#007bff';
            e.target.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#fff';
            e.target.style.color = '#007bff';
          }}
          title="Attach files"
        >
          📎
        </button>

        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '24px',
            fontSize: '15px',
            resize: 'none',
            minHeight: '44px',
            maxHeight: '120px',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          rows={1}
        />

        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() && selectedFiles.length === 0}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: (!inputMessage.trim() && selectedFiles.length === 0) ? '#ccc' : '#007bff',
            color: '#fff',
            borderRadius: '24px',
            cursor: (!inputMessage.trim() && selectedFiles.length === 0) ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.3s',
            height: '44px'
          }}
          onMouseOver={(e) => {
            if (inputMessage.trim() || selectedFiles.length > 0) {
              e.target.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseOut={(e) => {
            if (inputMessage.trim() || selectedFiles.length > 0) {
              e.target.style.backgroundColor = '#007bff';
            }
          }}
        >
          Send
        </button>
      </div>

      <style>{`
        .messages-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .messages-container::-webkit-scrollbar-track {
          background: rgba(241, 241, 241, 0.6);
          border-radius: 10px;
        }
        
        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(136, 136, 136, 0.6);
          border-radius: 10px;
        }
        
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(85, 85, 85, 0.8);
        }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AIBuddy;
