import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

def _single_decode(d: str, e: int, f: int):
    g = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'
    h = g[:e]
    i = g[:f]
    j = sum(h.index(b) * (e ** c) for c, b in enumerate(reversed(d)) if b in h)
    k = ''
    while j > 0:
        k = i[j % f] + k
        j = (j - j % f) // f
    return k or '0'

def decode(data: tuple[str | int]):
    
    h, u, n, t, e, r = data
    
    u = int(u)
    t = int(t)
    e = int(e)
    r = int(r)
    
    result = ""
    i = 0
    
    while i < len(h):
        s = ""
        
        while h[i] != n[e]:
            s += h[i]
            i += 1
        
        for j in range(len(n)):
            s = s.replace(n[j], str(j))
        
        result += chr(int(_single_decode(s, e, 10)) - t)
        i += 1
    
    return result

def encrypt_sm(data: str, key: str, iv: str):
    key = bytes.fromhex(key)
    iv = bytes.fromhex(iv)

    cipher = AES.new(key, AES.MODE_CBC, iv)
    padded_data = pad(data.encode(), AES.block_size)
    ciphertext = cipher.encrypt(padded_data)

    return padded_data, base64.b64encode(ciphertext).decode()

# EOF