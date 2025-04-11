document.addEventListener("DOMContentLoaded", function () {
  const restaurantsList = document.getElementById("restaurants");
  const modal = document.getElementById("restaurant-modal");
  const closeModalButton = document.getElementById("closeModal");
  const restaurantName = document.getElementById("restaurant-name");
  const restaurantAddress = document.getElementById("restaurant-address");
  const dailyMenuContent = document.getElementById("daily-menu-content");
  const weeklyMenuContent = document.getElementById("weekly-menu-content");
  const dailyMenuButton = document.getElementById("daily-menu-button");
  const weeklyMenuButton = document.getElementById("weekly-menu-button");
  const dailyMenuSection = document.getElementById("daily-menu-section");
  const weeklyMenuSection = document.getElementById("weekly-menu-section");
  const apiBaseUrl = "https://media2.edu.metropolia.fi/restaurant/api/v1"; // Your API base URL
  let currentRestaurantId = null; // To track the selected restaurant ID

  // Fetch the list of restaurants
  async function fetchRestaurants() {
    try {
      const response = await fetch(`${apiBaseUrl}/restaurants`);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      renderRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  }

  function renderRestaurants(restaurants) {
    restaurantsList.innerHTML = "";
    restaurants.forEach((restaurant) => {
      const li = document.createElement("li");
      li.textContent = restaurant.name;
      li.addEventListener("click", () => openModal(restaurant._id)); // make sure _id exists
      restaurantsList.appendChild(li);
    });
  }

  // Fetch restaurant details (e.g., name, address)
  async function fetchRestaurantDetails(restaurantId) {
    try {
      const url = `${apiBaseUrl}/restaurants/${restaurantId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch restaurant details");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      return null;
    }
  }

  // Fetch and display today's menu for the selected restaurant
  async function fetchDailyMenu(restaurantId, lang = "en") {
    try {
      const response = await fetch(`${apiBaseUrl}/restaurants/daily/${restaurantId}/${lang}`);
      if (!response.ok) {
        throw new Error("Failed to fetch daily menu");
      }
      const menu = await response.json();
      if (menu && Array.isArray(menu.courses) && menu.courses.length > 0) {
        displayDailyMenu(menu.courses);
      } else {
        dailyMenuContent.innerHTML = "<p>No menu available today.</p>";
      }
    } catch (error) {
      console.error("Error fetching daily menu:", error);
      dailyMenuContent.innerHTML = "<p>No menu available today.</p>";
    }
  }

  async function fetchWeeklyMenu(restaurantId, lang = "en") {
    try {
      const response = await fetch(`${apiBaseUrl}/restaurants/weekly/${restaurantId}/${lang}`);
      if (!response.ok) {
        throw new Error("Failed to fetch weekly menu");
      }
      const menu = await response.json();
      if (menu && Array.isArray(menu.days) && menu.days.length > 0) {
        displayWeeklyMenu(menu.days);
      } else {
        weeklyMenuContent.innerHTML = "<p>No menu available this week.</p>";
      }
    } catch (error) {
      console.error("Error fetching weekly menu:", error);
      weeklyMenuContent.innerHTML = "<p>No menu available this week.</p>";
    }
  }

  // Display the daily menu
  function displayDailyMenu(courses) {
    dailyMenuContent.innerHTML = ""; // Clear previous menu
    if (!courses || courses.length === 0) {
      dailyMenuContent.innerHTML = "<p>This restaurant has no menu available today.</p>";
      return;
    }

    courses.forEach(course => {
      const name = course.name || "No name available";
      const price = course.price || "No price available";
      const diets = course.diets || "No diet info";
      const menuItem = document.createElement("p");
      menuItem.textContent = `${name} (${diets}): ${price}`;
      dailyMenuContent.appendChild(menuItem);
    });
  }

  // Display the weekly menu
  function displayWeeklyMenu(days) {
    weeklyMenuContent.innerHTML = ""; // Clear previous menu
    let hasMenu = false; // Flag to track if any menu items were rendered

    if (!days || days.length === 0) {
      weeklyMenuContent.innerHTML = "<p>This restaurant has no weekly menu available right now.</p>";
      return;
    }

    days.forEach(day => {
      if (Array.isArray(day.courses) && day.courses.length > 0) {
        const dayHeading = document.createElement("h3");
        dayHeading.textContent = day.date || "No date available"; // Fallback for date
        weeklyMenuContent.appendChild(dayHeading);

        day.courses.forEach(course => {
          const name = course.name || "No name available";
          const price = course.price || "No price available";
          const diets = course.diets || "No diet info";
          const menuItem = document.createElement("p");
          menuItem.textContent = `${name} (${diets}): ${price}`;
          weeklyMenuContent.appendChild(menuItem);
        });

        hasMenu = true; // At least one course was rendered for this day
      }
    });

    if (!hasMenu) {
      weeklyMenuContent.innerHTML = "<p>This restaurant has no weekly menu available right now.</p>";
    }
  }

  // Open the modal and fetch restaurant details
  async function openModal(restaurantId) {
    const restaurant = await fetchRestaurantDetails(restaurantId);
    if (!restaurant) {
      alert("Failed to load restaurant details.");
      return;
    }

    // Display restaurant details
    document.getElementById("restaurant-name").textContent = restaurant.name;
    document.getElementById("restaurant-address").textContent = restaurant.address;
    document.getElementById("restaurant-postalCode").textContent = restaurant.postalCode || "N/A";
    document.getElementById("restaurant-city").textContent = restaurant.city || "N/A";
    document.getElementById("restaurant-phone").textContent = restaurant.phone || "N/A";
    document.getElementById("restaurant-company").textContent = restaurant.company || "N/A";

    // Set currentRestaurantId
    currentRestaurantId = restaurantId;

    // Initially, do not fetch menus until a tab is clicked
    dailyMenuContent.innerHTML = "<p>Please choose a menu type.</p>";
    weeklyMenuContent.innerHTML = "<p>Please choose a menu type.</p>";

    // Show the modal
    modal.showModal();
  }

  // Event listeners for menu toggle buttons
  dailyMenuButton.addEventListener("click", function () {
    dailyMenuSection.style.display = "block";
    weeklyMenuSection.style.display = "none";
    fetchDailyMenu(currentRestaurantId, "en"); // Fetch today's menu
  });

  weeklyMenuButton.addEventListener("click", function () {
    weeklyMenuSection.style.display = "block";
    dailyMenuSection.style.display = "none";
    fetchWeeklyMenu(currentRestaurantId, "en"); // Fetch weekly menu
  });

  // Close modal when the close button is clicked
  closeModalButton.addEventListener("click", () => {
    modal.close();
  });

  // Fetch restaurants on page load
  fetchRestaurants();
});
