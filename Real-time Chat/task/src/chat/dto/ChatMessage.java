package chat.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class ChatMessage {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String sender;
    private String content;
    private String timestamp;
}

