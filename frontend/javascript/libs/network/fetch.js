export async function handleResponseError(response) {
    let error = await response.json();
    if (response.status == 401) {
        throw new Error("Nem vagy bejelentkezve!");
    }
    throw new Error(error.error || "Szerver hiba: " + response.status);
}

export function validateJsonResponse(data, defaultErrorMsg = "Sikertelen művelet!") {
    if (!data.success) {
        throw new Error(data.error || defaultErrorMsg);
    }
    return data;
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
    validateJsonResponse(data);

    return data[returnKey];
}