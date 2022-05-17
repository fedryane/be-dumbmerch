const { product, user, category, productcategory } = require("../../models");
const cloudinary = require("../utils/cloudinary");

//get all product
exports.getProducts = async (req, res) => {
  try {
    let data = await product.findAll({
      include: [
        {
          model: user,
          as: "user",
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
        },

        {
          model: category,
          as: "categories",
          through: {
            model: productcategory,
            as: "bridge",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    });

    data = JSON.parse(JSON.stringify(data));
    data = data.map((item) => {
      return {
        ...item,
        image: process.env.FILE_PATH + item.image,
      };
    });

    res.send({
      status: "success",
      data: {
        product: data,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server error",
    });
  }
};

//add product
// exports.addProduct = async (req, res) => {
//   try {
//     const data = req.body;

//     let newProduct = await product.create({
//       ...data,
//       image: req?.file?.filename,
//       idUser: req.user.id, //get the token
//     });

//     newProduct = JSON.parse(JSON.stringify(newProduct));

//     newProduct = {
//       ...newProduct,
//       image: process.env.FILE_PATH + newProduct?.image,
//     };
//     res.send({
//       status: "success",
//       data: {
//         newProduct,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).send({
//       status: "Add Product Failed",
//       message: "Server Error",
//     });
//   }
// };

// exports.addProduct = async (req, res) => {
//   try {
//     const newProduct = req.body;
//     let products = await product.create({
//       ...newProduct,
//       image: result.public.id,
//       idUser: req.user.id, // diambil dari token
//       // name: req.body.name,
//       // desc: req.body.desc,
//       // price: req.body.price,
//       // qty: req.body.qty,
//     });

//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: "dumbmerch_file",
//       use_filename: true,
//       unique_filename: false,
//     });

//     products = JSON.parse(JSON.stringify(products));

//     res.status(200).send({
//       status: "Success",
//       message: "Add Product Success",
//       data: {
//         ...products,
//         image: process.env.FILE_PATH + products.image,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       status: "Add Product Failed",
//       message: "Server Error",
//     });
//   }
// };
exports.addProduct = async (req, res) => {
  try {
    let { categoryId } = req.body;

    if (categoryId) {
      categoryId = categoryId.split(",");
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "dumbmerch_cloud",
      use_filename: true,
      unique_filename: false,
    });

    const data = {
      name: req.body.name,
      desc: req.body.desc,
      price: req.body.price,
      image: result.public_id,
      qty: req.body.qty,
      idUser: req.user.id,
    };

    let newProduct = await product.create(data);

    if (categoryId) {
      const productCategoryData = categoryId.map((item) => {
        return { idProduct: newProduct.id, idCategory: parseInt(item) };
      });

      await productCategory.bulkCreate(productCategoryData);
    }

    let productData = await product.findOne({
      where: {
        id: newProduct.id,
      },
      include: [
        {
          model: user,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: category,
          as: "categories",
          through: {
            model: productCategory,
            as: "bridge",
            attributes: [],
          },
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
    });
    productData = JSON.parse(JSON.stringify(productData));

    res.send({
      status: "success...",
      data: {
        ...productData,
        image: process.env.PATH_FILE + productData.image,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

// get by id product
exports.getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    let products = await product.findOne({
      where: { id },
      include: [
        {
          model: user,
          as: "user",
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
        },
        {
          model: category,
          as: "categories",
          through: {
            model: productcategory,
            as: "bridge",
          },
          attributes: {
            exclude: ["idUser", "createdAt", "updatedAt"],
          },
        },
      ],
      attributes: {
        exclude: ["idUser", "createdAt", "updatedAt"],
      },
    });

    products = JSON.parse(JSON.stringify(products));

    products = {
      ...products,
      image: process.env.FILE_PATH + products.image,
    };

    res.status(200).send({
      status: "Success",
      message: `Get detail product: ${id} success`,
      data: {
        products: products,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({
      status: "Get detail data failed",
      message: "Server Error",
    });
  }
};

// update product
// exports.updateProduct = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const data = req.body;
//     console.log(data);
//     let updateProduct = await product.update(
//       {
//         ...data,
//         image: result.public_id,
//         idUser: req.user.id,
//       },
//       { where: { id } }
//     );

//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: "dumbmerch_cloud",
//       use_filename: true,
//       unique_filename: false,
//     });

//     updateProduct = JSON.parse(JSON.stringify(data));

//     updateProduct = {
//       ...updateProduct,
//       image: process.env.FILE_PATH + req.file.filename,
//     };

//     res.status(200).send({
//       status: "Success",
//       message: `Update product at id: ${id} success`,
//       data: {
//         products: {
//           ...updateProduct,
//           image: process.env.FILE_PATH + req.file.filename,
//         },
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).send({
//       status: "Updated product failed",
//       message: "Server Error",
//     });
//   }
// };
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { categoryId } = req.body;
    categoryId = await categoryId.split(",");

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "dumbmerch_cloud",
      use_filename: true,
      unique_filename: false,
    });

    const data = {
      name: req?.body?.name,
      desc: req?.body.desc,
      price: req?.body?.price,
      image: result.public_id,
      qty: req?.body?.qty,
      idUser: req?.user?.id,
    };

    await productCategory.destroy({
      where: {
        idProduct: id,
      },
    });

    let productCategoryData = [];
    if (categoryId != 0 && categoryId[0] != "") {
      productCategoryData = categoryId.map((item) => {
        return { idProduct: parseInt(id), idCategory: parseInt(item) };
      });
    }

    if (productCategoryData.length != 0) {
      await productCategory.bulkCreate(productCategoryData);
    }

    await product.update(data, {
      where: {
        id,
      },
    });

    res.send({
      status: "success",
      data: {
        id,
        data,
        productCategoryData,
        image: req?.file?.filename,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

// delete product
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    let data = await product.destroy({
      where: { id },
    });

    data = JSON.parse(JSON.stringify(data));

    res.send({
      status: "success",
      message: `Delete product id: ${id} success`,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server error",
    });
  }
};
