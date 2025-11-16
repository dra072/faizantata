// API Configuration
const API_BASE_URL = "https://gocab-khaki.vercel.app";
// const API_BASE_URL = "http://localhost:3000";

// Company Data
const companyData = {
  name: "Go Cab",
  tagline: "Your Journey, Our Passion",
  subtitle: "Reliable Rides, Everywhere You Go",
  description:
    "Premium cab services across Jharkhand with professional drivers and comfortable vehicles",
  domain: "gocab.co",
  copyright: "cabwala.in",
  phone: "+919102749920",
  email: "contact@gocab.co",
  address: "Jharkhand, India",
};

// Static data as fallback
const staticData = {
  categories: [
    {
      _id: "cat1",
      name: "Intracity",
      description: "Local city rides and daily commute",
      slug: "intracity",
      status: "active",
      icon: "fas fa-city",
      gradient: "from-blue-500 to-blue-700",
      color: "blue",
    },
    {
      _id: "cat2",
      name: "Airport Transfer",
      description: "Reliable airport pickup and drop-off",
      slug: "airport_transfer",
      status: "active",
      icon: "fas fa-plane",
      gradient: "from-green-500 to-green-700",
      color: "green",
    },
    {
      _id: "cat3",
      name: "Outstation",
      description: "Comfortable intercity travel",
      slug: "outstation",
      status: "active",
      icon: "fas fa-route",
      gradient: "from-purple-500 to-purple-700",
      color: "purple",
    },
    {
      _id: "cat4",
      name: "Hourly Rental",
      description: "Flexible hourly cab booking",
      slug: "hourly_rental",
      status: "active",
      icon: "fas fa-clock",
      gradient: "from-orange-500 to-orange-700",
      color: "orange",
    },
  ],
  services: {
    intracity: [
      {
        _id: "svc1",
        name: "City Ride Economy",
        description:
          "Affordable rides within city limits with professional drivers",
        price: 150,
        duration: "Base Fare",
        features: ["AC Vehicle", "Professional Driver", "GPS Tracking"],
        image: "/uploads/services/city-economy.jpg",
      },
      {
        _id: "svc2",
        name: "City Ride Premium",
        description: "Comfortable premium vehicles for city travel",
        price: 250,
        duration: "Base Fare",
        features: [
          "Luxury Vehicle",
          "Experienced Driver",
          "Complimentary Water",
        ],
        image: "/uploads/services/city-premium.jpg",
      },
    ],
    airport_transfer: [
      {
        _id: "svc3",
        name: "Airport Pickup Standard",
        description: "Reliable airport transfers with flight tracking",
        price: 400,
        duration: "One Way",
        features: ["Flight Tracking", "Meet & Greet", "AC Vehicle"],
        image: "/uploads/services/airport-standard.jpg",
      },
      {
        _id: "svc4",
        name: "Airport VIP Transfer",
        description: "Premium airport service with luxury vehicles",
        price: 800,
        duration: "One Way",
        features: ["Luxury Car", "Priority Service", "Lounge Access"],
        image: "/uploads/services/airport-vip.jpg",
      },
    ],
    outstation: [
      {
        _id: "svc5",
        name: "Outstation Economy",
        description: "Budget-friendly intercity travel",
        price: 12,
        duration: "Per KM",
        features: ["Fuel Included", "Driver Allowance", "Toll Charges Extra"],
        image: "/uploads/services/outstation-economy.jpg",
      },
      {
        _id: "svc6",
        name: "Outstation Premium",
        description: "Comfortable long-distance travel",
        price: 18,
        duration: "Per KM",
        features: ["Premium Vehicle", "All Inclusive", "24/7 Support"],
        image: "/uploads/services/outstation-premium.jpg",
      },
    ],
    hourly_rental: [
      {
        _id: "svc7",
        name: "4 Hour Package",
        description: "Flexible 4-hour rental with 40km included",
        price: 800,
        duration: "4 Hours",
        features: ["4 Hours", "40 KM Included", "Extra KM Chargeable"],
        image: "/uploads/services/hourly-4h.jpg",
      },
      {
        _id: "svc8",
        name: "8 Hour Package",
        description: "Full day rental with 80km included",
        price: 1400,
        duration: "8 Hours",
        features: ["8 Hours", "80 KM Included", "Driver Allowance"],
        image: "/uploads/services/hourly-8h.jpg",
      },
    ],
  },
};

