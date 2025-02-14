package chat.controller;

import chat.dto.ChatMessage;
import chat.dto.ChatUser;
import chat.service.MessagesService;
import chat.service.SessionsService;
import chat.service.UserService;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Controller

public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    private final UserService userService;
    private final MessagesService messagesService;
    private final SessionsService sessionsService;



    public ChatController(UserService userService, MessagesService messagesService, SessionsService sessionsService) {
        this.userService = userService;
        this.messagesService = messagesService;
        this.sessionsService = sessionsService;
    }

    @MessageMapping("/register")
    @SendTo("/topic/users")
    public List<ChatUser> registerUser(SimpMessageHeaderAccessor headerAccessor, ChatMessage chatMessage) {
        String sessionId = headerAccessor.getSessionId();
        Objects.requireNonNull(headerAccessor.getSessionAttributes()).put("username", chatMessage.getSender());
        userService.registerUser(sessionId, chatMessage.getSender());
        sessionsService.registerSession(sessionId, chatMessage.getSender());
        logger.info("User registered: {} with session ID: {}", chatMessage.getSender(), sessionId);
        return userService.getAllUsers();
    }

    @MessageMapping("/private-chat/{chatId}")
    @SendTo("/topic/private-chat/{chatId}")
    public ChatMessage sendPrivateMessage(SimpMessageHeaderAccessor headerAccessor, ChatMessage chatMessage, @DestinationVariable("chatId") String chatId) {
        String sender = sessionsService.getUsernameBySessionId(headerAccessor.getSessionId());
        chatMessage.setSender(sender);
        logger.info("Received private message: {} from: {} to: {}", chatMessage, sender, chatId);

        logger.info("Chat ID: {}", chatId);
        messagesService.addMessage(chatId, chatMessage);
        return chatMessage;
    }

    @MessageMapping("/public-chat")
    @SendTo("/topic/public-chat")
    public ChatMessage sendMessage(SimpMessageHeaderAccessor headerAccessor, ChatMessage chatMessage) {

        String sender = sessionsService.getUsernameBySessionId(headerAccessor.getSessionId());
        chatMessage.setSender(sender);
        logger.info("Received message: {}", chatMessage);
        messagesService.addMessage("publicChat", chatMessage);
        return chatMessage;
    }

}