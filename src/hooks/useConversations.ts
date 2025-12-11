import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Conversation = {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return;
    }

    setConversations(data || []);
    setIsLoadingConversations(false);
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      setIsLoadingMessages(false);
      return;
    }

    setMessages(
      (data || []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        created_at: m.created_at,
      }))
    );
    setIsLoadingMessages(false);
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (title?: string, category?: string | null) => {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ title: title || "New Chat", category })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
      return null;
    }

    setConversations((prev) => [data, ...prev]);
    setActiveConversation(data);
    setMessages([]);
    return data;
  }, []);

  // Update conversation title
  const updateConversationTitle = useCallback(async (id: string, title: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", id);

    if (error) {
      console.error("Error updating conversation:", error);
      return;
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
    if (activeConversation?.id === id) {
      setActiveConversation((prev) => prev ? { ...prev, title } : null);
    }
  }, [activeConversation]);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversation?.id === id) {
      setActiveConversation(null);
      setMessages([]);
    }
    toast.success("Conversation deleted");
  }, [activeConversation]);

  // Add a message to the conversation
  const addMessage = useCallback(async (conversationId: string, role: "user" | "assistant", content: string) => {
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, role, content })
      .select()
      .single();

    if (error) {
      console.error("Error adding message:", error);
      return null;
    }

    return data;
  }, []);

  // Update a message (for streaming)
  const updateMessage = useCallback(async (messageId: string, content: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ content })
      .eq("id", messageId);

    if (error) {
      console.error("Error updating message:", error);
    }
  }, []);

  // Select a conversation
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await fetchMessages(conversation.id);
  }, [fetchMessages]);

  // Start new chat
  const startNewChat = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    activeConversation,
    messages,
    setMessages,
    isLoadingConversations,
    isLoadingMessages,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    addMessage,
    updateMessage,
    selectConversation,
    startNewChat,
    fetchConversations,
  };
};
