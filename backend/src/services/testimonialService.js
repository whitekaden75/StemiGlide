import { database } from "../repositories/database.js";
import { AppError } from "../utils/AppError.js";

export async function listApprovedTestimonials() {
  return database.getApprovedTestimonials();
}

export async function listPendingTestimonials() {
  return database.getPendingTestimonials();
}

export async function createTestimonial(payload) {
  validateTestimonialPayload(payload);

  const { firstName, lastName } = splitName(payload.name.trim());
  const normalizedEmail = payload.email.trim().toLowerCase();

  const existingUser = await database.findUserByEmail(normalizedEmail);

  const user =
    existingUser ??
    (await database.createUser({
      firstName,
      lastName,
      email: normalizedEmail,
      phone: "",
      organization: payload.organization?.trim() ?? "",
    }));

  const testimonial = await database.createTestimonial({
    userId: user.id,
    quote: payload.review.trim(),
    rating: Number(payload.rating),
    approved: false,
  });

  return {
    user,
    testimonial: {
      ...testimonial,
      reviewerName: `${user.firstName} ${user.lastName}`,
    },
  };
}

export async function approveTestimonial(id) {
  const numericId = Number(id);

  if (Number.isNaN(numericId) || numericId <= 0) {
    throw new AppError("A valid testimonial id is required.", 400);
  }

  const testimonial = await database.approveTestimonial(numericId);

  if (!testimonial) {
    throw new AppError("Testimonial not found.", 404);
  }

  return testimonial;
}

function validateTestimonialPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new AppError("Request body is required.", 400);
  }

  const requiredFields = ["name", "email", "review"];

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

  const rating = Number(payload.rating);

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    throw new AppError("rating must be a number between 1 and 5.", 400);
  }
}

function splitName(name) {
  const parts = name.split(" ").filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}
