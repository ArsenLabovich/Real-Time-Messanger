package chat.service;


import chat.dto.ChatUser;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

    private final Set<ChatUser> users = Collections.synchronizedSet(new LinkedHashSet<>());

    public void registerUser(String sessionId, String username) {
        ChatUser user = new ChatUser();
        user.setSessionId(sessionId);
        user.setUsername(username);
        users.add(user);
    }

    public void removeUserBySessionId(String sessionId) {
        users.removeIf(user -> user.getSessionId().equals(sessionId));
    }

    public List<ChatUser> getAllUsers() {
        return new ArrayList<>(users);
    }

    public boolean isUserRegistered(String username) {
        return users.stream().anyMatch(user -> user.getUsername().equals(username));
    }
}
