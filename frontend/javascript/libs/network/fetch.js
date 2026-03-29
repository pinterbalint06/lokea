export async function handleResponseError(response) {
    let errorMessage;
    try {
        let errorData = await response.json();
        errorMessage = errorData.error || errorData.message;
    } catch (error) {
    }
    throw new Error(errorMessage || "Szerver hiba: " + response.status);
}

export async function fetchAndValidate(url, returnKey) {
    let response = await fetch(
        url,
        {
            method: "GET"
        }
    );

    if (!response.ok) {
        await handleResponseError(response);
    }

    let data = await response.json();

    return data[returnKey];
}