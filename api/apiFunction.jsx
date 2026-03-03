import axios from "axios";

export const apiFunction = async (
  api,
  params = [],
  data = {},
  type = "get",
  withAuth = false
) => {
  try {
    const url = `${api}${params.length ? "/" + params.join("/") : ""}`;

    const config = {};

    // Attach token if required
    if (withAuth) {
      const token = localStorage.getItem("token");
      config.headers = {
        Authorization: `Bearer ${token}`, 
      };
    }

    let response;

    console.log("data", data)
    switch (type.toLowerCase()) {
      case "get":
        response = await axios.get(url, config);
        break;

      case "post":
        response = await axios.post(url, {data}, config);
        break;

      case "put":
        response = await axios.put(url, {data}, config);
        break;

      case "delete":
        response = await axios.delete(url, config);
        break;

      default:
        throw new Error("Invalid request type");
    }

    console.log("response",response)

    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return error.response?.data
   
  }
};
