import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// ✅ Static food list from local assets
import { food_list as static_food_list } from "../assets/frontend_assets/assets.js";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");

  const url = "https://food-delivery-backend-5b6g.onrender.com";

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }

    if (token) {
      const response = await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
      response.data.success
        ? toast.success("Item added to cart")
        : toast.error("Something went wrong");
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

    if (token) {
      const response = await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
      response.data.success
        ? toast.success("Item removed from cart")
        : toast.error("Something went wrong");
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // ✅ Fallback to static food list if backend fails or returns empty
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data.success && response.data.data.length > 0) {
        console.log("✅ Fetched food list from backend:", response.data.data);
        setFoodList(response.data.data);
      } else {
        console.warn("⚠️ No food items found in the response. Using static fallback.");
        setFoodList(static_food_list);
      }
    } catch (error) {
      console.error("❌ Error fetching food list. Using static fallback:", error);
      setFoodList(static_food_list);
    }
  };

  const loadCardData = async (token) => {
    const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
    setCartItems(response.data.cartData);
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList(); // ✅ always call this
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCardData(localStorage.getItem("token"));
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
