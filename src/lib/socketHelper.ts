import type { Socket } from "socket.io-client";

export function startConversation(socket: Socket, recipientId: string) {
  if (!socket || !socket.connected) {
    throw new Error("Socket not connected");
  }

  socket.emit("create_conversation", { recipientId });
}
