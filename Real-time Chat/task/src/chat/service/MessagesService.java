package chat.service;

import chat.dto.ChatMessage;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class MessagesService {
    private final ConcurrentHashMap<String, ConcurrentLinkedDeque<ChatMessage>> chatMessages = new ConcurrentHashMap<>();

    public void addMessage(String chatId, ChatMessage message) {
        chatMessages.computeIfAbsent(chatId, k -> new ConcurrentLinkedDeque<>()).add(message);
    }

    public List<ChatMessage> getMessages(String chatId) {
        return new ArrayList<>(chatMessages.getOrDefault(chatId, new ConcurrentLinkedDeque<>()));
    }
}