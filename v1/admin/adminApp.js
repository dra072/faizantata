// Admin API Configuration
const ADMIN_API_BASE_URL = "https://gocab-atsk.vercel.app/";

// Drag-and-drop image upload component
const DropzoneField = ({ onDrop, file }) => {
  const [isDragActive, setIsDragActive] = React.useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      onDrop(imageFile);
    } else {
      alert("Please upload an image file");
    }
  };

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB");
          return;
        }
        onDrop(file);
      }
    };
    input.click();
  };

  return React.createElement(
    "div",
    {
      className: `border-2 border-dashed p-6 text-center rounded-md cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-600 bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      onClick: handleClick,
    },
    file
      ? React.createElement(
          "div",
          { className: "space-y-2" },
          React.createElement("i", {
            className: "fas fa-image text-2xl text-green-600",
          }),
          React.createElement(
            "p",
            { className: "text-sm text-gray-800 font-medium" },
            file.name
          ),
          React.createElement(
            "p",
            { className: "text-xs text-gray-500" },
            `${(file.size / 1024 / 1024).toFixed(2)} MB`
          ),
          React.createElement(
            "p",
            { className: "text-xs text-blue-600" },
            "Click to change image"
          )
        )
      : React.createElement(
          "div",
          { className: "space-y-2" },
          React.createElement("i", {
            className: "fas fa-cloud-upload-alt text-3xl text-gray-400",
          }),
          React.createElement(
            "p",
            { className: "text-gray-600" },
            isDragActive
              ? "Drop the image here..."
              : "Drag & drop an image here, or click to select"
          ),
          React.createElement(
            "p",
            { className: "text-xs text-gray-500" },
            "Supports: JPG, PNG, GIF (Max 5MB)"
          )
        )
  );
};

// Admin API Service
const adminApiService = {
  // Authentication
  login: async (credentials) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("adminToken", data.token);
      }
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${ADMIN_API_BASE_URL}/api/admin/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      localStorage.removeItem("adminToken");
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Dashboard with FIXED API calls
  getDashboardStats: async () => {
    const token = localStorage.getItem("adminToken");
    try {
      // Get individual counts
      const [categoriesRes, servicesRes, contactsRes] = await Promise.all([
        fetch(`${ADMIN_API_BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${ADMIN_API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${ADMIN_API_BASE_URL}/api/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const categoriesData = await categoriesRes.json();
      const servicesData = await servicesRes.json();
      const contactsData = await contactsRes.json();

      // Calculate stats
      const stats = {
        categories: categoriesData.success
          ? categoriesData.data?.length || 0
          : 0,
        services: servicesData.success ? servicesData.data?.length || 0 : 0,
        contacts: contactsData.success ? contactsData.data?.length || 0 : 0,
        pendingContacts: contactsData.success
          ? contactsData.data?.filter((contact) => contact.status === "unread")
              ?.length || 0
          : 0,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return { success: false, message: error.message };
    }
  },

  // Categories
  getCategories: async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  createCategory: async (categoryData) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateCategory: async (id, categoryData) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(
        `${ADMIN_API_BASE_URL}/api/categories/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        }
      );
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteCategory: async (id) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(
        `${ADMIN_API_BASE_URL}/api/categories/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Services
  getServices: async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  createService: async (serviceData) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/services`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Create service with FormData (for image upload)
  createServiceWithImage: async (formData) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/services`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateService: async (id, serviceData) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/services/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update service with FormData (for image upload)
  updateServiceWithImage: async (id, formData) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/services/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteService: async (id) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get services by category
  getServicesByCategory: async (categoryId) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(
        `${ADMIN_API_BASE_URL}/api/services/by-category/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Contacts
  getContacts: async (filters = {}) => {
    const token = localStorage.getItem("adminToken");
    const queryParams = new URLSearchParams(filters).toString();
    try {
      const response = await fetch(
        `${ADMIN_API_BASE_URL}/api/contacts?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateContactStatus: async (id, status) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(
        `${ADMIN_API_BASE_URL}/api/contacts/${id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteContact: async (id) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/api/contacts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// Utility function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "_")
    .trim();
};

// Login Component
const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = React.useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!credentials.email || !credentials.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const result = await adminApiService.login(credentials);
    if (result.success) {
      onLogin();
    } else {
      setError(result.message || "Login failed");
    }

    setLoading(false);
  };

  return React.createElement(
    "div",
    {
      className:
        "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700",
    },
    React.createElement(
      "div",
      { className: "bg-white p-8 rounded-lg shadow-xl w-full max-w-md" },
      React.createElement(
        "div",
        { className: "text-center mb-8" },
        React.createElement("i", {
          className: "fas fa-taxi text-4xl text-blue-600 mb-4",
        }),
        React.createElement(
          "h1",
          { className: "text-2xl font-bold text-gray-800" },
          "Go Cab Admin"
        ),
        React.createElement(
          "p",
          { className: "text-gray-600 mt-2" },
          "Please sign in to continue"
        )
      ),

      error &&
        React.createElement(
          "div",
          {
            className:
              "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4",
          },
          error
        ),

      React.createElement(
        "form",
        { onSubmit: handleSubmit, className: "space-y-4" },
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Email Address"
          ),
          React.createElement("input", {
            type: "email",
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            placeholder: "Enter your email",
            value: credentials.email,
            onChange: (e) =>
              setCredentials((prev) => ({ ...prev, email: e.target.value })),
          })
        ),

        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Password"
          ),
          React.createElement("input", {
            type: "password",
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            placeholder: "Enter your password",
            value: credentials.password,
            onChange: (e) =>
              setCredentials((prev) => ({ ...prev, password: e.target.value })),
          })
        ),

        React.createElement(
          "button",
          {
            type: "submit",
            className: `w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`,
            disabled: loading,
          },
          loading ? "Signing in..." : "Sign In"
        )
      )
    )
  );
};

// Dashboard Component with FIXED stats
const Dashboard = () => {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStats = async () => {
      console.log("Loading dashboard stats...");
      const result = await adminApiService.getDashboardStats();
      console.log("Dashboard stats result:", result);
      if (result.success) {
        setStats(result.data);
      }
      setLoading(false);
    };

    loadStats();
  }, []);

  if (loading) {
    return React.createElement(
      "div",
      { className: "text-center py-8" },
      React.createElement("i", {
        className: "fas fa-spinner fa-spin text-2xl text-blue-600",
      }),
      React.createElement(
        "p",
        { className: "mt-2 text-gray-600" },
        "Loading dashboard..."
      )
    );
  }

  const statCards = [
    {
      title: "Total Categories",
      value: stats?.categories || 0,
      icon: "fas fa-list",
      color: "blue",
    },
    {
      title: "Total Services",
      value: stats?.services || 0,
      icon: "fas fa-car",
      color: "green",
    },
    {
      title: "Total Contacts",
      value: stats?.contacts || 0,
      icon: "fas fa-envelope",
      color: "purple",
    },
    {
      title: "Pending Inquiries",
      value: stats?.pendingContacts || 0,
      icon: "fas fa-clock",
      color: "orange",
    },
  ];

  return React.createElement(
    "div",
    null,
    React.createElement(
      "h1",
      { className: "text-2xl font-bold text-gray-800 mb-6" },
      "Dashboard"
    ),

    React.createElement(
      "div",
      {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
      },
      statCards.map((stat, index) =>
        React.createElement(
          "div",
          {
            key: index,
            className: `bg-white p-6 rounded-lg shadow border-l-4 border-${stat.color}-500`,
          },
          React.createElement(
            "div",
            { className: "flex items-center justify-between" },
            React.createElement(
              "div",
              null,
              React.createElement(
                "p",
                { className: "text-sm font-medium text-gray-600" },
                stat.title
              ),
              React.createElement(
                "p",
                { className: "text-2xl font-bold text-gray-900" },
                stat.value
              )
            ),
            React.createElement("i", {
              className: `${stat.icon} text-2xl text-${stat.color}-500`,
            })
          )
        )
      )
    ),

    React.createElement(
      "div",
      { className: "bg-white p-6 rounded-lg shadow" },
      React.createElement(
        "h2",
        { className: "text-lg font-semibold text-gray-800 mb-4" },
        "Recent Activity"
      ),
      React.createElement(
        "p",
        { className: "text-gray-600" },
        "Welcome to Go Cab Admin Panel! Use the sidebar to manage categories, services, and customer inquiries."
      )
    )
  );
};

// Category Management Component
const CategoryManagement = () => {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [messageType, setMessageType] = React.useState("");

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    status: "active",
  });

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const loadCategories = async () => {
    setLoading(true);
    const result = await adminApiService.getCategories();
    if (result.success) {
      setCategories(result.data || []);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", description: "", status: "active" });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      showMessage("Please fill in all required fields", "error");
      return;
    }

    const slug = generateSlug(formData.name);
    const categoryData = { ...formData, slug };

    let result;
    if (editingCategory) {
      result = await adminApiService.updateCategory(
        editingCategory._id,
        categoryData
      );
    } else {
      // Check if category already exists
      const existingCategory = categories.find(
        (cat) =>
          cat.slug === slug ||
          cat.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (existingCategory) {
        showMessage("A category with this name already exists", "error");
        return;
      }

      result = await adminApiService.createCategory(categoryData);
    }

    if (result.success) {
      showMessage(
        editingCategory
          ? "Category updated successfully"
          : "Category created successfully",
        "success"
      );
      resetForm();
      loadCategories();
    } else {
      showMessage(result.message || "Operation failed", "error");
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status,
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }

    const result = await adminApiService.deleteCategory(categoryId);
    if (result.success) {
      showMessage("Category deleted successfully", "success");
      loadCategories();
    } else {
      showMessage(result.message || "Failed to delete category", "error");
    }
  };

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      { className: "flex justify-between items-center mb-6" },
      React.createElement(
        "h1",
        { className: "text-2xl font-bold text-gray-800" },
        "Category Management"
      ),
      React.createElement(
        "button",
        {
          onClick: () => setShowForm(!showForm),
          className:
            "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
        },
        showForm ? "Cancel" : "Add New Category"
      )
    ),

    message &&
      React.createElement(
        "div",
        {
          className: `p-4 rounded-md mb-4 ${
            messageType === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`,
        },
        message
      ),

    showForm &&
      React.createElement(
        "div",
        { className: "bg-white p-6 rounded-lg shadow mb-6" },
        React.createElement(
          "h2",
          { className: "text-lg font-semibold mb-4" },
          editingCategory ? "Edit Category" : "Add New Category"
        ),

        React.createElement(
          "form",
          { onSubmit: handleSubmit, className: "space-y-4" },
          React.createElement(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-2" },
                "Category Name *"
              ),
              React.createElement("input", {
                type: "text",
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                placeholder: "e.g., Intracity, Airport Transfer",
                value: formData.name,
                onChange: (e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value })),
              }),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500 mt-1" },
                "This will be displayed to customers. A slug will be auto-generated."
              )
            ),

            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-2" },
                "Status"
              ),
              React.createElement(
                "select",
                {
                  className:
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  value: formData.status,
                  onChange: (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    })),
                },
                React.createElement("option", { value: "active" }, "Active"),
                React.createElement("option", { value: "inactive" }, "Inactive")
              ),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500 mt-1" },
                "Only active categories will be visible to customers"
              )
            )
          ),

          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              { className: "block text-sm font-medium text-gray-700 mb-2" },
              "Description *"
            ),
            React.createElement("textarea", {
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              rows: 3,
              placeholder: "Brief description of this category",
              value: formData.description,
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                })),
            }),
            React.createElement(
              "p",
              { className: "text-xs text-gray-500 mt-1" },
              "This description will help customers understand what services are included"
            )
          ),

          formData.name &&
            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-2" },
                "Generated Slug (Preview)"
              ),
              React.createElement(
                "div",
                { className: "p-2 bg-gray-100 rounded text-sm text-gray-700" },
                generateSlug(formData.name) || "Enter category name to see slug"
              )
            ),

          React.createElement(
            "div",
            { className: "flex gap-2" },
            React.createElement(
              "button",
              {
                type: "submit",
                className:
                  "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
              },
              editingCategory ? "Update Category" : "Create Category"
            ),
            React.createElement(
              "button",
              {
                type: "button",
                onClick: resetForm,
                className:
                  "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400",
              },
              "Cancel"
            )
          )
        )
      ),

    React.createElement(
      "div",
      { className: "bg-white rounded-lg shadow overflow-hidden" },
      loading
        ? React.createElement(
            "div",
            { className: "text-center py-8" },
            React.createElement("i", {
              className: "fas fa-spinner fa-spin text-xl text-blue-600",
            }),
            React.createElement(
              "p",
              { className: "mt-2" },
              "Loading categories..."
            )
          )
        : categories.length === 0
        ? React.createElement(
            "div",
            { className: "text-center py-8" },
            React.createElement("i", {
              className: "fas fa-folder-open text-4xl text-gray-400 mb-4",
            }),
            React.createElement(
              "p",
              { className: "text-gray-600" },
              "No categories found. Create your first category to get started."
            )
          )
        : React.createElement(
            "div",
            { className: "overflow-x-auto" },
            React.createElement(
              "table",
              { className: "w-full" },
              React.createElement(
                "thead",
                { className: "bg-gray-50" },
                React.createElement(
                  "tr",
                  null,
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Name"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Slug"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Description"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Status"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Actions"
                  )
                )
              ),
              React.createElement(
                "tbody",
                { className: "divide-y divide-gray-200" },
                categories.map((category) =>
                  React.createElement(
                    "tr",
                    { key: category._id, className: "hover:bg-gray-50" },
                    React.createElement(
                      "td",
                      {
                        className:
                          "px-6 py-4 text-sm font-medium text-gray-900",
                      },
                      category.name
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4 text-sm text-gray-600" },
                      category.slug
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4 text-sm text-gray-600" },
                      category.description
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4" },
                      React.createElement(
                        "span",
                        {
                          className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`,
                        },
                        category.status
                      )
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4 text-sm" },
                      React.createElement(
                        "div",
                        { className: "flex gap-2" },
                        React.createElement(
                          "button",
                          {
                            onClick: () => handleEdit(category),
                            className: "text-blue-600 hover:text-blue-800",
                          },
                          React.createElement("i", { className: "fas fa-edit" })
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: () => handleDelete(category._id),
                            className: "text-red-600 hover:text-red-800",
                          },
                          React.createElement("i", {
                            className: "fas fa-trash",
                          })
                        )
                      )
                    )
                  )
                )
              )
            )
          )
    )
  );
};

