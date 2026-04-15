import {
  approveTestimonial,
  createTestimonial,
  listApprovedTestimonials,
  listPendingTestimonials,
} from "../services/testimonialService.js";

export async function getTestimonials(_request, response, next) {
  try {
    const testimonials = await listApprovedTestimonials();
    response.json({ data: testimonials });
  } catch (error) {
    next(error);
  }
}

export async function postTestimonial(request, response, next) {
  try {
    const result = await createTestimonial(request.body);

    response.status(201).json({
      message: "Review submitted successfully and is awaiting approval.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPendingTestimonials(_request, response, next) {
  try {
    const testimonials = await listPendingTestimonials();
    response.json({ data: testimonials });
  } catch (error) {
    next(error);
  }
}

export async function patchApproveTestimonial(request, response, next) {
  try {
    const testimonial = await approveTestimonial(request.params.id);
    response.json({
      message: "Testimonial approved successfully.",
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
}
