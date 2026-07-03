import { removeFile } from "../utils/removeFile.js";
import Blog, { categories } from "../models/Blog.js";

function convertQuery(queryObj) {
  const mongoQuery = {};

  for (const key in queryObj) {
    const match = key.match(/(\w+)\[(\w+)\]/);

    if (match) {
      const field = match[1];      // rating
      const operator = match[2];   // gt

      if (!mongoQuery[field]) mongoQuery[field] = {};

      mongoQuery[field][`$${operator}`] = Number(queryObj[key]);
    } else {
      mongoQuery[key] = queryObj[key];
    }
  }

  return mongoQuery;
}


export const getBlogs = async (req, res) => {
  const queryObj = { ...req.query };
  const excludeFileds = ['page', 'sort', 'limit', 'fields', 'search'];
  try {

    excludeFileds.forEach(el => delete queryObj[el]);


    const mongoQuery = convertQuery(queryObj);
    let filter = { ...mongoQuery };

    if (req.query.search) {
      const search = req.query.search;

      if (
        categories.some((n) =>
          n.toLowerCase().includes(search.toLowerCase())
        )
      ) {
        filter.category = {
          $regex: search,
          $options: "i",
        };
      } else {
        filter.title = {
          $regex: search,
          $options: "i",
        };
      }
    }

    let query = Blog.find(filter);


    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    }


    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await query.skip(skip).limit(limit).populate('user', 'fullname  email');

    const total = await Blog.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      totalPages: pages,
      blogs,
    });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

}




export const getBlog = async (req, res) => {
  try {
    const isExist = await Blog.findById(req.id).populate('user', 'fullname  email');
    if (!isExist) {
      return res.status(404).json({ message: 'Blog Not Found' });
    }
    return res.status(200).json(isExist);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}


export const createBlog = async (req, res) => {
  const { title, description, subtitle, category } = req.body || {};
  try {

    await Blog.create({
      title,
      description,
      subtitle,
      category,
      image: req.imagePath,
      user: req.userId
    });
    return res.status(201).json({ message: 'Blog Created' });

  } catch (err) {
    await removeFile(`./uploads/${req.imagePath}`, res);
    return res.status(400).json({ message: err.message });

  }
}


export const updateBlog = async (req, res) => {
  const { title, description, subtitle, category } = req.body || {};

  try {

    const isExist = await Blog.findById(req.id);

    if (!isExist) {
      if (req.imagePath) {
        await removeFile(`./uploads/${req.imagePath}`, res);
        return res.status(404).json({ message: 'Blog Not Found' });
      } else {
        return res.status(404).json({ message: 'Blog Not Found' });
      }
    }

    isExist.title = title || isExist.title;
    isExist.description = description || isExist.description;
    isExist.subtitle = subtitle || isExist.subtitle;
    isExist.category = category || isExist.category;

    if (req.imagePath) {
      await removeFile(`./uploads/${isExist.image}`, res);
      isExist.image = req.imagePath;
      isExist.save();
      return res.status(200).json({ message: 'Blog Updated' });
    } else {
      isExist.save();
      return res.status(200).json({ message: 'Blog Updated' });
    }


  } catch (err) {

    return res.status(400).json({ message: err.message });

  }






}



export const deleteBlog = async (req, res) => {

  try {

    const isExist = await Blog.findById(req.id);

    if (!isExist) {
      return res.status(404).json({ message: 'Blog Not Found' });
    }
    await removeFile(`./uploads/${isExist.image}`, res);

    await isExist.deleteOne();

    return res.status(200).json({ message: 'Blog Deleted' });


  } catch (err) {

    return res.status(400).json({ message: err.message });
  }

}

