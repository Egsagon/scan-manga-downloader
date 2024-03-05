const data = "data"
const key = CryptoJS.enc.Hex.parse("16346434333666633336163313336614");
const iv = CryptoJS.enc.Hex.parse("337333363336636613663333e4b36664");
var sml = decodeURIComponent(data);
var sme = CryptoJS.AES.encrypt(sml, key, {iv:iv});
sme = sme.ciphertext.toString(CryptoJS.enc.Base64);