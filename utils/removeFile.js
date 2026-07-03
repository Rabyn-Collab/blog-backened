import fs from 'fs/promises';



export const removeFile = async (path, res) => {
  try {
    await fs.unlink(path);
  } catch (err) {
    return res.status(400).json({ message: 'Something went wrong' });
  }
}