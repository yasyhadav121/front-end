import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';

function ChatAi({ problem }) {
    // Remove the initial model message - start with empty array
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;

        const userMessage = { role: 'user', parts: [{ text: data.message }] };
        
        // Update UI immediately with user message
        setMessages(prev => [...prev, userMessage]);
        reset();
        setIsLoading(true);

        try {
            // Create updated messages array including the new user message
            const updatedMessages = [...messages, userMessage];
            
            // Prepare the payload
            const payload = {
                messages: updatedMessages,
                title: problem?.title || "",
                description: problem?.description || "",
                testCases: problem?.visibleTestCases || [],
                startCode: problem?.startCode || ""
            };

            console.log("Sending payload:", JSON.stringify(payload, null, 2));

            const response = await axiosClient.post("/ai/chat", payload);

            // Add AI response
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: response.data.message }] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            console.error("Error Response:", error.response?.data);
            
            let errorMessage = "Sorry, I encountered an error. Please try again.";
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = "Invalid request. Please check the problem data.";
            } else if (error.response?.status === 404) {
                errorMessage = "AI chat service is not available. Please contact support.";
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = "Network error. Please check your connection.";
            }
            
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: errorMessage }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
            {/* Header */}
            <div className="p-4 border-b bg-base-200">
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-gray-500">Ask questions about: {problem?.title || "this problem"}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Show welcome message only if no messages yet */}
                {messages.length === 0 && (
                    <div className="chat chat-start">
                        <div className="chat-bubble bg-base-200 text-base-content">
                            Hi! I'm here to help you with this problem. Feel free to ask any questions!
                        </div>
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className={`chat-bubble ${
                            msg.role === "user" 
                                ? "bg-primary text-primary-content" 
                                : "bg-base-200 text-base-content"
                        }`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                
                {/* Loading Indicator */}
                {isLoading && (
                    <div className="chat chat-start">
                        <div className="chat-bubble bg-base-200">
                            <span className="loading loading-dots loading-sm"></span>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 bg-base-100 border-t"
            >
                <div className="flex gap-2">
                    <input 
                        placeholder="Ask me anything about this problem..." 
                        className={`input input-bordered flex-1 ${errors.message ? 'input-error' : ''}`}
                        {...register("message", { 
                            required: "Message is required", 
                            minLength: { value: 2, message: "Too short" }
                        })}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isLoading || errors.message}
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
                {errors.message && (
                    <p className="text-error text-sm mt-1">{errors.message.message}</p>
                )}
            </form>
        </div>
    );
}

export default ChatAi;