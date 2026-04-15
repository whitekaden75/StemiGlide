import {
  createCheckoutSession,
  createInquiry,
  getItemPrices,
  listRecentOrders,
  markOrderShipped,
  updateItemPrice,
  updateOrderPrice,
} from "../services/inquiryService.js";

export async function postInquiry(request, response, next) {
  try {
    const result = await createInquiry(request.body);

    response.status(201).json({
      message: "Inquiry saved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecentOrders(_request, response, next) {
  try {
    const orders = await listRecentOrders();
    response.json({ data: orders });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentItemPrices(_request, response, next) {
  try {
    const itemPrices = await getItemPrices();
    response.json({ data: itemPrices });
  } catch (error) {
    next(error);
  }
}

export async function patchOrderPrice(request, response, next) {
  try {
    const order = await updateOrderPrice(
      request.params.id,
      request.body.itemPrice,
    );

    response.json({
      message: "Order price updated successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function patchItemPrice(request, response, next) {
  try {
    const itemPrice = await updateItemPrice(
      request.body.productName,
      request.body.itemPrice,
    );

    response.json({
      message: "Default item price updated successfully.",
      data: itemPrice,
    });
  } catch (error) {
    next(error);
  }
}

export async function postCheckoutSession(request, response, next) {
  try {
    const session = await createCheckoutSession(request.body);

    response.status(201).json({
      message: "Checkout session created successfully.",
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

export async function patchShipOrder(request, response, next) {
  try {
    const order = await markOrderShipped(request.params.id);

    response.json({
      message: "Order marked as shipped.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
