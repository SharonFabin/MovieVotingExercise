import axios from "axios";

const signIn = async () => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}${process.env.NEXT_PUBLIC_LOGIN_PATH}`,
      {
        username: process.env.NEXT_PUBLIC_USER_NAME,
        password: process.env.NEXT_PUBLIC_USER_PASSWORD,
      },
    );
    return response.data;
  } catch (error) {
    console.log("Error: ", error);
  }
};

export { signIn };
