interface UpdateUserProfileHeaders {
  name?: string;
  role?: string;
  avatar_url?: string;
  selected_currency?: string;
  selected_period?: string;
  theme_preference?: string;
  last_active_tab?: string;
  language?: string;
  market_show_more?: string;
}

// The Header parameter given should include any of the above types as the object key with a string value to insert

export const updateUserProfile = async (
  userId: string,
  headers: UpdateUserProfileHeaders
) => {
  try {
    const url = `/api/user-profile?user_id=${userId}`;

    const requestHeaders = new Headers();
    // Dynamically add headers from the provided `headers` object
    for (const [key, value] of Object.entries(headers)) {
      if (value) {
        requestHeaders.append(key, value);
      }
    }

    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("An error occurred while updating the user profile.");
  }
};
