from fastapi import APIRouter
import socket

router = APIRouter()

@router.get("/ip")
def get_local_ip():
    """
    Returns the primary local IP address of the machine.
    This is used for generating the QR code for mobile connection.
    """
    try:
        # Connect to a public DNS server (Google's) to determine the outgoing interface IP
        # We don't actually send data, just establish the 'route'
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.1)
        # doesn't even have to be reachable
        s.connect(('8.8.8.8', 1))
        IP = s.getsockname()[0]
        s.close()
    except Exception:
        IP = '127.0.0.1'
        
    return {"ip": IP}
