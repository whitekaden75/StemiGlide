import { useEffect, useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { productOptions } from "../data/siteContent";
import { fetchJson } from "../lib/api";
import type {
  ApiCollectionResponse,
  ApprovedTestimonialResponse,
  ItemPriceCollectionResponse,
  ItemPriceResponse,
  Order,
  OrderPriceResponse,
  OrderShipResponse,
  Testimonial,
} from "../types/models";

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function normalizeOrder(order: Order) {
  return {
    ...order,
    itemPrice: toNumber(order.itemPrice),
    totalPrice: toNumber(order.totalPrice),
  };
}

type GroupedOrder = {
  id: number;
  orderGroupId: string;
  userId: number;
  customerName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  status: string;
  createdAt: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  items: Order[];
  totalQuantity: number;
  totalPrice: number;
};

function groupOrders(orders: Order[]): GroupedOrder[] {
  const groups = new Map<string, GroupedOrder>();

  for (const order of orders) {
    // Multiple line items from one checkout share the same order group id,
    // so admin sees one grouped order instead of separate cards.
    const groupKey = order.orderGroupId ?? `single-${order.id}`;
    const existingGroup = groups.get(groupKey);

    if (existingGroup) {
      existingGroup.items.push(order);
      existingGroup.totalQuantity += order.quantity;
      existingGroup.totalPrice += toNumber(order.totalPrice);
      continue;
    }

    groups.set(groupKey, {
      id: order.id,
      orderGroupId: groupKey,
      userId: order.userId,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      organization: order.organization,
      status: order.status,
      createdAt: order.createdAt,
      street: order.street,
      city: order.city,
      state: order.state,
      zip: order.zip,
      items: [order],
      totalQuantity: order.quantity,
      totalPrice: toNumber(order.totalPrice),
    });
  }

  return Array.from(groups.values()).sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function formatShippingLabel(order: GroupedOrder) {
  return [
    order.customerName || "Customer name missing",
    order.organization || "",
    order.street || "Street missing",
    [order.city, order.state, order.zip].filter(Boolean).join(", "),
    order.email || "",
    order.phone || "",
    "",
    ...order.items.map(
      (item) => `${item.productName} x${item.quantity} ($${toNumber(item.totalPrice).toFixed(2)})`,
    ),
    `Order Group ${order.orderGroupId}`,
  ]
    .filter((line, index, lines) => {
      if (index === 3 && line === "") {
        return false;
      }

      return line !== "" || index >= lines.length - 2;
    })
    .join("\n");
}

export function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingTestimonials, setPendingTestimonials] = useState<Testimonial[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [testimonialError, setTestimonialError] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [priceDrafts, setPriceDrafts] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [defaultPriceDrafts, setDefaultPriceDrafts] = useState<Record<string, string>>(
    Object.fromEntries(
      productOptions.map((product) => [
        product.name,
        product.defaultPrice.toFixed(2),
      ]),
    ),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        // Admin loads orders, pending testimonials, and product pricing
        // together because all three are managed from this page.
        const [ordersResponse, pendingResponse, itemPriceResponse] = await Promise.all([
          fetchJson<ApiCollectionResponse<Order>>("/api/inquiries/orders"),
          fetchJson<ApiCollectionResponse<Testimonial>>(
            "/api/testimonials/pending",
          ),
          fetchJson<ItemPriceCollectionResponse>("/api/inquiries/item-prices"),
        ]);

        if (!cancelled) {
          const normalizedOrders = ordersResponse.data.map(normalizeOrder);

          setOrders(normalizedOrders);
          setPriceDrafts(
            Object.fromEntries(
              normalizedOrders.map((order) => [
                order.id,
                order.itemPrice.toFixed(2),
              ]),
            ),
          );
          setPendingTestimonials(pendingResponse.data);
          setDefaultPriceDrafts((currentDrafts) => ({
            ...currentDrafts,
            ...Object.fromEntries(
              itemPriceResponse.data.map((itemPrice) => [
                itemPrice.productName,
                toNumber(itemPrice.itemPrice).toFixed(2),
              ]),
            ),
          }));
          setLoadError("");
          setTestimonialError("");
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load admin dashboard data.";
          setLoadError(message);
          setTestimonialError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const groupedOrders = groupOrders(orders);
  const statusOptions = Array.from(
    new Set(groupedOrders.map((order) => order.status)),
  ).sort();
  const filteredOrders = groupedOrders.filter((order) => {
    // Filters are applied on the grouped order cards so admin can narrow
    // the list by workflow status and checkout date.
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    const createdAt = new Date(order.createdAt);

    if (dateFromFilter) {
      const fromDate = new Date(`${dateFromFilter}T00:00:00`);

      if (createdAt < fromDate) {
        return false;
      }
    }

    if (dateToFilter) {
      const toDate = new Date(`${dateToFilter}T23:59:59.999`);

      if (createdAt > toDate) {
        return false;
      }
    }

    return true;
  });
  const ordersPerPage = 5;
  // Pagination is handled on the client after filters are applied.
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safeCurrentPage - 1) * ordersPerPage,
    safeCurrentPage * ordersPerPage,
  );
  const totalOrders = filteredOrders.length;
  const totalQuantity = filteredOrders.reduce(
    (sum, order) => sum + order.totalQuantity,
    0,
  );
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + order.totalPrice,
    0,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function handleApproveTestimonial(id: number) {
    setApprovalMessage("");
    setTestimonialError("");

    try {
      const response = await fetchJson<ApprovedTestimonialResponse>(
        `/api/testimonials/${id}/approve`,
        {
          method: "PATCH",
        },
      );

      setPendingTestimonials((currentTestimonials) =>
        currentTestimonials.filter((testimonial) => testimonial.id !== id),
      );
      setApprovalMessage(response.message);
    } catch (error) {
      setTestimonialError(
        error instanceof Error
          ? error.message
          : "Unable to approve the testimonial.",
      );
    }
  }

  async function handleOrderPriceSave(id: number) {
    setLoadError("");
    setOrderMessage("");

    try {
      const response = await fetchJson<OrderPriceResponse>(
        `/api/inquiries/orders/${id}/price`,
        {
          method: "PATCH",
          body: JSON.stringify({
            itemPrice: Number(priceDrafts[id]),
          }),
        },
      );

      const normalizedOrder = normalizeOrder(response.data);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id ? normalizedOrder : order,
        ),
      );
      setPriceDrafts((currentDrafts) => ({
        ...currentDrafts,
        [id]: normalizedOrder.itemPrice.toFixed(2),
      }));
      setOrderMessage(response.message);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to update the order price.",
      );
    }
  }

  async function handleDefaultPriceSave(productName: string) {
    setLoadError("");
    setOrderMessage("");

    try {
      const response = await fetchJson<ItemPriceResponse>(
        "/api/inquiries/item-prices",
        {
          method: "PATCH",
          body: JSON.stringify({
            productName,
            itemPrice: Number(defaultPriceDrafts[productName]),
          }),
        },
      );

      setDefaultPriceDrafts((currentDrafts) => ({
        ...currentDrafts,
        [productName]: toNumber(response.data.itemPrice).toFixed(2),
      }));
      setOrderMessage(response.message ?? "Default item price updated successfully.");
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to update the default item price.",
      );
    }
  }

  function handleDownloadShippingLabel(order: GroupedOrder) {
    const label = formatShippingLabel(order);
    const file = new Blob([label], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `order-${order.orderGroupId}-shipping.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

  async function handleMarkShipped(id: number) {
    setLoadError("");
    setOrderMessage("");

    try {
      const response = await fetchJson<OrderShipResponse>(
        `/api/inquiries/orders/${id}/ship`,
        {
          method: "PATCH",
        },
      );

      const normalizedOrder = normalizeOrder(response.data);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id ? normalizedOrder : order,
        ),
      );
      setOrderMessage(response.message);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to mark the order as shipped.",
      );
    }
  }

  return (
    <div className="page-stack">
      <section className="card">
        <SectionHeading
          eyebrow="Admin Dashboard"
          title="ORDERS and quantities"
          description="This page reads from the backend orders endpoint so you can quickly review incoming order volume and estimated revenue."
        />

        <div className="admin-metrics">
          <article className="admin-metric-card">
            <span className="stat-label">Total Orders</span>
            <strong>{totalOrders}</strong>
          </article>
          <article className="admin-metric-card">
            <span className="stat-label">Total Quantity</span>
            <strong>{totalQuantity}</strong>
          </article>
          <article className="admin-metric-card">
            <span className="stat-label">Estimated Revenue</span>
            <strong>${totalRevenue.toFixed(2)}</strong>
          </article>
        </div>
      </section>

      <section className="card">
        <div className="admin-table-header">
          <h3>Default item price</h3>
          <span className="meta-line">
            Controls the price used for future checkout sessions for each product
          </span>
        </div>

        <div className="admin-order-list">
          {productOptions.map((product) => (
            <article className="admin-order-card" key={product.name}>
              <div className="admin-order-top">
                <div>
                  <p className="eyebrow">Product Price</p>
                  <h4>{product.name}</h4>
                </div>
              </div>

              <div className="admin-price-editor">
                <input
                  className="admin-price-input"
                  min="0"
                  onChange={(event) =>
                    setDefaultPriceDrafts((currentDrafts) => ({
                      ...currentDrafts,
                      [product.name]: event.target.value,
                    }))
                  }
                  step="0.01"
                  type="number"
                  value={defaultPriceDrafts[product.name] ?? ""}
                />
                <button
                  className="button button-primary"
                  onClick={() => void handleDefaultPriceSave(product.name)}
                  type="button"
                >
                  Save Price
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="admin-table-header">
          <h3>Pending testimonials</h3>
          <span className="meta-line">
            {pendingTestimonials.length} awaiting approval
          </span>
        </div>

        {testimonialError ? (
          <p className="error-message">{testimonialError}</p>
        ) : null}
        {approvalMessage ? (
          <p className="success-message">{approvalMessage}</p>
        ) : null}

        {pendingTestimonials.length > 0 ? (
          <div className="pending-testimonial-list">
            {pendingTestimonials.map((testimonial) => (
              <article className="testimonial-card" key={testimonial.id}>
                <span className="rating">{"★".repeat(testimonial.rating)}</span>
                <p>{testimonial.quote}</p>
                <span className="meta-line">
                  {testimonial.reviewerName} • Submitted{" "}
                  {new Date(testimonial.createdAt).toLocaleString()}
                </span>
                <div className="button-row">
                  <button
                    className="button button-primary"
                    onClick={() => void handleApproveTestimonial(testimonial.id)}
                    type="button"
                  >
                    Approve Testimonial
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No pending testimonials right now.</p>
        )}
      </section>

      <section className="card">
        <div className="admin-table-header">
          <h3>ORDERS list</h3>
          <span className="meta-line">
            {isLoading ? "Loading latest orders..." : `${filteredOrders.length} records`}
          </span>
        </div>

        {orderMessage ? <p className="success-message">{orderMessage}</p> : null}
        {loadError ? <p className="error-message">{loadError}</p> : null}

        <div className="admin-filter-bar">
          <label>
            Status
            <select
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            From date
            <input
              onChange={(event) => setDateFromFilter(event.target.value)}
              type="date"
              value={dateFromFilter}
            />
          </label>

          <label>
            To date
            <input
              onChange={(event) => setDateToFilter(event.target.value)}
              type="date"
              value={dateToFilter}
            />
          </label>

          <button
            className="button button-secondary admin-filter-clear"
            onClick={() => {
              setStatusFilter("all");
              setDateFromFilter("");
              setDateToFilter("");
            }}
            type="button"
          >
            Clear Filters
          </button>
        </div>

        <div className="admin-table-wrapper">
          {paginatedOrders.length > 0 ? (
            <div className="admin-order-list">
              {paginatedOrders.map((order) => (
                <article className="admin-order-card" key={order.id}>
                  <div className="admin-order-top">
                    <div>
                      <p className="eyebrow">Order Group</p>
                      <h4>{order.customerName || `User ${order.userId}`}</h4>
                      <p className="meta-line">
                        {order.email || "No email"} • {order.orderGroupId}
                      </p>
                    </div>
                    <div className="admin-status-pill">{order.status}</div>
                  </div>

                  <div className="admin-order-grid">
                    <div className="admin-order-field">
                      <span className="admin-field-label">Items</span>
                      <div className="admin-line-item-list">
                        {order.items.map((item) => (
                          <div className="admin-line-item" key={item.id}>
                            <strong>{item.productName}</strong>
                            <span>
                              Qty {item.quantity} • ${toNumber(item.totalPrice).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="admin-order-field">
                      <span className="admin-field-label">Total Quantity</span>
                      <strong>{order.totalQuantity}</strong>
                    </div>

                    <div className="admin-order-field">
                      <span className="admin-field-label">Total</span>
                      <strong>${order.totalPrice.toFixed(2)}</strong>
                    </div>

                    <div className="admin-order-field">
                      <span className="admin-field-label">Created</span>
                      <strong>{new Date(order.createdAt).toLocaleString()}</strong>
                    </div>

                    <div className="admin-order-field admin-order-field-wide">
                      <span className="admin-field-label">Shipping Address</span>
                      <div className="admin-shipping-block">
                        <span>{order.street || "No street saved"}</span>
                        <span>
                          {[order.city, order.state, order.zip]
                            .filter(Boolean)
                            .join(", ") || "No city/state/zip saved"}
                        </span>
                      </div>
                    </div>

                    <div className="admin-order-field admin-order-field-wide">
                      <span className="admin-field-label">Item Price Controls</span>
                      <div className="admin-line-item-list">
                        {order.items.map((item) => (
                          <div className="admin-line-item admin-line-item-editor" key={item.id}>
                            <strong>{item.productName}</strong>
                            <div className="admin-price-editor">
                              <input
                                className="admin-price-input"
                                min="0"
                                onChange={(event) =>
                                  setPriceDrafts((currentDrafts) => ({
                                    ...currentDrafts,
                                    [item.id]: event.target.value,
                                  }))
                                }
                                step="0.01"
                                type="number"
                                value={priceDrafts[item.id] ?? ""}
                              />
                              <button
                                className="button button-secondary"
                                onClick={() => void handleOrderPriceSave(item.id)}
                                type="button"
                              >
                                Save Price
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="admin-order-actions">
                    <button
                      className="button button-secondary"
                      onClick={() => handleDownloadShippingLabel(order)}
                      type="button"
                    >
                      Download Label
                    </button>
                    <button
                      className="button button-primary"
                      disabled={order.status === "Shipped"}
                      onClick={() => void handleMarkShipped(order.id)}
                      type="button"
                    >
                      {order.status === "Shipped" ? "Shipped" : "Mark Shipped"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No orders match the current filters.</p>
          )}
        </div>

        {filteredOrders.length > 0 ? (
          <div className="admin-pagination">
            <span className="meta-line">
              Page {safeCurrentPage} of {totalPages}
            </span>
            <div className="button-row">
              <button
                className="button button-secondary"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                type="button"
              >
                Previous
              </button>
              <button
                className="button button-secondary"
                disabled={safeCurrentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
