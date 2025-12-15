import config from '../config/env.js';
import jwt from "jsonwebtoken";

export const authErrorHandler = (
  error,
  req,
  res,
  next
) => {
  if (error.message.includes('access_denied') || error.message.includes('cancelled')) {
    return res.redirect(`${config.frontendUrl}/login?status=cancelled`);
  }
  
  next(error);
};



export const verifyUser = (req, res, next) => {
    // 1. Ambil header Authorization
    const authHeader = req.headers['authorization'];
    
    // 2. Ambil tokennya saja (Format biasanya: "Bearer <token_disini>")
    const token = authHeader && authHeader.split(' ')[1];

    // 3. Jika token tidak ada, tolak request
    if (token == null) {
        return res.status(401).json({ msg: "Akses ditolak, token tidak ditemukan" });
    }

    // 4. Verifikasi token
    // Pastikan Anda punya variable JWT_SECRET di file .env Anda
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ msg: "Token tidak valid atau kadaluarsa" });
        }

        // 5. Simpan data user yang sudah didecode ke dalam request object
        // 'decoded.id' berasal dari payload saat Anda membuat token login
        req.userId = decoded.id; 
        req.userRole = decoded.role; // Opsional: jika Anda menyimpan role di token

        // 6. Lanjut ke controller berikutnya (getProfile)
        next();
    });
};