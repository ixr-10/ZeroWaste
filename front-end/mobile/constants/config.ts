const IP = '192.168.73.147'; // ← your IP (run `ip a` anytime to check)
const PORT = '8000';

export const BASE_URL = `http://${IP}:${PORT}/api/`;
export const WS_URL   = `ws://${IP}:${PORT}`;