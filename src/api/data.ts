import axios from "axios";

const getMoviesData = async (token: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}${process.env.NEXT_PUBLIC_MOVIES_API_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log("Error: ", error);
  }
};

export { getMoviesData };
