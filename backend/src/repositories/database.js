import { db } from "../config/db.js";

const orderSelect = `SELECT
  o.id,
  o.order_group_id AS "orderGroupId",
  o.user_id AS "userId",
  CONCAT(u.first_name, ' ', u.last_name) AS "customerName",
  u.email,
  u.phone,
  u.organization,
  o.product_name AS "productName",
  o.quantity,
  o.item_price AS "itemPrice",
  o.total_price AS "totalPrice",
  o.status,
  o.created_at AS "createdAt",
  a.street,
  a.city,
  a.state,
  a.zip
FROM orders o
JOIN users u ON u.id = o.user_id
LEFT JOIN LATERAL (
  SELECT
    street,
    city,
    state,
    zip
  FROM address
  WHERE user_id = o.user_id
  ORDER BY id DESC
  LIMIT 1
) a ON TRUE`;

export const database = {
  async findUserByEmail(email) {
    const result = await db.query(
      `SELECT
        id,
        first_name AS "firstName",
        last_name AS "lastName",
        email,
        phone,
        organization,
        created_at AS "createdAt"
      FROM users
      WHERE email = $1
      LIMIT 1`,
      [email],
    );

    return result.rows[0] ?? null;
  },

  async getApprovedTestimonials() {
    const result = await db.query(
      `SELECT
        t.id,
        t.user_id AS "userId",
        CONCAT(u.first_name, ' ', u.last_name) AS "reviewerName",
        t.quote,
        t.rating,
        t.approved,
        t.created_at AS "createdAt"
      FROM testimonials t
      JOIN users u ON u.id = t.user_id
      WHERE t.approved = TRUE
      ORDER BY t.created_at DESC`,
    );

    return result.rows;
  },

  async getPendingTestimonials() {
    const result = await db.query(
      `SELECT
        t.id,
        t.user_id AS "userId",
        CONCAT(u.first_name, ' ', u.last_name) AS "reviewerName",
        t.quote,
        t.rating,
        t.approved,
        t.created_at AS "createdAt"
      FROM testimonials t
      JOIN users u ON u.id = t.user_id
      WHERE t.approved = FALSE
      ORDER BY t.created_at DESC`,
    );

    return result.rows;
  },

  async getRecentOrders() {
    const result = await db.query(
      `${orderSelect}
      ORDER BY o.created_at DESC`,
    );

    return result.rows;
  },

  async getCurrentItemPrice() {
    const productSetting = await db.query(
      `SELECT unit_price AS "itemPrice"
      FROM product_settings
      ORDER BY updated_at DESC
      LIMIT 1`,
    );

    if (productSetting.rows[0]?.itemPrice != null) {
      return productSetting.rows[0].itemPrice;
    }

    const result = await db.query(
      `SELECT item_price AS "itemPrice"
      FROM orders
      ORDER BY created_at DESC
      LIMIT 1`,
    );

    return result.rows[0]?.itemPrice ?? null;
  },

  async getProductPrice(productName) {
    const result = await db.query(
      `SELECT
        product_name AS "productName",
        unit_price AS "itemPrice",
        updated_at AS "updatedAt"
      FROM product_settings
      WHERE product_name = $1
      LIMIT 1`,
      [productName],
    );

    return result.rows[0] ?? null;
  },

  async upsertProductPrice(productName, itemPrice) {
    const result = await db.query(
      `INSERT INTO product_settings (
        product_name,
        unit_price,
        updated_at
      )
      VALUES ($1, $2, NOW())
      ON CONFLICT (product_name)
      DO UPDATE SET
        unit_price = EXCLUDED.unit_price,
        updated_at = NOW()
      RETURNING
        product_name AS "productName",
        unit_price AS "itemPrice",
        updated_at AS "updatedAt"`,
      [productName, itemPrice],
    );

    return result.rows[0];
  },

  async createUser(userInput) {
    const createdAt = new Date().toISOString();

    const result = await db.query(
      `INSERT INTO users (
        first_name,
        last_name,
        email,
        phone,
        organization,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        first_name AS "firstName",
        last_name AS "lastName",
        email,
        phone,
        organization,
        created_at AS "createdAt"`,
      [
        userInput.firstName,
        userInput.lastName,
        userInput.email,
        userInput.phone,
        userInput.organization,
        createdAt,
      ],
    );

    return result.rows[0];
  },

  async createAddress(addressInput) {
    const result = await db.query(
      `INSERT INTO address (
        user_id,
        street,
        city,
        state,
        zip
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        user_id AS "userId",
        street,
        city,
        state,
        zip`,
      [
        addressInput.userId,
        addressInput.street,
        addressInput.city,
        addressInput.state,
        addressInput.zip,
      ],
    );

    return result.rows[0];
  },

  async createOrder(orderInput) {
    const createdAt = new Date().toISOString();

    const result = await db.query(
      `INSERT INTO orders (
        order_group_id,
        user_id,
        product_name,
        quantity,
        item_price,
        total_price,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        order_group_id AS "orderGroupId",
        user_id AS "userId",
        product_name AS "productName",
        quantity,
        item_price AS "itemPrice",
        total_price AS "totalPrice",
        status,
        created_at AS "createdAt"`,
      [
        orderInput.orderGroupId ?? null,
        orderInput.userId,
        orderInput.productName,
        orderInput.quantity,
        orderInput.itemPrice,
        orderInput.totalPrice,
        orderInput.status,
        createdAt,
      ],
    );

    return result.rows[0];
  },

  async updateOrderPrice(id, itemPrice) {
    const result = await db.query(
      `UPDATE orders
      SET
        item_price = $2,
        total_price = quantity * $2
      WHERE id = $1
      RETURNING id`,
      [id, itemPrice],
    );

    if (!result.rows[0]) {
      return null;
    }

    const refreshedOrder = await db.query(
      `${orderSelect}
      WHERE o.id = $1`,
      [id],
    );

    return refreshedOrder.rows[0] ?? null;
  },

  async updateOrderStatus(id, status) {
    const result = await db.query(
      `WITH target_order AS (
        SELECT id, order_group_id
        FROM orders
        WHERE id = $1
      )
      UPDATE orders
      SET status = $2
      WHERE id = $1
         OR (
           EXISTS (SELECT 1 FROM target_order WHERE order_group_id IS NOT NULL)
           AND order_group_id = (SELECT order_group_id FROM target_order LIMIT 1)
         )
      RETURNING id`,
      [id, status],
    );

    if (!result.rows[0]) {
      return null;
    }

    const refreshedOrder = await db.query(
      `${orderSelect}
      WHERE o.id = $1`,
      [id],
    );

    return refreshedOrder.rows[0] ?? null;
  },

  async createTestimonial(testimonialInput) {
    const createdAt = new Date().toISOString();

    const result = await db.query(
      `INSERT INTO testimonials (
        user_id,
        quote,
        rating,
        approved,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        user_id AS "userId",
        quote,
        rating,
        approved,
        created_at AS "createdAt"`,
      [
        testimonialInput.userId,
        testimonialInput.quote,
        testimonialInput.rating,
        testimonialInput.approved,
        createdAt,
      ],
    );

    return result.rows[0];
  },

  async approveTestimonial(id) {
    const result = await db.query(
      `UPDATE testimonials t
      SET approved = TRUE
      FROM users u
      WHERE t.id = $1
        AND u.id = t.user_id
      RETURNING
        t.id,
        t.user_id AS "userId",
        CONCAT(u.first_name, ' ', u.last_name) AS "reviewerName",
        t.quote,
        t.rating,
        t.approved,
        t.created_at AS "createdAt"`,
      [id],
    );

    return result.rows[0] ?? null;
  },

  async getDatabaseStatus() {
    const result = await db.query("SELECT NOW() AS current_time");

    return {
      connected: true,
      currentTime: result.rows[0].current_time,
    };
  },
};
