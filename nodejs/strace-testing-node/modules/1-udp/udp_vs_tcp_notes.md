
# 22/06/2025
## User datagram protocol

In **TCP**, the request is broken into segments. On the receiving side, it arrives as a stream of bytes—not as a unit of work, but as a continuous stream. These segments arrive in order. TCP guarantees both order and reliability: we cannot lose a single byte.

In **UDP**, the sent message is the received message. The protocol respects message boundaries. It never breaks the message; it sends it as a complete unit. It's a Layer 4 protocol. Prior communication (like a handshake) is not required.

### Use cases:
- Great for video streaming — we can afford to lose some bytes; it doesn’t matter
- VPNs — it's fine to use UDP to transport TCP connections (e.g., OpenVPN)
- DNS — we send discrete messages
- WebRTC — uses UDP for peer-to-peer communication in the browser

### How it works:
`![[udp.png]]`
We use **ports**. UDP has fewer headers than TCP.
We create a **socket** and send data to a destination. In the middle sits the **datagram**.
- No need to acknowledge receipt
- We must have a **listening socket** on the receiving end

### Properties:
- Low latency
- No handshake or ordering
- No guaranteed delivery

### Cons:
- No acknowledgment
- Connection-less: anyone can send data without prior setup
- No flow control
- No congestion control
- No ordering
- Easily spoofed

---

## Node.js specifics

We **bind** on the source side. What does that mean?
It means telling the kernel we are ready to receive datagrams on a given port and source IP. This is done using the `bind` method.

### In UDP server:
- Create a UDP socket
- Bind it to a port — this starts listening
- Bind to all addresses (e.g., `0.0.0.0`)
- Destination is undefined — anyone can send messages to the socket
- One socket serves all clients

### In UDP client:
- Create a socket
- To send a message, the socket must be bound
- Creating and sending automatically assigns a random port and binds to all available interfaces (e.g., WiFi IP, loopback, IPv6)

### How to "lock" a client to a server:
Use the `connect()` function. This sets the default destination address/port, so all `send()` calls go to that specific server. It also filters incoming datagrams to only accept responses from that server.
