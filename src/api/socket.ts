import MovieUpdate from "@/models/MovieUpdate";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

let connections = {} as {
  [key: string]: { type: string; connection: HubConnection; started: boolean };
};

const createConnection = (messageType: string, token: string) => {
  const connectionObj = connections[messageType];
  if (!connectionObj) {
    const url = `${process.env.NEXT_PUBLIC_SERVER_HOST}${process.env.NEXT_PUBLIC_HUB_PATH}`;
    const connection = new HubConnectionBuilder()
      .withUrl(url, {
        logger: LogLevel.Information,
        accessTokenFactory: () => token,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    connections[messageType] = {
      type: messageType,
      connection: connection,
      started: false,
    };
    return connection;
  } else {
    return connections[messageType].connection;
  }
};

const startConnection = (messageType: string) => {
  const connectionObj = connections[messageType];
  if (!connectionObj.started) {
    connectionObj.connection
      .start()
      .catch((err) => console.error("SOCKET: ", err.toString()));
    connectionObj.started = true;
  }
};

const stopConnection = (messageType: string) => {
  const connectionObj = connections[messageType];
  if (connectionObj) {
    connectionObj.connection.stop();
    connectionObj.started = false;
  }
};

const registerOnServerEvents = (
  messageType: string,
  onData: (payload: MovieUpdate[]) => void,
  onClose: () => void,
  token: string,
) => {
  try {
    const connection = createConnection(messageType, token);
    connection.on("DataReceived", (payload: MovieUpdate[]) => {
      onData(payload);
    });
    connection.onclose(() => {
      stopConnection(messageType);
      onClose();
    });
    startConnection(messageType);
  } catch (error) {
    console.error("SOCKET: ", error);
  }
};

export const socketService = {
  registerOnServerEvents,
  stopConnection,
};
