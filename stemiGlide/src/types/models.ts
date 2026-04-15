export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  createdAt: string;
};

export type Address = {
  id: number;
  userId: number;
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type Testimonial = {
  id: number;
  userId: number;
  reviewerName: string;
  quote: string;
  rating: number;
  approved: boolean;
  createdAt: string;
};

export type Order = {
  id: number;
  orderGroupId?: string | null;
  userId: number;
  customerName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  productName: string;
  quantity: number;
  itemPrice: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type ProductFeature = {
  title: string;
  description: string;
};

export type DemoStep = {
  stepNumber: number;
  title: string;
  description: string;
};

export type InquiryFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  message: string;
  sixLeadQuantity: number;
  fourLeadQuantity: number;
};

export type ApiCollectionResponse<T> = {
  data: T[];
};

export type InquiryResponse = {
  message: string;
  data: {
    user: User;
    address: Address;
    orders: Order[];
    inquiryMessage: string;
  };
};

export type ReviewFormValues = {
  name: string;
  email: string;
  organization: string;
  rating: string;
  review: string;
};

export type TestimonialResponse = {
  message: string;
  data: {
    user: User;
    testimonial: Testimonial;
  };
};

export type ApprovedTestimonialResponse = {
  message: string;
  data: Testimonial;
};

export type OrderPriceResponse = {
  message: string;
  data: Order;
};

export type OrderShipResponse = {
  message: string;
  data: Order;
};

export type ItemPrice = {
  productName: string;
  itemPrice: number;
  updatedAt: string;
};

export type ItemPriceResponse = {
  message?: string;
  data: ItemPrice;
};

export type ItemPriceCollectionResponse = {
  message?: string;
  data: ItemPrice[];
};

export type CheckoutSessionResponse = {
  message: string;
  data: {
    orders: Order[];
    checkoutUrl: string | null;
    sessionId: string;
  };
};
