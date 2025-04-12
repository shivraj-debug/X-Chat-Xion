export const plans = [
  {
    _id: 1,
    name: "Starter Pack",
    icon: "/Xion_logo.jpg",
    price: 0.01,
    credits:"25",
    inclusions: [
      {
        label: "25 AI Points",
        isIncluded: true,
      },
      {
        label: "1 Point = 0.00040 XION",
        isIncluded: true,
      },
      {
        label: "Great for trying out X-Chat",
        isIncluded: true,
      },
    ],
  },
  {
    _id: 2,
    name: "Advanced Pack",
    icon: "/Xion_logo.jpg",
    price: 0.02,
    credits: "60",
    inclusions: [
      {
        label: "60 AI Points",
        isIncluded: true,
      },
      {
        label: "1 Point = 0.00033 XION",
        isIncluded: true,
      },
      {
        label: "Save ~17% compared to Starter",
        isIncluded: true,
      },
    ],
  },
  {
    _id: 3,
    name: "Elite Pack",
    icon: "/Xion_logo.jpg",
    price: 0.05,
    credits:"200",
    inclusions: [
      {
        label: "200 AI Points",
        isIncluded: true,
      },
      {
        label: "1 Point = 0.00025 XION",
        isIncluded: true,
      },
      {
        label: "Best value for frequent users",
        isIncluded: true,
      },
    ],
  },
];
