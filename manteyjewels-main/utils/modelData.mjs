import mongoose from "mongoose";

export const settings = {
  name: String,
  title: String,
  address: String,
  shortAddress: String,
  email: String,
  description: String,
  phoneHeader: String,
  phoneFooter: String,
  copyright: String,
  logo: Array,
  favicon: Array,
  gatewayImage: Array,
  headerCustomScript: String,
  footerCustomScript: String,
  language: { type: String, default: "en" },
  footerBanner: {
    security: {
      title: String,
      description: String,
    },
    support: {
      title: String,
      description: String,
    },
    delivery: {
      title: String,
      description: String,
    },
  },
  seo: {
    title: String,
    description: String,
    keyword: String,
    image: Array,
  },
  social: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    pinterest: String,
  },
  currency: {
    name: { type: String, default: "USD" },
    symbol: { type: String, default: "$" },
    exchangeRate: { type: Number, default: 1 },
  },
  color: {
    primary: String,
    primary_hover: String,
    secondary: String,
    body_gray: String,
    body_gray_contrast: String,
    primary_contrast: String,
    primary_hover_contrast: String,
    secondary_contrast: String,
  },
  script: {
    googleSiteVerificationId: String,
    facebookAppId: String,
    googleAnalyticsId: String,
    facebookPixelId: String,
    messengerPageId: String,
  },
  paymentGateway: {
    cod: { type: Boolean, default: true },
    phonePe: { type: Boolean, default: false },
    paypal: { type: Boolean, default: false },
    stripe: { type: Boolean, default: false },
    sslCommerz: { type: Boolean, default: false },
  },
  login: {
    facebook: { type: Boolean, default: false },
    google: { type: Boolean, default: false },
  },
  security: {
    loginForPurchase: { type: Boolean, default: false },
  },
};

export const commonSettings = {
  ruleSettingOrdered: Number,
  ruleSettingDelivered: Number,
  shippingReturnTexture: String,
  careInstructionTexture: String,
  sizeChart: Array,
  orderSvg: Array,
  shopDefault: Array,
  minPrice: Number,
  maxPrice: Number,
};

export const attribute = {
  name: String,
  values: Array,
  hideAttribute: { type: Boolean, default: false },
};

export const tag = {
  name: String,
  values: Array,
  hideAttribute: { type: Boolean, default: false },
};

export const category = {
  categoryId: String,
  name: String,
  icon: Array,
  banner: Array,
  slug: String,
  subCategories: Array,
  topCategory: { type: Boolean, default: false },
};

export const brand = {
  brandId: String,
  name: String,
  image: Array,
  slug: String,
  topBrand: { type: Boolean, default: false },
};

export const color = {
  name: String,
  value: String,
};

export const coupon = {
  code: { type: String, unique: true },
  amount: Number,
  active: Date,
  expired: Date,
};

export const newsletter = {
  subscribers: [
    {
      email: String,
      date: { type: Date, default: Date.now },
    },
  ],
};

export const order = {
  orderId: String,
  orderDate: { type: Date, default: Date.now },
  products: Array,
  status: String,
  billingInfo: Object,
  shippingInfo: Object,
  deliveryInfo: Object,
  paymentMethod: String,
  paymentId: String,
  merchantTransactionId: String,
  merchantUserId:String,
  totalPrice: Number,
  payAmount: Number,
  coupon: Object,
  orderStatus: String,
  paymentStatus: String,
  paymentDetails: Array,
  paymentRefundDetails: Array,
  new: { type: Boolean, default: true },
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  productId: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
};

