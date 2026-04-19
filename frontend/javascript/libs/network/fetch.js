export async function handleResponseError(response) {
    let errorMessage;
    try {
        let errorData = await response.json();
        errorMessage = errorData.error || errorData.message;
    } catch (error) {
    }
    throw new Error(errorMessage || "Szerver hiba: " + response.status);
}

export async function fetchAndValidate(url, returnKey, signal) {
    let response = await fetch(
        url,
        {
            method: "GET",
            signal
        }
    );

    if (!response.ok) {
        await handleResponseError(response);
    }

    let data = await response.json();

    return returnKey ? data[returnKey] : data;
}