// ULTIMATE Feature parsing function - handles ALL possible formats
const parseServiceFeatures = (features) => {
  // console.log("🔧 parseServiceFeatures input:", features, typeof features);

  // Return empty array if no features
  if (!features) {
    // console.log("❌ No features provided");
    return [];
  }

  // If already an array, process each element
  if (Array.isArray(features)) {
    // console.log("✅ Features is array, processing elements...");

    const processedFeatures = features
      .map((feature, index) => {
        // console.log(`🔧 Processing feature ${index}:`, feature, typeof feature);

        // If feature is already a string, return it
        if (typeof feature === "string") {
          return feature.trim();
        }

        // If feature is an object, try to extract string value
        if (typeof feature === "object" && feature !== null) {
          // Check common object patterns
          if (feature.name) return feature.name.toString().trim();
          if (feature.value) return feature.value.toString().trim();
          if (feature.text) return feature.text.toString().trim();
          if (feature.label) return feature.label.toString().trim();

          // Convert object to string if it has meaningful content
          const stringified = JSON.stringify(feature);
          if (stringified !== "{}" && stringified !== "null") {
            return stringified.replace(/[{}"]/g, "").trim();
          }
        }

        // Fallback: convert to string
        return feature.toString().trim();
      })
      .filter((f) => f && f.length > 0); // Remove empty strings

    // console.log("✅ Processed array features:", processedFeatures);
    return processedFeatures;
  }

  // If it's a string, parse it
  if (typeof features === "string") {
    try {
      // Remove any HTML entities
      let cleanFeatures = features
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim();

      // console.log("🧹 Cleaned features string:", cleanFeatures);

      // Check if it's a JSON array string
      if (cleanFeatures.startsWith("[") && cleanFeatures.endsWith("]")) {
        // console.log("📋 Parsing as JSON array");
        const parsed = JSON.parse(cleanFeatures);
        if (Array.isArray(parsed)) {
          // Recursively parse the array (in case it contains objects)
          return parseServiceFeatures(parsed);
        }
      }

      // Check if it's comma-separated
      if (cleanFeatures.includes(",")) {
        // console.log("📋 Parsing as comma-separated string");
        const parsed = cleanFeatures
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0);
        // console.log("✅ Successfully parsed comma-separated:", parsed);
        return parsed;
      }

      // Single feature
      // console.log("📋 Treating as single feature");
      return [cleanFeatures];
    } catch (error) {
      // console.error("❌ Error parsing features string:", error);
      return [];
    }
  }

  // If it's an object, try to convert
  if (typeof features === "object") {
    // console.log("📋 Converting object to array");
    const values = Object.values(features).filter((f) => f);
    return parseServiceFeatures(values); // Recursively parse
  }

  // console.log("❌ Unknown features type, returning empty array");
  return [];
};

// API Service Functions
const apiService = {
  getCategories: async () => {
    try {
      // console.log("Fetching categories from API...");
      const response = await fetch(
        `${API_BASE_URL}/api/categories?status=active`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("Categories loaded from API:", data);
      if (data.success && data.data) {
        return { success: true, data: data.data };
      }
      return data;
    } catch (error) {
      return { success: true, data: staticData.categories };
    }
  },

  getServicesByCategory: async (categorySlug) => {
    try {
      // console.log(`Fetching services for category: ${categorySlug}`);
      const response = await fetch(
        `${API_BASE_URL}/api/services/category/${categorySlug}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log(`Services API response for ${categorySlug}:`, data);

      // CRITICAL: Process the data to ensure features are properly parsed
      if (data.success && data.data) {
        // console.log("Processing services data to fix features...");

        const processedServices = data.data.map((service, index) => {
          // console.log(`Processing service ${index + 1}:`, service.name);
          // console.log(
          //   `Raw features:`,
          //   service.features,
          //   typeof service.features
          // );

          const processed = { ...service };

          // Parse features using our ULTIMATE function
          processed.features = parseServiceFeatures(service.features);

          // console.log(
          //   `✅ Final processed features for ${service.name}:`,
          //   processed.features
          // );
          return processed;
        });

        // console.log("✅ All services processed successfully");

        return {
          success: true,
          data: processedServices,
          category: data.category,
        };
      }

      return data;
    } catch (error) {
      // console.error(`API Error - Services for ${categorySlug}:`, error);
      // console.log("Using static services as fallback");
      return {
        success: true,
        data: staticData.services[categorySlug] || [],
        category: {
          name: categorySlug
            .replace("_", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          slug: categorySlug,
        },
      };
    }
  },

  submitContact: async (contactData) => {
    try {
      // console.log("🔄 Submitting contact form...");
      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("✅ Contact form submitted successfully:", data);
      return data;
    } catch (error) {
      // console.error("❌ Contact form submission failed:", error);
      return {
        success: false,
        message:
          "Failed to submit contact form. Please try again or call us directly.",
        error: error.message,
      };
    }
  },
};

// Utility function to scroll to section
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

// Header Component
const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const navbar = document.getElementById("navbar");
    const contactSection = document.getElementById("contact");

    const updateNavbarColor = () => {
      const scrollY = window.scrollY;
      const contactTop = contactSection ? contactSection.offsetTop : Infinity;

      if (scrollY >= contactTop - 100) {
        navbar.classList.remove("navbar-light");
        navbar.classList.add("navbar-dark");
      } else {
        navbar.classList.remove("navbar-dark");
        navbar.classList.add("navbar-light");
      }
    };

    window.addEventListener("scroll", updateNavbarColor);
    updateNavbarColor();

    return () => window.removeEventListener("scroll", updateNavbarColor);
  }, []);

  return React.createElement(
    "nav",
    {
      id: "navbar",
      className:
        "fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 navbar-light transition-all duration-300 shadow-lg",
    },
    React.createElement(
      "div",
      { className: "container mx-auto px-6 py-4" },
      React.createElement(
        "div",
        { className: "flex items-center justify-between" },
        React.createElement(
          "div",
          { className: "flex items-center space-x-3 navbar-logo-container" },
          React.createElement("i", {
            className: "fas fa-taxi text-2xl navbar-logo transition-colors",
          }),
          React.createElement(
            "span",
            { className: "text-xl font-bold navbar-logo transition-colors" },
            companyData.name
          )
        ),

        // Desktop Menu
        React.createElement(
          "div",
          { className: "hidden md:flex items-center space-x-8" },
          React.createElement(
            "button",
            {
              onClick: () => scrollToSection("home"),
              className:
                "hover:text-blue-400 transition-colors duration-200 font-medium",
            },
            "Home"
          ),
          React.createElement(
            "button",
            {
              onClick: () => scrollToSection("services"),
              className:
                "hover:text-blue-400 transition-colors duration-200 font-medium",
            },
            "Services"
          ),
          React.createElement(
            "button",
            {
              onClick: () => scrollToSection("contact"),
              className:
                "hover:text-blue-400 transition-colors duration-200 font-medium",
            },
            "Contact"
          )
        ),

        // Mobile Menu Button
        React.createElement(
          "button",
          {
            onClick: () => setIsOpen(!isOpen),
            className: "md:hidden text-gray-800 focus:outline-none",
          },
          React.createElement("i", {
            className: isOpen ? "fas fa-times" : "fas fa-bars",
          })
        )
      ),

      // Mobile Menu
      isOpen &&
        React.createElement(
          "div",
          { className: "md:hidden mt-4 space-y-2 pb-4" },
          React.createElement(
            "button",
            {
              onClick: () => {
                scrollToSection("home");
                setIsOpen(false);
              },
              className:
                "block w-full text-left text-gray-800 hover:text-blue-400 transition-colors duration-200 py-2 px-4 rounded hover:bg-white/20",
            },
            "Home"
          ),
          React.createElement(
            "button",
            {
              onClick: () => {
                scrollToSection("services");
                setIsOpen(false);
              },
              className:
                "block w-full text-left text-gray-800 hover:text-blue-400 transition-colors duration-200 py-2 px-4 rounded hover:bg-white/20",
            },
            "Services"
          ),
          React.createElement(
            "button",
            {
              onClick: () => {
                scrollToSection("contact");
                setIsOpen(false);
              },
              className:
                "block w-full text-left text-gray-800 hover:text-blue-400 transition-colors duration-200 py-2 px-4 rounded hover:bg-white/20",
            },
            "Contact"
          )
        )
    )
  );
};

// Hero Section Component
const HeroSection = () => {
  return React.createElement(
    "section",
    {
      id: "home",
      className:
        "min-h-screen flex items-center justify-center relative pt-24 sm:pt-32 overflow-hidden bg-white",
    },
    // Moving Background (road effect)
    React.createElement("div", {
      className: "absolute inset-0 moving-road-bg",
    }),

    // Animated Background Orbs
    React.createElement(
      "div",
      { className: "absolute inset-0" },
      React.createElement("div", {
        className:
          "absolute w-96 h-96 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full blur-2xl animate-float-slow",
        style: { top: "10%", left: "10%" },
      }),
      React.createElement("div", {
        className:
          "absolute w-64 h-64 bg-gradient-to-r from-orange-400/40 to-pink-400/40 rounded-full blur-2xl animate-float-reverse",
        style: { top: "60%", right: "15%" },
      }),
      React.createElement("div", {
        className:
          "absolute w-80 h-80 bg-gradient-to-r from-green-400/40 to-blue-400/40 rounded-full blur-2xl animate-float-diagonal",
        style: { bottom: "20%", left: "20%" },
      })
    ),

    // Content - Text Only
    React.createElement(
      "div",
      { className: "container mx-auto px-6 relative z-10" },
      React.createElement(
        "div",
        { className: "text-center" },
        // "Your Journey," - No Car
        React.createElement(
          "div",
          { className: "car-journey-container mb-4" },
          React.createElement(
            "h1",
            {
              className:
                "car-text-1 text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 leading-tight",
            },
            React.createElement(
              "span",
              {
                className:
                  "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent",
              },
              "Your Journey,"
            )
          )
        ),

        // "Our Passion" - No Car
        React.createElement(
          "div",
          { className: "car-passion-container mb-8" },
          React.createElement(
            "h1",
            {
              className:
                "car-text-2 text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 leading-tight",
            },
            React.createElement(
              "span",
              {
                className:
                  "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent",
              },
              "Our Passion"
            )
          )
        ),

        // Subtitle and Description (normal size)
        React.createElement(
          "p",
          {
            className:
              "text-xl md:text-2xl text-blue-700 mb-4 font-medium animate-fade-in-up delay-1000",
          },
          companyData.subtitle
        ),
        React.createElement(
          "p",
          {
            className:
              "text-lg text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-1200 leading-relaxed",
          },
          companyData.description
        ),

        // Buttons (normal size)
        React.createElement(
          "div",
          {
            className:
              "flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-1400",
          },
          React.createElement(
            "button",
            {
              onClick: () =>
                document
                  .getElementById("services")
                  .scrollIntoView({ behavior: "smooth" }),
              className:
                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl",
            },
            React.createElement("i", { className: "fas fa-taxi mr-2" }),
            "Explore Services"
          ),
          React.createElement(
            "a",
            {
              href: `tel:${companyData.phone}`,
              className:
                "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105",
            },
            React.createElement("i", { className: "fas fa-phone mr-2" }),
            "Call Now"
          )
        )
      )
    ),

    // Scroll Indicator
    React.createElement(
      "div",
      {
        className:
          "absolute bottom-8 left-1/2 transform -translate-x-1/2 text-blue-600 animate-bounce",
      },
      React.createElement("i", { className: "fas fa-chevron-down text-2xl" })
    )
  );
};

// Service Modal Component - COMPLETELY FIXED - NO DEBUG TEXT
const ServiceModal = ({ category, services, isOpen, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // console.log("🔍 ServiceModal - Services data:", services);

  return React.createElement(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      onClick: onClose,
    },
    // Backdrop with blur
    React.createElement("div", {
      className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
    }),

    // Modal Content
    React.createElement(
      "div",
      {
        className:
          "relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto",
        onClick: (e) => e.stopPropagation(),
      },
      React.createElement(
        "div",
        {
          className:
            "bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8",
        },
        // Header
        React.createElement(
          "div",
          { className: "flex items-center justify-between mb-8" },
          React.createElement(
            "div",
            { className: "flex items-center space-x-4" },
            React.createElement("i", {
              className: `${category.icon} text-4xl text-white`,
            }),
            React.createElement(
              "div",
              null,
              React.createElement(
                "h2",
                { className: "text-3xl font-bold text-white" },
                category.name
              ),
              React.createElement(
                "p",
                { className: "text-white/80 text-lg" },
                category.description
              )
            )
          ),
          React.createElement(
            "button",
            {
              onClick: onClose,
              className:
                "text-white/80 hover:text-white text-2xl p-2 hover:bg-white/10 rounded-full transition-all",
            },
            React.createElement("i", { className: "fas fa-times" })
          )
        ),

        // Services Grid
        React.createElement(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
          services.map((service, index) => {
            // console.log(`🔧 ServiceModal - Processing ${service.name}`);
            // console.log(
            //   `📋 Service features:`,
            //   service.features,
            //   typeof service.features
            // );

            // FINAL ROBUST PARSING - This should handle everything including objects
            let serviceFeatures = [];

            if (service.features) {
              serviceFeatures = parseServiceFeatures(service.features);
              // console.log(`✅ Final features for modal:`, serviceFeatures);
            }

            return React.createElement(
              "div",
              {
                key: service._id,
                className:
                  "bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105",
              },
              // Service Image
              service.image &&
                React.createElement("img", {
                  src: service.image.startsWith("http")
                    ? service.image
                    : `${API_BASE_URL}${service.image}`,
                  alt: service.name,
                  className: "w-full h-40 object-cover rounded-xl mb-4",
                  onError: (e) => {
                    e.target.style.display = "none";
                  },
                }),

              // Service Header
              React.createElement(
                "div",
                { className: "flex justify-between items-start mb-3" },
                React.createElement(
                  "h3",
                  { className: "text-xl font-bold text-white" },
                  service.name
                ),
                React.createElement(
                  "div",
                  { className: "text-right" },
                  React.createElement(
                    "div",
                    { className: "text-2xl font-bold text-yellow-400" },
                    `₹${service.price}`
                  ),
                  service.duration &&
                    React.createElement(
                      "div",
                      { className: "text-sm text-white/70" },
                      service.duration
                    )
                )
              ),

              // Service Description
              React.createElement(
                "p",
                { className: "text-white/80 text-sm mb-4 leading-relaxed" },
                service.description
              ),

              // Service Features
              serviceFeatures.length > 0 &&
                React.createElement(
                  "div",
                  { className: "space-y-2" },
                  React.createElement(
                    "h4",
                    { className: "text-sm font-semibold text-white mb-2" },
                    "Features:"
                  ),
                  React.createElement(
                    "div",
                    { className: "flex flex-wrap gap-2" },
                    serviceFeatures.map((feature, idx) => {
                      // console.log(`🏷️ Rendering feature badge:`, feature);
                      return React.createElement(
                        "span",
                        {
                          key: `${service._id}-feature-${idx}`,
                          className:
                            "px-3 py-1 bg-white/20 text-white text-xs rounded-full border border-white/30",
                        },
                        feature
                      );
                    })
                  )
                ),

              // Book Now Button
              React.createElement(
                "button",
                {
                  className:
                    "w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg",
                  onClick: () => {
                    onClose();
                    scrollToSection("contact");
                  },
                },
                React.createElement("i", { className: "fas fa-car mr-2" }),
                "Book Now"
              )
            );
          })
        ),

        services.length === 0 &&
          React.createElement(
            "div",
            { className: "text-center py-12" },
            React.createElement("i", {
              className: "fas fa-info-circle text-4xl text-white/50 mb-4",
            }),
            React.createElement(
              "p",
              { className: "text-white/70 text-lg" },
              "No services available for this category at the moment."
            )
          )
      )
    )
  );
};

// Services Section Component with BEAUTIFUL Modern Cards
const ServicesSection = () => {
  const [categories, setCategories] = React.useState([]);
  const [services, setServices] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const result = await apiService.getCategories();
        if (result.success && result.data) {
          const enrichedCategories = result.data.map((cat) => ({
            ...cat,
            icon:
              cat.slug === "airport"
                ? "fas fa-plane"
                : staticData.categories.find((sc) => sc.slug === cat.slug)
                    ?.icon || "fas fa-car",
            gradient:
              staticData.categories.find((sc) => sc.slug === cat.slug)
                ?.gradient || "from-blue-500 to-blue-700",
            color:
              staticData.categories.find((sc) => sc.slug === cat.slug)?.color ||
              "blue",
          }));
          setCategories(enrichedCategories);

          // Load services for each category
          const servicesPromises = enrichedCategories.map(async (category) => {
            // console.log(`Loading services for category: ${category.slug}`);
            const servicesResult = await apiService.getServicesByCategory(
              category.slug
            );
            // console.log(
            //   `📋 Services result for ${category.slug}:`,
            //   servicesResult
            // );

            return {
              categorySlug: category.slug,
              services: servicesResult.success ? servicesResult.data : [],
            };
          });

          const servicesResults = await Promise.all(servicesPromises);
          const servicesMap = {};
          servicesResults.forEach(({ categorySlug, services }) => {
            // console.log(`📦 Storing services for ${categorySlug}:`, services);
            servicesMap[categorySlug] = services;
          });

          // console.log("🗂️ Final services map:", servicesMap);
          setServices(servicesMap);
        } else {
          setCategories(staticData.categories);
          setServices(staticData.services);
        }
      } catch (error) {
        // console.error("Error loading categories:", error);
        setCategories(staticData.categories);
        setServices(staticData.services);
      }
      setLoading(false);
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (category) => {
    // console.log("🖱️ Category clicked:", category.name);
    // console.log("📋 Services for category:", services[category.slug]);
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
  };

  return React.createElement(
    "section",
    {
      id: "services",
      className:
        "py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden",
    },
    React.createElement(
      "div",
      { className: "container mx-auto px-4 relative z-10" },
      React.createElement(
        "div",
        { className: "text-center mb-16" },
        React.createElement(
          "h2",
          {
            className:
              "text-4xl md:text-5xl font-bold text-gray-800 mb-6 animate-fade-in-up",
          },
          "Our ",
          React.createElement(
            "span",
            { className: "text-blue-600" },
            "Services"
          )
        ),
        React.createElement(
          "p",
          {
            className:
              "text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-200",
          },
          "Choose from our wide range of transportation services designed to meet all your travel needs"
        )
      ),

      loading
        ? React.createElement(
            "div",
            { className: "text-center" },
            React.createElement("i", {
              className: "fas fa-spinner fa-spin text-4xl text-blue-600 mb-4",
            }),
            React.createElement(
              "p",
              { className: "text-lg text-gray-600" },
              "Loading our services..."
            )
          )
        : React.createElement(
            "div",
            {
              className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8",
            },
            categories.map((category, index) =>
              React.createElement(
                "div",
                {
                  key: category._id,
                  className: "group relative",
                  style: { animationDelay: `${index * 150}ms` },
                },
                React.createElement(
                  "div",
                  {
                    className: `relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl`,
                    onClick: () => handleCategoryClick(category),
                  },
                  // Background Gradient
                  React.createElement("div", {
                    className: `absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90`,
                  }),

                  // Decorative Pattern
                  React.createElement("div", {
                    className: "absolute inset-0 opacity-10",
                    style: {
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    },
                  }),

                  // Content
                  React.createElement(
                    "div",
                    {
                      className:
                        "relative p-8 text-white h-64 flex flex-col justify-between",
                    },

                    // Top Section
                    React.createElement(
                      "div",
                      { className: "text-center" },
                      React.createElement("i", {
                        className: `${category.icon} text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300`,
                      }),
                      React.createElement(
                        "h3",
                        { className: "text-2xl font-bold mb-2" },
                        category.name
                      ),
                      React.createElement(
                        "p",
                        { className: "text-white/90 text-sm leading-relaxed" },
                        category.description
                      )
                    ),

                    // Bottom Section
                    React.createElement(
                      "div",
                      { className: "text-center" },
                      React.createElement(
                        "div",
                        {
                          className:
                            "inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold",
                        },
                        React.createElement(
                          "span",
                          null,
                          `${
                            services[category.slug]?.length || 0
                          } Services Available`
                        ),
                        React.createElement("i", {
                          className:
                            "fas fa-arrow-right transform group-hover:translate-x-1 transition-transform",
                        })
                      )
                    )
                  ),

                  // Hover Overlay
                  React.createElement("div", {
                    className:
                      "absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  })
                )
              )
            )
          ),

      // Features Section
      React.createElement(
        "div",
        { className: "mt-20" },
        React.createElement(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-3 gap-8" },
          [
            {
              icon: "fas fa-shield-alt",
              title: "Safe & Secure",
              desc: "Professional drivers and GPS tracking",
              color: "blue",
            },
            {
              icon: "fas fa-clock",
              title: "24/7 Available",
              desc: "Round the clock service across Jharkhand",
              color: "orange",
            },
            {
              icon: "fas fa-indian-rupee",
              title: "Fair Pricing",
              desc: "Transparent pricing with no hidden charges",
              color: "green",
            },
          ].map((feature, index) =>
            React.createElement(
              "div",
              {
                key: index,
                className: `text-center animate-fade-in-up hover:transform hover:scale-105 transition-all duration-300`,
                style: { animationDelay: `${800 + index * 200}ms` },
              },
              React.createElement(
                "div",
                {
                  className: `bg-${feature.color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-${feature.color}-200 transition-colors duration-300`,
                },
                React.createElement("i", {
                  className: `${feature.icon} text-2xl text-${feature.color}-600`,
                })
              ),
              React.createElement(
                "h3",
                { className: "text-xl font-bold text-gray-800 mb-2" },
                feature.title
              ),
              React.createElement(
                "p",
                { className: "text-gray-600" },
                feature.desc
              )
            )
          )
        )
      )
    ),

    // Service Modal
    selectedCategory &&
      React.createElement(ServiceModal, {
        category: selectedCategory,
        services: services[selectedCategory.slug] || [],
        isOpen: modalOpen,
        onClose: closeModal,
      })
  );
};

// Contact Section Component with blue background and glassy form
const ContactSection = () => {
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "",
    pickupLocation: "",
    dropLocation: "",
    travelDate: "",
    travelTime: "",
    passengers: "",
    message: "",
  });

  const [categories, setCategories] = React.useState([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState("");
  const [submitStatus, setSubmitStatus] = React.useState("");

  React.useEffect(() => {
    const loadCategories = async () => {
      const result = await apiService.getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setCategories(staticData.categories);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitStatus("");

    try {
      if (!formData.name || !formData.phone || !formData.serviceType) {
        throw new Error("Please fill in all required fields");
      }

      const result = await apiService.submitContact(formData);

      if (result.success) {
        setSubmitStatus("success");
        setSubmitMessage(
          "Thank you! Your inquiry has been submitted successfully. We will contact you soon."
        );
        setFormData({
          name: "",
          phone: "",
          email: "",
          serviceType: "",
          pickupLocation: "",
          dropLocation: "",
          travelDate: "",
          travelTime: "",
          passengers: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
        setSubmitMessage(
          result.message || "Failed to submit your inquiry. Please try again."
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitMessage("");
        setSubmitStatus("");
      }, 5000);
    }
  };

  return React.createElement(
    "section",
    {
      id: "contact",
      className:
        "py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 relative overflow-hidden",
    },
    // Background Elements
    React.createElement(
      "div",
      { className: "absolute inset-0" },
      React.createElement("div", {
        className:
          "absolute w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse",
        style: { top: "10%", left: "-10%" },
      }),
      React.createElement("div", {
        className:
          "absolute w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000",
        style: { bottom: "20%", right: "-5%" },
      })
    ),

    React.createElement(
      "div",
      { className: "container mx-auto px-4 relative z-10" },
      React.createElement(
        "div",
        { className: "text-center mb-16" },
        React.createElement(
          "h2",
          {
            className:
              "text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up",
          },
          "Book Your ",
          React.createElement("span", { className: "text-orange-400" }, "Ride")
        ),
        React.createElement(
          "p",
          {
            className:
              "text-xl text-blue-100 max-w-3xl mx-auto animate-fade-in-up delay-200",
          },
          "Ready to travel? Fill out the form below and we'll get back to you with the best options"
        )
      ),

      React.createElement(
        "div",
        { className: "max-w-4xl mx-auto" },
        // Glassy Form Container
        React.createElement(
          "div",
          {
            className:
              "backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl p-8 md:p-12 border border-white/20 animate-fade-in-up delay-300",
          },
          React.createElement(
            "form",
            {
              onSubmit: handleSubmit,
              className: "grid grid-cols-1 md:grid-cols-2 gap-6",
            },
            // Name Field
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement("input", {
                type: "text",
                name: "name",
                value: formData.name,
                onChange: handleInputChange,
                className:
                  "peer w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-orange-400 focus:bg-white/30 placeholder-transparent transition-all duration-200 text-white will-change-transform",
                placeholder: " ",
                required: true,
              }),
              React.createElement(
                "label",
                {
                  className:
                    "absolute left-4 -top-2.5 bg-white/20 px-2 text-sm text-white transition-all duration-200 ease-in-out will-change-transform peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-200 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-orange-400 peer-focus:text-sm",
                },
                "Name *"
              )
            ),

            // Phone Field
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement("input", {
                type: "tel",
                name: "phone",
                value: formData.phone,
                onChange: handleInputChange,
                className:
                  "peer w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-orange-400 focus:bg-white/30 placeholder-transparent transition-all duration-200 text-white will-change-transform",
                placeholder: " ",
                required: true,
              }),
              React.createElement(
                "label",
                {
                  className:
                    "absolute left-4 -top-2.5 bg-white/20 px-2 text-sm text-white transition-all duration-200 ease-in-out will-change-transform peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-200 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-orange-400 peer-focus:text-sm",
                },
                "Phone *"
              )
            ),

            // Email Field
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement("input", {
                type: "email",
                name: "email",
                value: formData.email,
                onChange: handleInputChange,
                className:
                  "peer w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-orange-400 focus:bg-white/30 placeholder-transparent transition-all duration-200 text-white will-change-transform",
                placeholder: " ",
              }),
              React.createElement(
                "label",
                {
                  className:
                    "absolute left-4 -top-2.5 bg-white/20 px-2 text-sm text-white transition-all duration-200 ease-in-out will-change-transform peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-200 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-orange-400 peer-focus:text-sm",
                },
                "Email"
              )
            ),

            // Service Type Dropdown
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement(
                "select",
                {
                  name: "serviceType",
                  value: formData.serviceType,
                  onChange: handleInputChange,
                  className:
                    "peer w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-orange-400 focus:bg-white/30 transition-all duration-200 text-white will-change-transform",
                  required: true,
                },
                React.createElement(
                  "option",
                  { value: "", className: "bg-gray-800 text-white" },
                  "Select Service Type *"
                ),
                categories.map((category) =>
                  React.createElement(
                    "option",
                    {
                      key: category._id,
                      value: category.slug,
                      className: "bg-gray-800 text-white",
                    },
                    category.name
                  )
                )
              )
            ),

            // Additional fields with same styling...
            // Pickup Location
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement("input", {
                type: "text",
                name: "pickupLocation",
                value: formData.pickupLocation,
                onChange: handleInputChange,
                className:
                  "peer w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-orange-400 focus:bg-white/30 placeholder-transparent transition-all duration-200 text-white will-change-transform",
                placeholder: " ",
              }),
              React.createElement(
                "label",
                {
                  className:
                    "absolute left-4 -top-2.5 bg-white/20 px-2 text-sm text-white transition-all duration-200 ease-in-out will-change-transform peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-200 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-orange-400 peer-focus:text-sm",
                },
                "Pickup Location"
              )
            ),

            // Drop Location
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement("input", {
                type: "text",
                name: "dropLocation",
                value: formData.dropLocation,
                onChange: handleInputChange,
                className:
                  "peer w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-orange-400 focus:bg-white/30 placeholder-transparent transition-all duration-200 text-white will-change-transform",
                placeholder: " ",
              }),
              React.createElement(
                "label",
                {
                  className:
                    "absolute left-4 -top-2.5 bg-white/20 px-2 text-sm text-white transition-all duration-200 ease-in-out will-change-transform peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-200 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-orange-400 peer-focus:text-sm",
                },
                "Drop Location"
              )
            ),

            // Travel Date
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement("input", {
                type: "date",
                name: "travelDate",
                value: formData.travelDate,
                onChange: handleInputChange,
                placeholder: " ",
                className:
                  "peer w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-orange-400 focus:bg-white/30 placeholder-transparent transition-all duration-200 text-white will-change-transform",
              }),
              React.createElement(
                "label",
                {
                  className:
                    "absolute left-4 top-3 px-2 text-sm text-white transition-all duration-200 ease-in-out will-change-transform peer-focus:-top-2.5 peer-focus:text-orange-400 peer-focus:text-sm peer-valid:-top-2.5 peer-valid:text-orange-400 peer-valid:text-sm",
                },
                "Travel Date"
              )
            ),

            // Travel Time
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement("input", {
                type: "time",
                name: "travelTime",
                value: formData.travelTime,
                onChange: handleInputChange,
                placeholder: " ",
                className:
                  "peer w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-orange-400 focus:bg-white/30 placeholder-transparent transition-all duration-200 text-white will-change-transform",
              }),
              React.createElement(
                "label",
                {
                  className:
                    "absolute left-4 top-3 px-2 text-sm text-white transition-all duration-200 ease-in-out will-change-transform peer-focus:-top-2.5 peer-focus:text-orange-400 peer-focus:text-sm peer-valid:-top-2.5 peer-valid:text-orange-400 peer-valid:text-sm",
                },
                "Travel Time"
              )
            ),

            // Number of Passengers
            React.createElement(
              "div",
              { className: "relative md:col-span-2" },
              React.createElement("input", {
                type: "number",
                name: "passengers",
                value: formData.passengers,
                onChange: handleInputChange,
                className:
                  "peer w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-orange-400 focus:bg-white/30 placeholder-transparent transition-all duration-200 text-white will-change-transform",
                placeholder: " ",
                min: "1",
                max: "8",
              }),
              React.createElement(
                "label",
                {
                  className:
                    "absolute left-4 -top-2.5 bg-white/20 px-2 text-sm text-white transition-all duration-200 ease-in-out will-change-transform peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-200 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-orange-400 peer-focus:text-sm",
                },
                "Number of Passengers"
              )
            ),

            // Message Field
            React.createElement(
              "div",
              { className: "relative md:col-span-2" },
              React.createElement("textarea", {
                name: "message",
                value: formData.message,
                onChange: handleInputChange,
                rows: "4",
                className:
                  "peer w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:border-orange-400 focus:bg-white/30 placeholder-transparent transition-all duration-200 text-white will-change-transform resize-none",
                placeholder: " ",
              }),
              React.createElement(
                "label",
                {
                  className:
                    "absolute left-4 -top-2.5 bg-white/20 px-2 text-sm text-white transition-all duration-200 ease-in-out will-change-transform peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-200 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-orange-400 peer-focus:text-sm",
                },
                "Additional Message"
              )
            ),

            // Submit Button
            React.createElement(
              "div",
              { className: "md:col-span-2" },
              React.createElement(
                "button",
                {
                  type: "submit",
                  disabled: isSubmitting,
                  className: `w-full py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-2xl"
                  } text-white shadow-xl`,
                },
                isSubmitting
                  ? [
                      React.createElement("i", {
                        key: "spinner",
                        className: "fas fa-spinner fa-spin mr-2",
                      }),
                      "Submitting...",
                    ]
                  : [
                      React.createElement("i", {
                        key: "plane",
                        className: "fas fa-paper-plane mr-2",
                      }),
                      "Book My Ride",
                    ]
              ),

              // Status Message
              submitMessage &&
                React.createElement(
                  "div",
                  {
                    className: `mt-4 p-4 rounded-lg backdrop-blur-sm ${
                      submitStatus === "success"
                        ? "bg-green-500/20 text-green-100 border border-green-400/30"
                        : "bg-red-500/20 text-red-100 border border-red-400/30"
                    }`,
                  },
                  React.createElement("i", {
                    className: `fas ${
                      submitStatus === "success"
                        ? "fa-check-circle"
                        : "fa-exclamation-triangle"
                    } mr-2`,
                  }),
                  submitMessage
                )
            )
          )
        )
      )
    )
  );
};

// Footer Component
const Footer = () => {
  return React.createElement(
    "footer",
    { className: "bg-gray-800 text-white py-12" },
    React.createElement(
      "div",
      { className: "container mx-auto px-4" },
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-3 gap-8" },
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { className: "flex items-center space-x-3 mb-4" },
            React.createElement("i", {
              className: "fas fa-taxi text-2xl text-accent-400",
            }),
            React.createElement(
              "span",
              { className: "text-xl font-bold" },
              companyData.name
            )
          ),
          React.createElement(
            "p",
            { className: "text-gray-400 mb-4" },
            companyData.description
          )
        ),

        React.createElement(
          "div",
          null,
          React.createElement(
            "h3",
            { className: "text-lg font-semibold mb-4" },
            "Quick Links"
          ),
          React.createElement(
            "ul",
            { className: "space-y-2" },
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                { href: "#home", className: "text-gray-400 hover:text-white" },
                "Home"
              )
            ),
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                {
                  href: "#services",
                  className: "text-gray-400 hover:text-white",
                },
                "Services"
              )
            ),
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                {
                  href: "#contact",
                  className: "text-gray-400 hover:text-white",
                },
                "Contact"
              )
            )
          )
        ),

        React.createElement(
          "div",
          null,
          React.createElement(
            "h3",
            { className: "text-lg font-semibold mb-4" },
            "Contact Info"
          ),
          React.createElement(
            "div",
            { className: "space-y-2 text-gray-400" },
            React.createElement(
              "p",
              null,
              React.createElement("i", { className: "fas fa-phone mr-2" }),
              companyData.phone
            ),
            React.createElement(
              "p",
              null,
              React.createElement("i", { className: "fas fa-envelope mr-2" }),
              companyData.email
            ),
            React.createElement(
              "p",
              null,
              React.createElement("i", {
                className: "fas fa-map-marker-alt mr-2",
              }),
              companyData.address
            )
          )
        )
      ),

      React.createElement(
        "div",
        { className: "border-t border-gray-700 mt-8 pt-8 text-center" },
        React.createElement(
          "p",
          { className: "text-gray-400" },
          "© 2025 ",
          companyData.copyright,
          ". All rights reserved."
        )
      )
    )
  );
};

// Floating Action Buttons
const FloatingButtons = () => {
  return React.createElement(
    React.Fragment,
    null,
    // Phone Button (Mobile Only)
    React.createElement(
      "div",
      { className: "fixed bottom-28 right-6 z-50 md:hidden" },
      React.createElement(
        "a",
        {
          href: `tel:${companyData.phone}`,
          className:
            "floating-phone-btn text-white p-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
          title: "Call Now",
        },
        React.createElement("i", { className: "fas fa-phone text-3xl" })
      )
    ),

    // WhatsApp Button
    React.createElement(
      "div",
      { className: "fixed bottom-6 right-6 z-50" },
      React.createElement(
        "a",
        {
          href: `https://wa.me/${companyData.phone.replace(
            "+",
            ""
          )}?text=Hi,%20I%20want%20to%20book%20a%20cab%20with%20Go%20Cab`,
          target: "_blank",
          rel: "noopener noreferrer",
          className:
            "bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce",
          title: "Chat on WhatsApp",
        },
        React.createElement("i", { className: "fab fa-whatsapp text-2xl" })
      )
    )
  );
};

// Main App Component
const App = () => {
  React.useEffect(() => {
    // console.log("🚀 Go Cab App Started");
    // console.log("📡 API Base URL:", API_BASE_URL);

    fetch(`${API_BASE_URL}/api/health`)
      .then((response) => response.json())
      .then((data) => console.log("Backend Health Check:", data))
      .catch((error) =>
        console.log("⚠️ Backend not reachable:", error.message)
      );
  }, []);

  return React.createElement(
    "div",
    { className: "font-inter" },
    React.createElement(Header),
    React.createElement(HeroSection),
    React.createElement(ServicesSection),
    React.createElement(ContactSection),
    React.createElement(Footer),
    React.createElement(FloatingButtons)
  );
};

// Render the App
ReactDOM.render(React.createElement(App), document.getElementById("root"));