export const product = {
  date: { type: Date, default: Date.now },
  name: String,
  slug: String,
  productId: String,
  unit: String,
  unitValue: String,
  price: Number,
  discount: Number,
  description: String,
  shortDescription: String,
  type: String,
  image: Array,
  gallery: Array,
  video: Array,
  obj: Array,
  categories: Array,
  subcategories: Array,
  categoriesRelation: Array,
  brand: String,
  currency: String,
  trending: { type: Boolean, default: false },
  new: { type: Boolean, default: false },
  bestSelling: { type: Boolean, default: false },
  quantity: Number,
  sku: String,
  colors: Array,
  attributes: Array,
  tags: Array,
  comboProducts: Array,
  variants: Array,
  attributeIndex: String,
  featured: { type: Boolean, default: false },
  clearence: { type: Boolean, default: false },
  shipping: {
    weight: Number,
    length: Number,
    width: Number,
    height: Number,
  },
  seo: {
    title: String,
    description: String,
    image: Array,
  },
  customfield: Array,
  productTax: {
    hsn: Number,
    CGSTIN: Number,
    SGSTIN: Number,
    IGSTIN: Number,
    UTGSTIN: Number,
    CGSTOUT: Number,
    SGSTOUT: Number,
    IGSTOUT: Number,
    UTGSTOUT: Number,
  },
  review: [
    {
      date: { type: Date, default: Date.now },
      userName: String,
      email: String,
      rating: Number,
      comment: String,
    },
  ],
  question: [
    {
      date: { type: Date, default: Date.now },
      userName: String,
      email: String,
      question: String,
      answer: String,
    },
  ],
};

export const shippingCharge = {
  area: [
    {
      name: String,
      price: Number,
    },
  ],
  internationalCost: Number,
};

export const user = {
  name: String,
  email: { type: String, unique: true },
  phone: String,
  house: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  image: String,
  hash: String,
  salt: String,
  addressCheck: { type: Boolean, default: false },
  billingAddress: {
    fullName: String,
    billingEmail: String,
    phone: String,
    house: String,
    city: String,
    state: String,
    zipCode: Number,
    country: String,
  },
  shippingAddress: {
    fullName: String,
    shippingEmail: String,
    phone: String,
    house: String,
    city: String,
    state: String,
    zipCode: Number,
    country: String,
  },
  isAdmin: { type: Boolean, default: false },
  isStaff: {
    status: { type: Boolean, default: false },
    surname: String,
    permissions: Array,
  },
  emailVerified: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "order" }],
  favorite: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
};

export const customType = {
  name: String,
  Id: Number,
};

export const webpage = {
  homePage: {
    carousel: {
      background: Array,
      carouselData: Array,
    },
    banners: {
      banner1: {
        title: String,
        subTitle: String,
        description: String,
        url: String,
        image: Array,
        hide: { type: Boolean, default: false },
      },
      banner2: {
        title: String,
        subTitle: String,
        description: String,
        url: String,
        image: Array,
        hide: { type: Boolean, default: false },
      },
      banner3: {
        title: String,
        subTitle: String,
        description: String,
        url: String,
        image: Array,
        hide: { type: Boolean, default: false },
      },
    },

    collection1: {
      scopeA: {
        title: String,
        url: String,
        image: Array,
      },
      scopeB: {
        title: String,
        url: String,
        image: Array,
      },
      scopeC: {
        title: String,
        url: String,
        image: Array,
      },
      scopeD: {
        title: String,
        url: String,
        image: Array,
      },
      hide: { type: Boolean, default: false },
    },
    collection2: {
      scopeA: {
        title: String,
        url: String,
        image: Array,
      },
      scopeB: {
        title: String,
        url: String,
        image: Array,
      },

      scopeC: {
        title: String,
        url: String,
        image: Array,
      },
      scopeD: {
        title: String,
        url: String,
        image: Array,
      },
      hide: { type: Boolean, default: false },
    },
  },
  aboutPage: {
    content: String,
  },
  privacyPage: {
    content: String,
  },
  termsPage: {
    content: String,
  },
  returnPolicyPage: {
    content: String,
  },
  faqPage: {
    content: String,
  },
};

export const notification = {
  message: String,
  createdAt: { type: Date, expires: 604800, default: Date.now },
};

export default settings;