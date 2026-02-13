/**
 * ChatView - Chat page view wrapper rendering the ChatInterface component
 *
 * @module features/chat/views
 * @template none
 * @reference none
 */
import { ChatInterface } from '../components/chat-interface';

export default function ChatView() {
    return (
        <div className="h-full w-full">
            <ChatInterface />
        </div>
    );
}
