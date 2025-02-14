package chat.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionsService {

    private final Map<String, String> sessionToUsername = new ConcurrentHashMap<>();

    public void registerSession(String sessionId, String username) {
        sessionToUsername.put(sessionId, username);
    }
    public String getUsernameBySessionId(String sessionId) {
        return sessionToUsername.get(sessionId);
    }

    public void removeSession(String sessionId) {
        sessionToUsername.remove(sessionId);
    }
}
