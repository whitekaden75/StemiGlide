import { database } from "../repositories/database.js";
import { AppError } from "../utils/AppError.js";
import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { randomUUID } from "node:crypto";

const PRODUCT_CATALOG = {
  "6 Lead StemiGlide": {
    description: "6 lead 3D printed EMT organizer for reducing tangled EKG leads.",
    unitPrice: 39,
  },
  "4 Lead StemiGlide": {
    description: "4 lead 3D printed EMT organizer for reducing tangled EKG leads.",
    unitPrice: 29,
  },
};

const PRODUCT_NAMES = Object.keys(PRODUCT_CATALOG);

export async function createInquiry(payload) {
  validateInquiryPayload(payload);

  const normalizedEmail = payload.email.trim().toLowerCase();
  const existingUser = await database.findUserByEmail(normalizedEmail);
  const user =
    existingUser ??
    (await database.createUser({
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: normalizedEmail,
      phone: payload.phone?.trim() ?? "",
      organization: payload.organization?.trim() ?? "",
    }));

  const address = await database.createAddress({
    userId: user.id,
    street: payload.street?.trim() ?? "",
    city: payload.city?.trim() ?? "",
    state: payload.state?.trim() ?? "",
    zip: payload.zip?.trim() ?? "",
  });

  const orderInputs = await buildSelectedOrderInputs(payload);
  const orderGroupId = randomUUID();
  const orders = await Promise.all(
    orderInputs.map((orderInput) =>
      database.createOrder({
        orderGroupId,
        userId: user.id,
        productName: orderInput.productName,
        quantity: orderInput.quantity,
        itemPrice: orderInput.itemPrice,
        totalPrice: orderInput.quantity * orderInput.itemPrice,
        status: "Inquiry received",
      }),
    ),
  );

  return {
    user,
    address,
    orders,
    inquiryMessage: payload.message?.trim() ?? "",
  };
}

export async function listRecentOrders() {
  return database.getRecentOrders();
}

export async function getItemPrices() {
  const itemPrices = await Promise.all(
    PRODUCT_NAMES.map(async (productName) => {
      const currentPrice = await database.getProductPrice(productName);

      if (currentPrice) {
        return currentPrice;
      }

      return {
        productName,
        itemPrice: PRODUCT_CATALOG[productName].unitPrice,
        updatedAt: new Date().toISOString(),
      };
    }),
  );

  return itemPrices;
}

export async function updateItemPrice(productName, itemPrice) {
  if (!PRODUCT_NAMES.includes(productName)) {
    throw new AppError("productName must be a valid product.", 400);
  }

  const numericItemPrice = Number(itemPrice);

  if (Number.isNaN(numericItemPrice) || numericItemPrice < 0) {
    throw new AppError("itemPrice must be a valid number greater than or equal to 0.", 400);
  }

  return database.upsertProductPrice(productName, numericItemPrice);
}

export async function updateOrderPrice(id, itemPrice) {
  const numericId = Number(id);
  const numericItemPrice = Number(itemPrice);

  if (Number.isNaN(numericId) || numericId <= 0) {
    throw new AppError("A valid order id is required.", 400);
  }

  if (Number.isNaN(numericItemPrice) || numericItemPrice < 0) {
    throw new AppError("itemPrice must be a valid number greater than or equal to 0.", 400);
  }

  const updatedOrder = await database.updateOrderPrice(numericId, numericItemPrice);

  if (!updatedOrder) {
    throw new AppError("Order not found.", 404);
  }

  return updatedOrder;
}

export async function markOrderShipped(id) {
  const numericId = Number(id);

  if (Number.isNaN(numericId) || numericId <= 0) {
    throw new AppError("A valid order id is required.", 400);
  }

  const updatedOrder = await database.updateOrderStatus(numericId, "Shipped");

  if (!updatedOrder) {
    throw new AppError("Order not found.", 404);
  }

  return updatedOrder;
}

export async function createCheckoutSession(payload) {
  validateInquiryPayload(payload);

  if (!env.stripeSecretKey) {
    throw new AppError("Stripe is not configured on the backend.", 500);
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const existingUser = await database.findUserByEmail(normalizedEmail);
  const user =
    existingUser ??
    (await database.createUser({
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: normalizedEmail,
      phone: payload.phone?.trim() ?? "",
      organization: payload.organization?.trim() ?? "",
    }));

  const address = await database.createAddress({
    userId: user.id,
    street: payload.street?.trim() ?? "",
    city: payload.city?.trim() ?? "",
    state: payload.state?.trim() ?? "",
    zip: payload.zip?.trim() ?? "",
  });

  const orderInputs = await buildSelectedOrderInputs(payload);
  const orderGroupId = randomUUID();
  const orders = await Promise.all(
    orderInputs.map((orderInput) =>
      database.createOrder({
        orderGroupId,
        userId: user.id,
        productName: orderInput.productName,
        quantity: orderInput.quantity,
        itemPrice: orderInput.itemPrice,
        totalPrice: orderInput.quantity * orderInput.itemPrice,
        status: "Awaiting Stripe payment",
      }),
    ),
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: env.stripeSuccessUrl,
    cancel_url: env.stripeCancelUrl,
    customer_email: user.email,
    line_items: orderInputs.map((orderInput) => ({
      quantity: orderInput.quantity,
      price_data: {
        currency: env.stripeCurrency,
        unit_amount: Math.round(orderInput.itemPrice * 100),
        product_data: {
          name: orderInput.productName,
          description: PRODUCT_CATALOG[orderInput.productName].description,
        },
      },
    })),
    metadata: {
      user_id: String(user.id),
      order_ids: orders.map((order) => order.id).join(","),
      order_group_id: orderGroupId,
      address_id: String(address.id),
    },
  });

  return {
    orders,
    checkoutUrl: session.url,
    sessionId: session.id,
  };
}

function validateInquiryPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new AppError("Request body is required.", 400);
  }

  const requiredFields = ["firstName", "lastName", "email"];

  for (const field of requiredFields) {
    if (
      typeof payload[field] !== "string" ||
      payload[field].trim().length === 0
    ) {
      throw new AppError(`${field} is required.`, 400);
    }
  }

  if (!payload.email.includes("@")) {
    throw new AppError("email must be a valid email address.", 400);
  }

  const sixLeadQuantity = Number(payload.sixLeadQuantity);
  const fourLeadQuantity = Number(payload.fourLeadQuantity);

  if (
    Number.isNaN(sixLeadQuantity) ||
    Number.isNaN(fourLeadQuantity) ||
    sixLeadQuantity < 0 ||
    fourLeadQuantity < 0
  ) {
    throw new AppError("Product quantities must be valid numbers greater than or equal to 0.", 400);
  }

  if (sixLeadQuantity + fourLeadQuantity < 1) {
    throw new AppError("At least one product quantity must be greater than 0.", 400);
  }
}

async function buildSelectedOrderInputs(payload) {
  const selectedProducts = [
    {
      productName: "6 Lead StemiGlide",
      quantity: Number(payload.sixLeadQuantity),
    },
    {
      productName: "4 Lead StemiGlide",
      quantity: Number(payload.fourLeadQuantity),
    },
  ].filter((product) => product.quantity > 0);

  return Promise.all(
    selectedProducts.map(async (product) => ({
      ...product,
      itemPrice: await getProductPriceValue(product.productName),
    })),
  );
}

async function getProductPriceValue(productName) {
  const currentPrice = await database.getProductPrice(productName);

  if (currentPrice?.itemPrice != null) {
    return Number(currentPrice.itemPrice);
  }

  return PRODUCT_CATALOG[productName].unitPrice;
}
