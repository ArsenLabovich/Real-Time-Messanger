package chat.controller;

import chat.dto.ChatMessage;
import chat.service.MessagesService;
import chat.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ChatMessagesController {
    private final MessagesService messagesService;
    private final UserService userService;

    public ChatMessagesController(MessagesService messagesService, UserService userService) {
        this.messagesService = messagesService;
        this.userService = userService;
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getMessages() {
        return ResponseEntity.ok(messagesService.getMessages("publicChat"));
    }

    @GetMapping("/isUserRegistered")
    public ResponseEntity<Boolean> isUserRegistered(@RequestParam(name = "username") String username) {
        return ResponseEntity.ok(userService.isUserRegistered(username));
    }

    @GetMapping("/privateMessages/{chatId}")
    public ResponseEntity<List<ChatMessage>> getPrivateMessages(@PathVariable(name = "chatId") String chatId) {
        return ResponseEntity.ok(messagesService.getMessages(chatId));
    }
}
