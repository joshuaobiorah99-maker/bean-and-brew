const API_URL = "http://localhost:3000";

const menuForm = document.getElementById("menuForm");
const menuItemsContainer = document.getElementById("menuItems");

let editingItemName = null;


// =========================
// ADMIN PASSWORD
// =========================

let adminPassword = sessionStorage.getItem("adminPassword");

function askForPassword() {

    const typed = prompt("Enter admin password");

    if (!typed) {
        return false;
    }

    adminPassword = typed;
    sessionStorage.setItem("adminPassword", typed);

    return true;
}

// Called whenever the server answers 401 (wrong password)
// or 429 (too many wrong attempts).

function handleAuthFailure(response) {

    if (response.status === 401) {

        sessionStorage.removeItem("adminPassword");
        adminPassword = null;

        alert("Wrong admin password.");
        location.reload();

        return true;
    }

    if (response.status === 429) {

        alert("Too many wrong attempts. Try again in 15 minutes.");

        return true;
    }

    return false;
}

// Checks the password with the server as soon as the page opens.

function checkPassword() {

    if (!adminPassword && !askForPassword()) {
        document.body.innerHTML =
            "<p style='padding:20px'>Admin password required. Refresh the page to try again.</p>";
        return Promise.resolve(false);
    }

    return fetch(API_URL + "/api/admin/check", {
        headers: { "x-admin-password": adminPassword }
    })

        .then(function(response) {

            if (response.ok) {
                return true;
            }

            handleAuthFailure(response);

            return false;
        })

        .catch(function(error) {

            menuItemsContainer.textContent =
                "Could not connect to the backend.";

            console.error(error);

            return false;
        });
}


// =========================
// LOAD MENU
// =========================

function loadMenu() {

    fetch(API_URL + "?t=" + Date.now())

        .then(function(response) {
            return response.json();
        })

        .then(function(menuItems) {

            menuItemsContainer.innerHTML = "";

            menuItems.forEach(function(item) {

                const menuItem = document.createElement("div");
                menuItem.className = "menu-item";

                // Item details (built with textContent so special
                // characters in names can never break the page)

                const details = document.createElement("div");

                const nameEl = document.createElement("strong");
                nameEl.textContent = item.name;

                const priceEl = document.createElement("span");
                priceEl.textContent =
                    "₦" + Number(item.price).toLocaleString();

                const categoryEl = document.createElement("small");
                categoryEl.textContent = item.category;

                details.appendChild(nameEl);
                details.appendChild(document.createElement("br"));
                details.appendChild(priceEl);
                details.appendChild(document.createElement("br"));
                details.appendChild(categoryEl);

                // Buttons

                const buttons = document.createElement("div");
                buttons.style.display = "flex";
                buttons.style.gap = "10px";

                const editBtn = document.createElement("button");
                editBtn.textContent = "Edit";
                editBtn.addEventListener("click", function() {
                    editMenuItem(item.name);
                });

                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-btn";
                deleteBtn.textContent = "Delete";
                deleteBtn.addEventListener("click", function() {
                    deleteMenuItem(item.name);
                });

                buttons.appendChild(editBtn);
                buttons.appendChild(deleteBtn);

                menuItem.appendChild(details);
                menuItem.appendChild(buttons);

                menuItemsContainer.appendChild(menuItem);
            });

        })

        .catch(function(error) {

            menuItemsContainer.textContent =
                "Could not connect to the backend.";

            console.error(error);
        });
}


// =========================
// ADD / UPDATE MENU ITEM
// =========================

menuForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const item = {

        name: document.getElementById("itemName").value.trim(),

        price: Number(
            document.getElementById("itemPrice").value
        ),

        category:
            document.getElementById("itemCategory").value,

        image:
            document.getElementById("itemImage").value,

        description:
            document.getElementById("itemDescription").value
    };

    const isEditing = Boolean(editingItemName);

    // EDIT  -> PUT  /menu/:name
    // ADD   -> POST /menu

    const url = isEditing
        ? API_URL + "/menu/" + encodeURIComponent(editingItemName)
        : API_URL + "/menu";

    fetch(url, {

        method: isEditing ? "PUT" : "POST",

        headers: {
            "Content-Type": "application/json",
            "x-admin-password": adminPassword
        },

        body: JSON.stringify(item)
    })

        .then(function(response) {

            if (handleAuthFailure(response)) {
                return null;
            }

            return response.json();
        })

        .then(function(data) {

            if (!data) {
                return;
            }

            alert(data.message);

            // Only reset the form when the server accepted it

            if (data.item) {

                editingItemName = null;

                menuForm.reset();

                document.querySelector(
                    "#menuForm button"
                ).textContent = "Add Menu Item";

                loadMenu();
            }
        })

        .catch(function(error) {

            alert(
                isEditing
                    ? "Could not update menu item."
                    : "Could not add menu item."
            );

            console.error(error);
        });
});


// =========================
// EDIT MENU ITEM (fills the form)
// =========================

function editMenuItem(itemName) {

    fetch(
        API_URL +
        "/menu/" +
        encodeURIComponent(itemName)
    )

        .then(function(response) {
            return response.json();
        })

        .then(function(item) {

            editingItemName = item.name;

            document.getElementById("itemName").value =
                item.name;

            document.getElementById("itemPrice").value =
                item.price;

            document.getElementById("itemCategory").value =
                item.category;

            document.getElementById("itemImage").value =
                item.image || "";

            document.getElementById("itemDescription").value =
                item.description || "";

            document.querySelector(
                "#menuForm button"
            ).textContent = "Update Menu Item";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        })

        .catch(function(error) {

            alert("Could not load menu item.");

            console.error(error);
        });
}


// =========================
// DELETE MENU ITEM
// =========================

function deleteMenuItem(itemName) {

    const confirmed = confirm(
        "Are you sure you want to delete " +
        itemName +
        "?"
    );

    if (!confirmed) {
        return;
    }

    fetch(
        API_URL +
        "/menu/" +
        encodeURIComponent(itemName),

        {
            method: "DELETE",

            headers: {
                "x-admin-password": adminPassword
            }
        }
    )

        .then(function(response) {

            if (handleAuthFailure(response)) {
                return null;
            }

            return response.json();
        })

        .then(function(data) {

            if (!data) {
                return;
            }

            alert(data.message);

            // If the item being deleted was being edited,
            // cancel edit mode completely.

            if (editingItemName === itemName) {

                editingItemName = null;

                menuForm.reset();

                document.querySelector(
                    "#menuForm button"
                ).textContent = "Add Menu Item";
            }

            loadMenu();
        })

        .catch(function(error) {

            alert("Could not delete menu item.");

            console.error(error);
        });
}

// =========================
// START ADMIN PAGE
// =========================

checkPassword().then(function(ok) {

    if (ok) {
        loadMenu();
    }
});