// Service Management Component with Enhanced Image Support and FIXED Display
const ServiceManagement = () => {
  const [services, setServices] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingService, setEditingService] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [messageType, setMessageType] = React.useState("");

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    category: "",
    price: "",
    duration: "",
    features: "",
    status: "active",
    image: null,
  });

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const loadData = async () => {
    setLoading(true);
    const [servicesResult, categoriesResult] = await Promise.all([
      adminApiService.getServices(),
      adminApiService.getCategories(),
    ]);

    if (servicesResult.success) {
      setServices(servicesResult.data || []);
    }

    if (categoriesResult.success) {
      setCategories(categoriesResult.data || []);
    }

    setLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      duration: "",
      features: "",
      status: "active",
      image: null,
    });
    setEditingService(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.category ||
      !formData.price
    ) {
      showMessage("Please fill in all required fields", "error");
      return;
    }

    if (!categories.find((cat) => cat._id === formData.category)) {
      showMessage(
        "Please select a valid category. Create categories first if none exist.",
        "error"
      );
      return;
    }

    let result;

    if (editingService) {
      // For updating, check if we have an image to upload
      if (formData.image) {
        const formDataObj = new FormData();
        formDataObj.append("name", formData.name);
        formDataObj.append("description", formData.description);
        formDataObj.append("category", formData.category);
        formDataObj.append("price", parseFloat(formData.price));
        formDataObj.append("duration", formData.duration);
        formDataObj.append("status", formData.status);
        formDataObj.append("image", formData.image);

        if (formData.features) {
          formDataObj.append(
            "features",
            JSON.stringify(formData.features.split(",").map((f) => f.trim()))
          );
        }

        result = await adminApiService.updateServiceWithImage(
          editingService._id,
          formDataObj
        );
      } else {
        // No image, use regular JSON update
        const serviceData = {
          ...formData,
          price: parseFloat(formData.price),
          features: formData.features
            ? formData.features.split(",").map((f) => f.trim())
            : [],
        };
        delete serviceData.image;

        result = await adminApiService.updateService(
          editingService._id,
          serviceData
        );
      }
    } else {
      // For creating new service
      const existingService = services.find(
        (service) =>
          service.name.toLowerCase() === formData.name.toLowerCase() &&
          (service.category._id === formData.category ||
            service.category === formData.category)
      );

      if (existingService) {
        showMessage(
          "A service with this name already exists in this category",
          "error"
        );
        return;
      }

      if (formData.image) {
        // Use FormData for image upload
        const formDataObj = new FormData();
        formDataObj.append("name", formData.name);
        formDataObj.append("description", formData.description);
        formDataObj.append("category", formData.category);
        formDataObj.append("price", parseFloat(formData.price));
        formDataObj.append("duration", formData.duration);
        formDataObj.append("status", formData.status);
        formDataObj.append("image", formData.image);

        if (formData.features) {
          formDataObj.append(
            "features",
            JSON.stringify(formData.features.split(",").map((f) => f.trim()))
          );
        }

        result = await adminApiService.createServiceWithImage(formDataObj);
      } else {
        // No image, use regular JSON
        const serviceData = {
          ...formData,
          price: parseFloat(formData.price),
          features: formData.features
            ? formData.features.split(",").map((f) => f.trim())
            : [],
        };
        delete serviceData.image;

        result = await adminApiService.createService(serviceData);
      }
    }

    if (result.success) {
      showMessage(
        editingService
          ? "Service updated successfully"
          : "Service created successfully",
        "success"
      );
      resetForm();
      loadData();
    } else {
      showMessage(result.message || "Operation failed", "error");
    }
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category?._id || service.category,
      price: service.price?.toString() || "",
      duration: service.duration || "",
      features: Array.isArray(service.features)
        ? service.features.join(", ")
        : "",
      status: service.status,
      image: null, // Don't pre-load existing image
    });
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (
      !confirm(
        "Are you sure you want to delete this service? This action cannot be undone."
      )
    ) {
      return;
    }

    const result = await adminApiService.deleteService(serviceId);
    if (result.success) {
      showMessage("Service deleted successfully", "success");
      loadData();
    } else {
      showMessage(result.message || "Failed to delete service", "error");
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  if (loading) {
    return React.createElement(
      "div",
      { className: "text-center py-8" },
      React.createElement("i", {
        className: "fas fa-spinner fa-spin text-2xl text-blue-600",
      }),
      React.createElement(
        "p",
        { className: "mt-2 text-gray-600" },
        "Loading services..."
      )
    );
  }

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      { className: "flex justify-between items-center mb-6" },
      React.createElement(
        "h1",
        { className: "text-2xl font-bold text-gray-800" },
        "Service Management"
      ),
      React.createElement(
        "button",
        {
          onClick: () => {
            if (categories.length === 0) {
              showMessage(
                "Please create at least one category before adding services",
                "error"
              );
              return;
            }

            setShowForm(!showForm);
          },
          className:
            "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
        },
        showForm ? "Cancel" : "Add New Service"
      )
    ),

    message &&
      React.createElement(
        "div",
        {
          className: `p-4 rounded-md mb-4 ${
            messageType === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`,
        },
        message
      ),

    categories.length === 0 &&
      React.createElement(
        "div",
        {
          className:
            "bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6",
        },
        React.createElement("i", { className: "fas fa-info-circle mr-2" }),
        "No categories available. Please create categories first before adding services."
      ),

    showForm &&
      categories.length > 0 &&
      React.createElement(
        "div",
        { className: "bg-white p-6 rounded-lg shadow mb-6" },
        React.createElement(
          "h2",
          { className: "text-lg font-semibold mb-4" },
          editingService ? "Edit Service" : "Add New Service"
        ),

        React.createElement(
          "form",
          { onSubmit: handleSubmit, className: "space-y-4" },
          React.createElement(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-2" },
                "Service Name *"
              ),
              React.createElement("input", {
                type: "text",
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                placeholder: "e.g., City Ride Economy, Airport VIP Transfer",
                value: formData.name,
                onChange: (e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value })),
              }),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500 mt-1" },
                "Unique name for this service within the selected category"
              )
            ),

            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-2" },
                "Category *"
              ),
              React.createElement(
                "select",
                {
                  className:
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  value: formData.category,
                  onChange: (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    })),
                },
                React.createElement(
                  "option",
                  { value: "" },
                  "Select a category"
                ),
                categories.map((category) =>
                  React.createElement(
                    "option",
                    { key: category._id, value: category._id },
                    `${category.name} (${category.slug})`
                  )
                )
              ),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500 mt-1" },
                "Choose the category this service belongs to"
              )
            ),

            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-2" },
                "Price *"
              ),
              React.createElement("input", {
                type: "number",
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                placeholder: "e.g., 150, 12 (for per km)",
                value: formData.price,
                onChange: (e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value })),
              }),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500 mt-1" },
                "Base price in rupees (use whole numbers)"
              )
            ),

            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-2" },
                "Duration/Unit"
              ),
              React.createElement("input", {
                type: "text",
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                placeholder: "e.g., Per KM, 4 Hours, One Way",
                value: formData.duration,
                onChange: (e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  })),
              }),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500 mt-1" },
                "Pricing unit or duration (optional)"
              )
            ),

            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-sm font-medium text-gray-700 mb-2" },
                "Status"
              ),
              React.createElement(
                "select",
                {
                  className:
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                  value: formData.status,
                  onChange: (e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    })),
                },
                React.createElement("option", { value: "active" }, "Active"),
                React.createElement("option", { value: "inactive" }, "Inactive")
              )
            )
          ),

          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              { className: "block text-sm font-medium text-gray-700 mb-2" },
              "Description *"
            ),
            React.createElement("textarea", {
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              rows: 3,
              placeholder: "Detailed description of the service",
              value: formData.description,
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                })),
            })
          ),

          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              { className: "block text-sm font-medium text-gray-700 mb-2" },
              "Features"
            ),
            React.createElement("textarea", {
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              rows: 2,
              placeholder: "AC Vehicle, Professional Driver, GPS Tracking",
              value: formData.features,
              onChange: (e) =>
                setFormData((prev) => ({ ...prev, features: e.target.value })),
            }),
            React.createElement(
              "p",
              { className: "text-xs text-gray-500 mt-1" },
              "Comma-separated list of features (optional)"
            )
          ),

          // Image Upload Field
          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              { className: "block text-sm font-medium text-gray-700 mb-2" },
              "Service Image"
            ),
            React.createElement(DropzoneField, {
              onDrop: (file) =>
                setFormData((prev) => ({ ...prev, image: file })),
              file: formData.image,
            }),
            React.createElement(
              "p",
              { className: "text-xs text-gray-500 mt-1" },
              "Upload an image to showcase this service. Drag & drop or click to select. (Max 5MB)"
            )
          ),

          React.createElement(
            "div",
            { className: "flex gap-2" },
            React.createElement(
              "button",
              {
                type: "submit",
                className:
                  "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
              },
              editingService ? "Update Service" : "Create Service"
            ),
            React.createElement(
              "button",
              {
                type: "button",
                onClick: resetForm,
                className:
                  "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400",
              },
              "Cancel"
            )
          )
        )
      ),

    React.createElement(
      "div",
      { className: "bg-white rounded-lg shadow overflow-hidden" },
      services.length === 0
        ? React.createElement(
            "div",
            { className: "text-center py-8" },
            React.createElement("i", {
              className: "fas fa-car text-4xl text-gray-400 mb-4",
            }),
            React.createElement(
              "p",
              { className: "text-gray-600" },
              "No services found. Add your first service to get started."
            )
          )
        : React.createElement(
            "div",
            { className: "overflow-x-auto" },
            React.createElement(
              "table",
              { className: "w-full" },
              React.createElement(
                "thead",
                { className: "bg-gray-50" },
                React.createElement(
                  "tr",
                  null,
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Service"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Category"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Price"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Status"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Actions"
                  )
                )
              ),
              React.createElement(
                "tbody",
                { className: "divide-y divide-gray-200" },
                services.map((service) =>
                  React.createElement(
                    "tr",
                    { key: service._id, className: "hover:bg-gray-50" },
                    React.createElement(
                      "td",
                      { className: "px-6 py-4" },
                      React.createElement(
                        "div",
                        { className: "flex items-center space-x-3" },
                        // Show service image if available with FIXED URL handling
                        service.image &&
                          React.createElement("img", {
                            src: service.image.startsWith("http")
                              ? service.image
                              : `${ADMIN_API_BASE_URL}${service.image}`,
                            alt: service.name,
                            className:
                              "w-16 h-16 rounded-lg object-cover border border-gray-200",
                            onError: (e) => {
                              console.log(
                                "Image failed to load:",
                                service.image
                              );
                              // Hide the broken image
                              e.target.style.display = "none";
                            },
                          }),
                        React.createElement(
                          "div",
                          { className: "flex-1" },
                          React.createElement(
                            "div",
                            { className: "text-sm font-medium text-gray-900" },
                            service.name
                          ),
                          React.createElement(
                            "div",
                            { className: "text-sm text-gray-600" },
                            service.description?.substring(0, 100) +
                              (service.description?.length > 100 ? "..." : "")
                          ),
                          service.duration &&
                            React.createElement(
                              "div",
                              { className: "text-xs text-gray-500 mt-1" },
                              `Duration: ${service.duration}`
                            )
                        )
                      )
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4 text-sm text-gray-600" },
                      getCategoryName(service.category?._id || service.category)
                    ),
                    React.createElement(
                      "td",
                      {
                        className:
                          "px-6 py-4 text-sm font-medium text-gray-900",
                      },
                      `₹${service.price}${
                        service.duration ? `/${service.duration}` : ""
                      }`
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4" },
                      React.createElement(
                        "span",
                        {
                          className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            service.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`,
                        },
                        service.status
                      )
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4 text-sm" },
                      React.createElement(
                        "div",
                        { className: "flex gap-2" },
                        React.createElement(
                          "button",
                          {
                            onClick: () => handleEdit(service),
                            className: "text-blue-600 hover:text-blue-800",
                            title: "Edit Service",
                          },
                          React.createElement("i", { className: "fas fa-edit" })
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: () => handleDelete(service._id),
                            className: "text-red-600 hover:text-red-800",
                            title: "Delete Service",
                          },
                          React.createElement("i", {
                            className: "fas fa-trash",
                          })
                        )
                      )
                    )
                  )
                )
              )
            )
          )
    )
  );
};

// Contact Management Component
const ContactManagement = () => {
  const [contacts, setContacts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({
    status: "",
    serviceType: "",
    page: 1,
    limit: 20,
  });
  const [message, setMessage] = React.useState("");
  const [messageType, setMessageType] = React.useState("");

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const loadContacts = async () => {
    setLoading(true);
    const result = await adminApiService.getContacts(filters);
    if (result.success) {
      setContacts(result.data || []);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadContacts();
  }, [filters]);

  const handleStatusUpdate = async (contactId, newStatus) => {
    const result = await adminApiService.updateContactStatus(
      contactId,
      newStatus
    );

    if (result.success) {
      showMessage("Contact status updated successfully", "success");
      loadContacts();
    } else {
      showMessage(result.message || "Failed to update status", "error");
    }
  };

  const handleDelete = async (contactId) => {
    if (
      !confirm(
        "Are you sure you want to delete this contact? This action cannot be undone."
      )
    ) {
      return;
    }

    const result = await adminApiService.deleteContact(contactId);
    if (result.success) {
      showMessage("Contact deleted successfully", "success");
      loadContacts();
    } else {
      showMessage(result.message || "Failed to delete contact", "error");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return React.createElement(
    "div",
    null,
    React.createElement(
      "h1",
      { className: "text-2xl font-bold text-gray-800 mb-6" },
      "Contact Management"
    ),

    message &&
      React.createElement(
        "div",
        {
          className: `p-4 rounded-md mb-4 ${
            messageType === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`,
        },
        message
      ),

    React.createElement(
      "div",
      { className: "bg-white p-4 rounded-lg shadow mb-6" },
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Status Filter"
          ),
          React.createElement(
            "select",
            {
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              value: filters.status,
              onChange: (e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                  page: 1,
                })),
            },
            React.createElement("option", { value: "" }, "All Statuses"),
            React.createElement("option", { value: "unread" }, "Unread"),
            React.createElement("option", { value: "read" }, "Read"),
            React.createElement("option", { value: "responded" }, "Responded")
          )
        ),

        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            { className: "block text-sm font-medium text-gray-700 mb-2" },
            "Service Type Filter"
          ),
          React.createElement(
            "select",
            {
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              value: filters.serviceType,
              onChange: (e) =>
                setFilters((prev) => ({
                  ...prev,
                  serviceType: e.target.value,
                  page: 1,
                })),
            },
            React.createElement("option", { value: "" }, "All Service Types"),
            React.createElement("option", { value: "intracity" }, "Intracity"),
            React.createElement(
              "option",
              { value: "airport_transfer" },
              "Airport Transfer"
            ),
            React.createElement(
              "option",
              { value: "outstation" },
              "Outstation"
            ),
            React.createElement(
              "option",
              { value: "hourly_rental" },
              "Hourly Rental"
            )
          )
        ),

        React.createElement(
          "div",
          { className: "flex items-end" },
          React.createElement(
            "button",
            {
              onClick: loadContacts,
              className:
                "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
            },
            React.createElement("i", { className: "fas fa-sync-alt mr-2" }),
            "Refresh"
          )
        )
      )
    ),

    React.createElement(
      "div",
      { className: "bg-white rounded-lg shadow overflow-hidden" },
      loading
        ? React.createElement(
            "div",
            { className: "text-center py-8" },
            React.createElement("i", {
              className: "fas fa-spinner fa-spin text-xl text-blue-600",
            }),
            React.createElement(
              "p",
              { className: "mt-2" },
              "Loading contacts..."
            )
          )
        : contacts.length === 0
        ? React.createElement(
            "div",
            { className: "text-center py-8" },
            React.createElement("i", {
              className: "fas fa-envelope text-4xl text-gray-400 mb-4",
            }),
            React.createElement(
              "p",
              { className: "text-gray-600" },
              "No contacts found matching your filters."
            )
          )
        : React.createElement(
            "div",
            { className: "overflow-x-auto" },
            React.createElement(
              "table",
              { className: "w-full" },
              React.createElement(
                "thead",
                { className: "bg-gray-50" },
                React.createElement(
                  "tr",
                  null,
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Contact Info"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Service Details"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Travel Info"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Status"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Date"
                  ),
                  React.createElement(
                    "th",
                    {
                      className:
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                    },
                    "Actions"
                  )
                )
              ),
              React.createElement(
                "tbody",
                { className: "divide-y divide-gray-200" },
                contacts.map((contact) =>
                  React.createElement(
                    "tr",
                    { key: contact._id, className: "hover:bg-gray-50" },
                    React.createElement(
                      "td",
                      { className: "px-6 py-4" },
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "div",
                          { className: "text-sm font-medium text-gray-900" },
                          contact.name
                        ),
                        React.createElement(
                          "div",
                          { className: "text-sm text-gray-600" },
                          contact.phone
                        ),
                        contact.email &&
                          React.createElement(
                            "div",
                            { className: "text-sm text-gray-600" },
                            contact.email
                          )
                      )
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4" },
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "div",
                          { className: "text-sm text-gray-900" },
                          contact.serviceType
                            ?.replace("_", " ")
                            .toUpperCase() || "Not specified"
                        ),
                        contact.passengers &&
                          React.createElement(
                            "div",
                            { className: "text-sm text-gray-600" },
                            `${contact.passengers} passenger(s)`
                          )
                      )
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4" },
                      React.createElement(
                        "div",
                        null,
                        contact.pickupLocation &&
                          React.createElement(
                            "div",
                            { className: "text-sm text-gray-900" },
                            `From: ${contact.pickupLocation}`
                          ),
                        contact.dropLocation &&
                          React.createElement(
                            "div",
                            { className: "text-sm text-gray-600" },
                            `To: ${contact.dropLocation}`
                          ),
                        contact.travelDate &&
                          React.createElement(
                            "div",
                            { className: "text-sm text-gray-600" },
                            `Date: ${new Date(
                              contact.travelDate
                            ).toLocaleDateString()}`
                          )
                      )
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4" },
                      React.createElement(
                        "select",
                        {
                          className: `text-sm border border-gray-300 rounded px-2 py-1 font-medium ${
                            contact.status === "responded"
                              ? "text-green-800 bg-green-50"
                              : contact.status === "read"
                              ? "text-blue-800 bg-blue-50"
                              : "text-red-800 bg-red-50"
                          }`,
                          value: contact.status,
                          onChange: (e) =>
                            handleStatusUpdate(contact._id, e.target.value),
                        },
                        React.createElement(
                          "option",
                          { value: "unread" },
                          "Unread"
                        ),
                        React.createElement(
                          "option",
                          { value: "read" },
                          "Read"
                        ),
                        React.createElement(
                          "option",
                          { value: "responded" },
                          "Responded"
                        )
                      )
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4 text-sm text-gray-600" },
                      formatDate(contact.createdAt || contact.submittedAt)
                    ),
                    React.createElement(
                      "td",
                      { className: "px-6 py-4 text-sm" },
                      React.createElement(
                        "div",
                        { className: "flex gap-2" },
                        contact.message &&
                          React.createElement(
                            "button",
                            {
                              onClick: () =>
                                alert(`Message: ${contact.message}`),
                              className: "text-blue-600 hover:text-blue-800",
                              title: "View Message",
                            },
                            React.createElement("i", {
                              className: "fas fa-eye",
                            })
                          ),
                        React.createElement(
                          "button",
                          {
                            onClick: () => handleDelete(contact._id),
                            className: "text-red-600 hover:text-red-800",
                            title: "Delete Contact",
                          },
                          React.createElement("i", {
                            className: "fas fa-trash",
                          })
                        )
                      )
                    )
                  )
                )
              )
            )
          )
    )
  );
};

// Main Admin App Component with FIXED navigation styles
const AdminApp = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState("dashboard");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = async () => {
    await adminApiService.logout();
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
  };

  if (loading) {
    return React.createElement(
      "div",
      { className: "min-h-screen flex items-center justify-center" },
      React.createElement("i", {
        className: "fas fa-spinner fa-spin text-2xl text-blue-600",
      })
    );
  }

  if (!isLoggedIn) {
    return React.createElement(Login, { onLogin: handleLogin });
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { id: "categories", label: "Categories", icon: "fas fa-list" },
    { id: "services", label: "Services", icon: "fas fa-car" },
    { id: "contacts", label: "Contacts", icon: "fas fa-envelope" },
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return React.createElement(Dashboard);
      case "categories":
        return React.createElement(CategoryManagement);
      case "services":
        return React.createElement(ServiceManagement);
      case "contacts":
        return React.createElement(ContactManagement);
      default:
        return React.createElement(Dashboard);
    }
  };

  return React.createElement(
    "div",
    { className: "flex min-h-screen bg-gray-100" },
    // Sidebar with FIXED styles
    React.createElement(
      "div",
      {
        className: "w-64 bg-blue-800 text-white flex flex-col",
        style: { minHeight: "100vh" },
      },
      React.createElement(
        "div",
        { className: "p-4 border-b border-blue-700" },
        React.createElement(
          "div",
          { className: "flex items-center space-x-2" },
          React.createElement("i", {
            className: "fas fa-taxi text-2xl text-orange-400",
          }),
          React.createElement(
            "span",
            { className: "text-xl font-bold text-white" },
            "Go Cab Admin"
          )
        )
      ),

      React.createElement(
        "nav",
        { className: "flex-1 p-4" },
        sidebarItems.map((item) =>
          React.createElement(
            "div",
            {
              key: item.id,
              className: `flex items-center px-4 py-3 mb-2 rounded-md cursor-pointer transition-colors ${
                currentPage === item.id
                  ? "bg-blue-700 text-white border-l-4 border-orange-400"
                  : "text-blue-200 hover:bg-blue-700 hover:text-white"
              }`,
              onClick: () => setCurrentPage(item.id),
            },
            React.createElement("i", { className: `${item.icon} mr-3 w-5` }),
            item.label
          )
        )
      ),

      React.createElement(
        "div",
        { className: "p-4 border-t border-blue-700" },
        React.createElement(
          "button",
          {
            onClick: handleLogout,
            className:
              "flex items-center w-full px-4 py-3 text-blue-200 hover:bg-blue-700 hover:text-white rounded-md transition-colors",
          },
          React.createElement("i", {
            className: "fas fa-sign-out-alt mr-3 w-5",
          }),
          "Logout"
        )
      )
    ),

    // Main Content
    React.createElement(
      "div",
      { className: "flex-1 overflow-auto" },
      React.createElement("div", { className: "p-6" }, renderCurrentPage())
    )
  );
};

// Render the Admin App
ReactDOM.render(
  React.createElement(AdminApp),
  document.getElementById("admin-root")
);
