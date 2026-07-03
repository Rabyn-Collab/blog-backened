import jwt from 'jsonwebtoken';



export const checkUser = (req, res, next) => {
  //const token = req.cookies?.token;
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, 'secret');
    req.userId = decoded.id;
    req.role = decoded.role;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }


}


