const addressModel = require("../Models/AddressModel");
const orderModel = require("../Models/orderModel");
const gPayDetailsModel = require("../Models/gPayPaymentModel");
const productModel = require("../Models/productModel");
const userModel = require("../Models/userModel");
const imageModel = require("../Models/ImageModel");
const stickerModel = require("../Models/stickerModel");
const cacheModel = require("../Models/userCacheModel");
const dateFormat = require("../utils/dateFormat");
const sendNotify = require("../utils/sendNotify");
const quantityChanger = require("../utils/orderQuantityChanger");

exports.addOrder = async (req, res) => {
  try {
    // Debug log
    // console.log("Incoming items:", JSON.stringify(req.body.items, null, 2));

    const {
      productId,
      customerId,
      paymentType,
      addressId,
      address,
      city,
      name,
      phone,
      state,
      zipCode,
      saveAddress,
      qty,
      size,
      landmark,
      district,
    } = req.body;

    // console.log(req.body)

    let addressDoc = null;

    // Save new address if needed
    if (!addressId || saveAddress === true) {
      const addressData = {
        UserId: customerId,
        type: "Order Address",
        name,
        address,
        city,
        landmark,
        district,
        state,
        zipCode,
        phone,
        isSaved: saveAddress,
      };
      addressDoc = await addressModel.create(addressData);
    }

    const finalAddressId = addressId || (addressDoc && addressDoc._id);

    // Generate Order ID
    const year = new Date().getFullYear();
    const orderCount = await orderModel.countDocuments();
    let genOrderId = "";

    if (orderCount === 0) {
      genOrderId = `TLM/${year}/ORD/0001`;
    } else {
      const lastOrder = await orderModel.findOne().sort({ _id: -1 });
      const lastOrdId = lastOrder.orderID?.split("/").pop();
      const nextOrdId = String(parseInt(lastOrdId) + 1).padStart(4, "0");
      genOrderId = `TLM/${year}/ORD/${nextOrdId}`;
    }
    

    // Order data
    const orderData = {
      orderID: genOrderId,
      customerId,
      productId: productId?.toString() || "",
      paymentType,
      addressId: finalAddressId,
      paymentStatus: "pending",
      orderStatus: "Processing",
      orderDate: dateFormat("NNMMYY|TT:TT"),
      deliveredDate: "",
      trackId: "",
      size: size || "",
      qty: req.body.items?.[0]?.quantity || qty || "",
      isComplete: false,
      cancellationReason: "",
      stickerId: req.body.items[0].stickerId
    };

    // const stickerData = {
    //   ordId: orderPending._id || "",
    //   name: "Customized Stickers",
    //   length: customization.length || "",
    //   text: customization.text || "",
    //   font: customization.font || "",
    //   customizedAt: customization.customizedAt || "",
    // };

    // // Only create sticker if there is customization
    // if (Object.keys(customization).length > 0) {
    //   await stickerModel.create(stickerData);
    // }

    return res.status(201).json({
      message: "Order placed successfully",
      orderData,
    });
  } catch (err) {
    console.error("Order Error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.googlePayPaymentDetails = async (req, res) => {
  try {
    const { orderId, screenshotBase64, screenshotName, paymentType } = req.body;
    // console.log(paymentType)

    const isExist = await orderModel.findOne({ orderID: orderId });

    if (!isExist) {
      return res.status(404).json({ message: "NoProductAvailable" });
    }

    if (paymentType == "UPI") {
      //For UPI
      const paymentData = {
        orderId: isExist._id,
        screenshotBase64,
        screenshotName,
        Date: dateFormat("NNMMYY|TT:TT"),
      };

      const payment = await gPayDetailsModel.create(paymentData);
      if (!payment) {
        return res.status(500).json({ message: "Something Went Wrong..." });
      }

      await orderModel.findByIdAndUpdate(
        isExist._id,
        {
          $set: {
            paymentType: paymentType,
            isComplete: true,
          },
        },
        { new: true },
      );

      sendNotify(
        {
          product: isExist.orderID,
          Qty: isExist.qty,
        },
        "ORDPRCS",
      );

      // console.log(user,product)
      sendNotify(
        {
          product: isExist.orderID,
          Qty: isExist.qty,
        },
        "ORDPYMT",
      );

      //add here to quantityChanger
      quantityChanger("deduct", isExist);

      return res.status(200).json({
        message: "Payment Request Completed Successfully...",
      });
    } else if (paymentType == "cod") {
      //for COD
      await orderModel.findByIdAndUpdate(
        isExist._id,
        {
          $set: {
            paymentType: paymentType,
            isComplete: true,
          },
        },
        { new: true },
      );
      sendNotify(
        {
          product: isExist.orderID,
          Qty: isExist.qty,
        },
        "ORDPRCS",
      );

      //add here to quantityChanger
      quantityChanger("deduct", isExist);

      return res.status(200).json({
        message: "Order requested....",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ isComplete: true });
    const users = await userModel.find({});
    const products = await productModel.find({});

    // Create lookup maps for fast access
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Build the result
    const finalResult = orders.map((order) => {
      const user = userMap.get(order.customerId.toString());
      const product = productMap.get(order.productId.toString());

      return {
        id: order._id,
        orderId: order.orderID,
        productId: product ? product.ProductId : "Unknown", // adjust field name
        customerName: user ? user.Name : "Unknown", // adjust field name
        quantity: parseInt(order.qty),
        orderDate: order.orderDate,
        orderStatus: order.orderStatus,
      };
    });

    return res.status(200).json(finalResult);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(404).json({ message: "InvalidID" });

    const order = await orderModel.findById(id);

    return res.status(200).json({ order });
  } catch (err) {
    return res.status(404).json({ message: "Internal Server Error" });
  }
};

exports.orderEditByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    console.log(orderStatus);

    const isOrder = await orderModel.findById(id);
    if (!isOrder) return res.status(404).json({ message: "InvalidID" });

    await orderModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });

    if (isOrder.orderStatus === "Confirmed") {
      if (orderStatus === "Cancelled") quantityChanger("add", isOrder);
      if (orderStatus === "Processing") quantityChanger("add", isOrder);
    }

    if (isOrder.orderStatus === "Processing") {
      if (orderStatus === "Confirmed") quantityChanger("deduct", isOrder);
    }

    if (isOrder.orderStatus === "Cancelled") {
      if (orderStatus === "Confirmed") quantityChanger("deduct", isOrder);
    }

    if (req.body.orderStatus == "Confirmed") {
      sendNotify({ orderID: isOrder.orderID }, "PRDDISP");
    }
    return res.status(200).json({
      message: "Status Changed Successfully",
    });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.orderDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Check if user exists
    const isUser = await userModel.findById(id);
    if (!isUser) return res.status(404).json({ message: "Invalid ID" });

    // Step 2: Fetch all orders of the user
    const isOrder = await orderModel
      .find({ customerId: isUser._id, isComplete: true })
      .lean();

    if (isOrder.length === 0) {
      return res.status(200).json({ isUser, orders: {} });
    }

    // Step 3: Extract product IDs from the orders
    const productIds = isOrder.map((i) => i.productId);

    // Step 4: Fetch product details
    const products = await productModel
      .find({ _id: { $in: productIds } })
      .lean();

    // Step 5: Build a product lookup map
    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    // Step 6: Fetch one image per product
    const images = await imageModel
      .find({ imageId: { $in: productIds } })
      .lean();

    // Step 7: Build a single-image map using ImageUrl
    const imageMap = {};
    images.forEach((img) => {
      const pid = img.imageId.toString();
      if (!imageMap[pid]) {
        imageMap[pid] = img.ImageUrl || "";
      }
    });

    // Step 8: Structure final response
    const orders = {};
    isOrder.forEach((order) => {
      const product = productMap[order.productId.toString()] || {};
      const image = imageMap[order.productId.toString()] || "";

      orders[order.orderID] = {
        id: order._id,
        orderId: order.orderID,
        orderDate: order.orderDate,
        status: order.orderStatus,
        trackId: order.trackId,
        expectedDeliveryDate: order.deliveredDate,
        product: {
          name: product.ProductName || "N/A",
          brand: product.CollectionName || "N/A",
          image: image, // Single image (base64 or URL)
          price: product.OfferPrice || 0,
          quantity: order.qty || 1,
          size: order.size || "",
        },
      };
    });

    // Step 9: Return response
    return res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.userCancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // console.log(id, reason)

    const isOrder = await orderModel.findById(id);

    if (!isOrder) return res.status(404).json({ message: "InvalidID" });

    await orderModel.findByIdAndUpdate(
      id,
      {
        $set: {
          orderStatus: "Cancelled",
          cancellationReason: req.body.reason,
        },
      },
      { new: true },
    );

    quantityChanger("add", isOrder);

    return res.status(200).json({
      message: "Order Cancelled...",
    });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.invoiceData = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel.findById(id);
    if (!order) return res.status(404).json({ message: "Invalid Order ID" });
    const product = await productModel.findById(order.productId);
    const customer = await userModel.findById(order.customerId);
    const address = await addressModel.findById(order.addressId);

    //set invoice number
    const invoiceCount = order.orderID.split("/");
    const invoiceNumberGen = "IN-" + invoiceCount[3];
    const invoiceDetailsGen = "KL-" + invoiceCount[1] + "-" + invoiceCount[3];

    const invoiceDetails = {
      order: {
        orderId: order.orderID || "",
        orderedDate: order.orderDate || "",
        paymentType: order.paymentType || "",
        orderStatus: order.orderStatus || "",
        productId: product.ProductId || "",
        size: order.size || "",
        qty: order.qty || "",
        invoiceNumber: invoiceNumberGen || "",
        invoiceDate: dateFormat("MM-DDTH-YYYY"),
        invoiceDetails: invoiceDetailsGen || "",
        placeOfSupply: "Kerala",
        placeOfDelivery: "Kerala",
      },
      user: {
        name: customer.Name || "",
        email: customer.Email || "",
        phone: customer.Mobile || "",
        panNo: "XXXXXXXXX",
        gstNo: "XXXXXXXXX",
      },
      address: {
        billingName: address.name || "",
        billingCompany: address.address || "",
        billingStreet: address.city || "",
        billingCity: address.district || "",
        billingState: address.state || "",
        billingPincode: address.zipCode || "",
        billingCountry: "IN",
        billingStateCode: "32",
        shippingName: address.name || "",
        shippingCompany: address.address || "",
        shippingStreet: address.city || "",
        shippingCity: address.district || "",
        shippingState: address.state || "",
        shippingPincode: address.zipCode || "",
        shippingCountry: "IN",
        shippingStateCode: "32",
      },
      product: {
        name: product.ProductName || "",
        price: product.OfferPrice || "",
        taxRate: 0,
        taxType: "",
        hsnCode: "",
        discount: 0,
        shippingCharges: 0,
        shippingTaxRate: 0,
        shippingTaxType: "",
        sellerName: "The Littlemaker",
        sellerAddress: "XXXXXADDRESSXXXXX",
        sellerCity: "NILAMBUR",
        sellerState: "KERALA",
        sellerPincode: "676589",
        sellerCountry: "IN",
      },
    };

    return res.status(200).json({
      invoiceDetails,
    });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.setStickerData = async (req, res) => {
  try {
    const {
      width,
      height,
      unit,
      text,
      font,
      textColor,
      textSize,
      textPosition,
      imagePreview,
      imageSize,
      imagePosition,
      contentType,
      randomStickerId,
      productId,
      localUser,
    } = req.body;
    let msg = "something Went Wrong";

    if (!localUser) return res.status(404).json({ message: "Invalid ID..." });

    if (!randomStickerId)
      return res.status(404).json({ message: "No Sticker Id Generated..." });

    if (!productId)
      return res.status(404).json({ message: "Invalid Product ID..." });

    const isCacheAvail = await cacheModel.findOne({
      userId: localUser,
      productId: productId,
    });

    // for text
    if (!isCacheAvail && contentType == "text") {
      await stickerModel.create({
        productId,
        width,
        height,
        unit,
        text,
        font,
        textColor,
        textSize,
        textPosition,
        imagePreview: "",
        imageSize: "",
        imagePosition: "",
        contentType,
        randomStickerId,
        localUser,
      });

      await cacheModel.create({
        userId: localUser,
        productId,
        stickerId: randomStickerId,
      });
    } else if (contentType == "text") {
      const stickerData = await stickerModel.findOne({
        randomStickerId: isCacheAvail.stickerId,
      });
      await stickerModel.findByIdAndUpdate(
        { _id: stickerData._id },
        {
          $set: {
            productId,
            width,
            height,
            unit,
            text,
            font,
            textColor,
            textSize,
            textPosition,
            imagePreview: "",
            imageSize: "",
            imagePosition: "",
            contentType,
            localUser,
          },
        },
        { new: true },
      );
    }

    // for Image
    if(!isCacheAvail && contentType === "image"){
      await stickerModel.create({
        productId,
        width,
        height,
        unit,
        text: "",
        font: "",
        textColor: "",
        textSize: "",
        textPosition: "",
        imagePreview,
        imageSize,
        imagePosition,
        contentType,
        randomStickerId,
        localUser,
      });

      await cacheModel.create({
        userId: localUser,
        productId,
        stickerId: randomStickerId,
      });
    }else if (contentType == "image") {
      const stickerData = await stickerModel.findOne({
        randomStickerId: isCacheAvail.stickerId,
      });
      await stickerModel.findByIdAndUpdate(
        { _id: stickerData._id },
        {
          $set: {
            productId,
            width,
            height,
            unit,
            text: "",
            font: "",
            textColor: "",
            textSize: "",
            textPosition: "",
            imagePreview,
            imageSize,
            imagePosition,
            contentType,
            localUser,
          },
        },
        { new: true },
      );
    }

    return res.status(200).json({
      message: "Your sticker data is saved our records...",
    });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.getExistStickerData = async (req, res) => {
  try {
    const { productId, userId } = req.query;
    const userCache = await cacheModel.find({ userId: userId }).lean();
    const cache = userCache.find((usrchc) => usrchc.productId === productId);
    const stickerData = await stickerModel.findOne({
      randomStickerId: cache.stickerId,
    });
    return res.status(200).json({ stickerData });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.getStickerData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const stk = await stickerModel.findOne({ ordId: id });
    return res.status(200).json({ stk });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};
