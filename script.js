/* =========================================================
   Bean & Brew Cafe - shared script
   Loaded on every page.
   ========================================================= */

const WHATSAPP_NUMBER = "2347070332678";

// Only used on the Menu page.
const MENU_API_URL = "http://localhost:3000/";

const CART_KEY = "bb_cart";
const THEME_KEY = "bb_theme";

const $ = function (id) {
    return document.getElementById(id);
};


/* =========================
   STORAGE HELPERS
========================= */

function readJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value === null || value === undefined ? fallback : value;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // Storage can be blocked - site still works
    }
}


/* =========================
   MESSAGE POPUP
========================= */

let messageTimer;

function showMessage(text) {

    const message = $("success-message");

    if (!message) return;

    message.textContent = text;
    message.style.display = "block";

    clearTimeout(messageTimer);

    messageTimer = setTimeout(function () {
        message.style.display = "none";
    }, 2000);
}


/* =========================
   ORDER / CART
========================= */

let total = 0;

let orderItems = readJSON(CART_KEY, {});

if (typeof orderItems !== "object" || Array.isArray(orderItems)) {
    orderItems = {};
}

function addToOrder(item, price) {

    if (orderItems[item]) {
        orderItems[item].quantity++;
    } else {
        orderItems[item] = {
            price: price,
            quantity: 1
        };
    }

    updateOrder();

    showMessage("✓ " + item + " added successfully!");
}

function updateOrder() {

    const orderList = $("order-list");
    const cartOrderList = $("cart-order-list");

    const totalDisplay = $("total");
    const cartTotalDisplay = $("cart-total");

    const cartCount = $("cartCount");
    const emptyCart = $("emptyCart");

    if (orderList) {
        orderList.innerHTML = "";
    }

    if (cartOrderList) {
        cartOrderList.innerHTML = "";
    }

    total = 0;

    let itemCount = 0;

    for (const item in orderItems) {

        const order = orderItems[item];

        const itemTotal = order.price * order.quantity;

        total += itemTotal;
        itemCount += order.quantity;

        const orderItem = document.createElement("li");

        orderItem.innerHTML = `
            <div>
                <strong>${item}</strong>
                <br>
                <small>₦${order.price.toLocaleString()} each</small>
            </div>

            <div class="quantity-controls">

                <button onclick="decreaseQuantity('${item}')">
                    −
                </button>

                <span>${order.quantity}</span>

                <button onclick="increaseQuantity('${item}')">
                    +
                </button>

            </div>
        `;

        if (orderList) {
            orderList.appendChild(orderItem.cloneNode(true));
        }

        if (cartOrderList) {
            cartOrderList.appendChild(orderItem);
        }
    }

    if (totalDisplay) {
        totalDisplay.textContent = "₦" + total.toLocaleString();
    }

    if (cartTotalDisplay) {
        cartTotalDisplay.textContent = "₦" + total.toLocaleString();
    }

    if (cartCount) {
        cartCount.textContent = itemCount;
    }

    if (emptyCart) {
        emptyCart.style.display =
            itemCount === 0 ? "block" : "none";
    }

    writeStorage(CART_KEY, JSON.stringify(orderItems));
}

function increaseQuantity(item) {

    if (orderItems[item]) {
        orderItems[item].quantity++;
        updateOrder();
    }
}

function decreaseQuantity(item) {

    if (orderItems[item]) {

        orderItems[item].quantity--;

        if (orderItems[item].quantity <= 0) {
            delete orderItems[item];
        }

        updateOrder();
    }
}

function clearOrder() {

    orderItems = {};
    total = 0;

    updateOrder();

    showMessage("Cart cleared");
}

function orderOnWhatsApp() {

    if (Object.keys(orderItems).length === 0) {
        showMessage("Your cart is empty!");
        return;
    }

    let message =
        "Hello Bean & Brew Cafe! ☕\n\n";

    message +=
        "I would like to place the following order:\n\n";

    for (const item in orderItems) {

        const order = orderItems[item];

        const itemTotal =
            order.price * order.quantity;

        message +=
            item +
            " x " +
            order.quantity +
            " - ₦" +
            itemTotal.toLocaleString() +
            "\n";
    }

    message +=
        "\nTotal: ₦" +
        total.toLocaleString();

    const whatsappURL =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    window.open(whatsappURL, "_blank");
}

updateOrder();


/* =========================
   MENU SEARCH
========================= */

const searchInput = $("menuSearch");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchText =
            this.value.toLowerCase().trim();

        document
            .querySelectorAll(".menu-item")
            .forEach(function (item) {

                const itemText =
                    item.textContent.toLowerCase();

                const category =
                    item.dataset.category || "";

                if (
                    itemText.includes(searchText) ||
                    category.includes(searchText)
                ) {
                    item.style.display = "";
                } else {
                    item.style.display = "none";
                }

            });

    });
}


/* =========================
   CUSTOMER REVIEWS
========================= */

const reviews = [

    {
        text: "The coffee was amazing and the atmosphere was so relaxing!",
        name: "— Happy Customer"
    },

    {
        text: "Bean & Brew has become my favorite place to enjoy a good cup of coffee.",
        name: "— Sarah"
    },

    {
        text: "Great coffee, friendly service, and a beautiful atmosphere. I loved it!",
        name: "— Daniel"
    },

    {
        text: "The Latte was delicious and the service was excellent.",
        name: "— Amanda"
    }

];

let currentReview = 0;

const reviewText = $("reviewText");
const reviewName = $("reviewName");
const nextReviewButton = $("nextReview");
const previousReviewButton = $("previousReview");

function showReview() {

    if (!reviewText || !reviewName) return;

    reviewText.textContent =
        `"${reviews[currentReview].text}"`;

    reviewName.textContent =
        reviews[currentReview].name;
}

if (
    reviewText &&
    reviewName &&
    nextReviewButton &&
    previousReviewButton
) {

    nextReviewButton.addEventListener("click", function () {

        currentReview++;

        if (currentReview >= reviews.length) {
            currentReview = 0;
        }

        showReview();
    });

    previousReviewButton.addEventListener("click", function () {

        currentReview--;

        if (currentReview < 0) {
            currentReview = reviews.length - 1;
        }

        showReview();
    });

}

function claimOffer(offerName) {
    showMessage(offerName + " offer selected!");
}


/* =========================
   DARK MODE
========================= */

const darkModeToggle = $("darkModeToggle");

function applyTheme(isDark) {

    document.body.classList.toggle(
        "dark-mode",
        isDark
    );

    if (darkModeToggle) {

        darkModeToggle.textContent =
            isDark
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";
    }
}

applyTheme(
    readJSON(THEME_KEY, "light") === "dark"
);

if (darkModeToggle) {

    darkModeToggle.addEventListener(
        "click",
        function () {

            const isDark =
                !document.body.classList.contains(
                    "dark-mode"
                );

            applyTheme(isDark);

            writeStorage(
                THEME_KEY,
                JSON.stringify(
                    isDark ? "dark" : "light"
                )
            );

        }
    );
}


/* =========================
   SCROLL ANIMATION
========================= */

const animatedElements =
    document.querySelectorAll(".scroll-animate");

function checkScroll() {

    animatedElements.forEach(function (element) {

        const elementTop =
            element.getBoundingClientRect().top;

        const windowHeight =
            window.innerHeight;

        if (elementTop < windowHeight - 100) {
            element.classList.add("show");
        }

    });
}

window.addEventListener(
    "scroll",
    checkScroll
);

checkScroll();


/* =========================
   FAVORITE DRINKS
========================= */

let favorites =
    readJSON("favorites", []);

if (!Array.isArray(favorites)) {
    favorites = [];
}

function toggleFavorite(item, button) {

    if (favorites.includes(item)) {

        favorites =
            favorites.filter(function (favorite) {
                return favorite !== item;
            });

        button.textContent = "♡";
        button.classList.remove("active");

    } else {

        favorites.push(item);

        button.textContent = "♥";
        button.classList.add("active");
    }

    writeStorage(
        "favorites",
        JSON.stringify(favorites)
    );

    displayFavorites();
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const favoriteButtons =
            document.querySelectorAll(
                ".favorite-btn"
            );

        favoriteButtons.forEach(
            function (button) {

                const match =
                    (
                        button.getAttribute(
                            "onclick"
                        ) || ""
                    ).match(/'([^']+)'/);

                if (
                    match &&
                    favorites.includes(match[1])
                ) {

                    button.textContent = "♥";

                    button.classList.add(
                        "active"
                    );
                }

            }
        );

        displayFavorites();
    }
);

function displayFavorites() {

    const favoritesList =
        $("favoritesList");

    const noFavorites =
        $("noFavorites");

    if (!favoritesList) {
        return;
    }

    favoritesList.innerHTML = "";

    if (favorites.length === 0) {

        if (noFavorites) {
            favoritesList.appendChild(
                noFavorites
            );
        }

        return;
    }

    favorites.forEach(function (item) {

        const card =
            document.createElement("div");

        card.className =
            "favorite-card";

        card.innerHTML = `
            <h3>${item}</h3>

            <button
                class="remove-favorite"
                onclick="removeFavorite('${item}')"
            >
                Remove ❤️
            </button>
        `;

        favoritesList.appendChild(card);
    });
}

function removeFavorite(item) {

    favorites =
        favorites.filter(function (favorite) {
            return favorite !== item;
        });

    writeStorage(
        "favorites",
        JSON.stringify(favorites)
    );

    displayFavorites();
}


/* =========================
   SHOPPING CART DRAWER
========================= */

const cartButton = $("cartButton");
const shoppingCart = $("shoppingCart");
const cartOverlay = $("cartOverlay");
const closeCartButton = $("closeCart");

if (
    cartButton &&
    shoppingCart &&
    cartOverlay &&
    closeCartButton
) {

    cartButton.addEventListener(
        "click",
        function () {

            shoppingCart.classList.add(
                "active"
            );

            cartOverlay.classList.add(
                "active"
            );
        }
    );

    closeCartButton.addEventListener(
        "click",
        function () {

            shoppingCart.classList.remove(
                "active"
            );

            cartOverlay.classList.remove(
                "active"
            );
        }
    );

    cartOverlay.addEventListener(
        "click",
        function () {

            shoppingCart.classList.remove(
                "active"
            );

            cartOverlay.classList.remove(
                "active"
            );
        }
    );
}


/* =========================
   CHECKOUT + RECEIPT
========================= */

function openCheckout() {

    const checkoutModal =
        $("checkoutModal");

    if (!checkoutModal) {
        return;
    }

    if (
        Object.keys(orderItems).length === 0
    ) {
        showMessage(
            "Your cart is empty!"
        );

        return;
    }

    checkoutModal.style.display = "flex";
}

function closeCheckout() {

    const checkoutModal =
        $("checkoutModal");

    if (checkoutModal) {
        checkoutModal.style.display =
            "none";
    }
}

/* ---------------------------------
   Checkout error box (stays visible
   until the customer tries again)
--------------------------------- */

function showCheckoutError(text) {

    let box = $("checkoutError");

    if (!box) {

        box = document.createElement("p");

        box.id = "checkoutError";

        box.setAttribute("role", "alert");

        box.style.cssText =
            "background:#fdecea;" +
            "color:#b00020;" +
            "border:1px solid #f5c2c0;" +
            "padding:10px 12px;" +
            "border-radius:8px;" +
            "margin:10px 0;" +
            "font-size:0.95rem;" +
            "line-height:1.4;";

        const button =
            document.querySelector(
                ".place-order-btn"
            );

        if (button && button.parentNode) {
            button.parentNode.insertBefore(
                box,
                button
            );
        } else {
            document.body.appendChild(box);
        }
    }

    box.textContent = text;
    box.style.display = "block";
}

function hideCheckoutError() {

    const box = $("checkoutError");

    if (box) {
        box.style.display = "none";
    }
}

async function placeDemoOrder() {

    hideCheckoutError();

    const name =
        $("customerName").value.trim();

    const phone =
        $("customerPhone").value.trim();

    const orderType =
        $("orderType").value;

    const note =
        $("orderNote").value.trim();

    if (
        name === "" ||
        phone === "" ||
        orderType === ""
    ) {

        showCheckoutError(
            "Please complete your details."
        );

        return;
    }

    if (
        Object.keys(orderItems).length === 0
    ) {

        showMessage(
            "Your cart is empty!"
        );

        return;
    }

    // No connection at all: stop immediately.

    if (navigator.onLine === false) {

        showCheckoutError(
            "Error checking out: you are offline. " +
            "Your order was NOT placed. " +
            "Please reconnect and try again."
        );

        return;
    }

    const placeOrderButton =
        document.querySelector(
            ".place-order-btn"
        );

    if (placeOrderButton) {

        placeOrderButton.disabled =
            true;

        placeOrderButton.textContent =
            "Placing order...";
    }

    // Give up after 7 seconds so the customer is
    // never left waiting on a dead connection.

    const controller =
        new AbortController();

    const timeout =
        setTimeout(function () {
            controller.abort();
        }, 70000);

    try {

        const response =
            await fetch(
                MENU_API_URL +
                "api/orders",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        customer: {
                            name,
                            phone,
                            orderType,
                            note
                        },
                        items: orderItems
                    }),

                    signal: controller.signal
                }
            );

        let result = {};

        try {
            result =
                await response.json();
        } catch (parseError) {
            result = {};
        }

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Error checking out. " +
                "Your order was NOT placed. " +
                "Please try again."
            );
        }

        // A real order always has an order number.
        // If it is missing, treat it as a failure.

        if (!result.orderNumber) {
            throw new Error(
                "Error checking out. " +
                "Your order was NOT placed. " +
                "Please try again."
            );
        }

        // ---------- SUCCESS ----------
        // The cart is only cleared from here down.

        $("receiptOrderNumber")
            .textContent =
            result.orderNumber;

        $("receiptDate")
            .textContent =
            new Date(
                result.createdAt
            ).toLocaleString();

        $("receiptCustomer")
            .textContent = name;

        $("receiptOrderType")
            .textContent = orderType;

        const receiptItems =
            $("receiptItems");

        receiptItems.innerHTML = "";

        result.items.forEach(
            function (item) {

                const receiptItem =
                    document.createElement(
                        "p"
                    );

                receiptItem.textContent =
                    `${item.quantity} × ${item.name} — ₦${(
                        item.price *
                        item.quantity
                    ).toLocaleString()}`;

                receiptItems.appendChild(
                    receiptItem
                );
            }
        );

        $("receiptTotal")
            .textContent =
            "₦" +
            Number(result.total)
                .toLocaleString();

        closeCheckout();

        $("receiptModal").style.display =
            "flex";

        clearOrder();

        $("customerName").value = "";
        $("customerPhone").value = "";
        $("orderType").value = "";
        $("orderNote").value = "";

    } catch (error) {

        console.error(
            "Checkout failed:",
            error
        );

        // The cart is NOT cleared, so nothing is lost.

        if (error.name === "AbortError") {

            showCheckoutError(
                "Error checking out: the connection is too slow " +
                "or has been lost. Your order was NOT placed. " +
                "Please try again."
            );

        } else if (error instanceof TypeError) {

            // fetch() throws a TypeError when the
            // network is down or the server is unreachable.

            showCheckoutError(
                "Error checking out: no stable connection. " +
                "Your order was NOT placed. " +
                "Please check your internet and try again."
            );

        } else {

            showCheckoutError(
                error.message
            );
        }

    } finally {

        clearTimeout(timeout);

        if (placeOrderButton) {

            placeOrderButton.disabled =
                false;

            placeOrderButton.textContent =
                "Place Order";
        }
    }
}

function closeReceipt() {

    const receiptModal =
        $("receiptModal");

    if (receiptModal) {
        receiptModal.style.display =
            "none";
    }
}


/* =========================
   LOAD MENU FROM BACKEND
========================= */

if ($("menuContainer")) {

    fetch(
        MENU_API_URL +
        "?t=" +
        Date.now()
    )

        .then(function (response) {

            if (!response.ok) {
                throw new Error(
                    "Could not load menu items."
                );
            }

            return response.json();
        })

        .then(function (items) {

            const menuContainer =
                $("menuContainer");

            if (!menuContainer) {
                return;
            }

            const drinksHeading =
                $("drinks");

            menuContainer
                .querySelectorAll(
                    ".menu-item"
                )
                .forEach(function (card) {
                    card.remove();
                });

            const drinkNames =
                new Set([
                    "fresh fruit juice",
                    "iced tea",
                    "mango smothie",
                    "mango smoothie",
                    "strawberry smothie",
                    "strawberry smoothie",
                    "fresh lemonade",
                    "chocolate milshake",
                    "chocolate milkshake"
                ]);

            const favoriteMenuItems =
                new Set([
                    "Latte",
                    "Fresh Fruit Juice"
                ]);

            const drinkItems =
                items.filter(function (item) {

                    const name =
                        String(
                            item.name || ""
                        ).toLowerCase();

                    const category =
                        String(
                            item.category || ""
                        ).toLowerCase();

                    return (
                        drinkNames.has(name) ||
                        [
                            "juice",
                            "tea",
                            "smoothie",
                            "milkshake",
                            "drink"
                        ].includes(category)
                    );
                });

            const coffeeItems =
                items.filter(function (item) {

                    const name =
                        String(
                            item.name || ""
                        ).toLowerCase();

                    const category =
                        String(
                            item.category || ""
                        ).toLowerCase();

                    return (
                        category === "coffee" &&
                        !drinkNames.has(name)
                    );
                });

            function createMenuCard(item) {

                const card =
                    document.createElement(
                        "div"
                    );

                const canFavorite =
                    favoriteMenuItems.has(
                        item.name
                    );

                card.className =
                    "menu-item";

                card.dataset.category =
                    item.category || "other";

                card.innerHTML = `
                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                    <div>
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                    </div>

                    <div class="price-btn">

                        <span>
                            ₦${Number(
                                item.price
                            ).toLocaleString()}
                        </span>

                        ${
                            canFavorite
                                ? `
                                    <button
                                        type="button"
                                        class="favorite-btn"
                                    >
                                        ${
                                            favorites.includes(
                                                item.name
                                            )
                                                ? "♥"
                                                : "♡"
                                        }
                                    </button>
                                  `
                                : ""
                        }

                        <button
                            type="button"
                            class="order-btn"
                        >
                            Add to Order
                        </button>

                    </div>
                `;

                card
                    .querySelector(
                        ".order-btn"
                    )
                    .addEventListener(
                        "click",
                        function () {

                            addToOrder(
                                item.name,
                                Number(item.price)
                            );
                        }
                    );

                const favoriteButton =
                    card.querySelector(
                        ".favorite-btn"
                    );

                if (favoriteButton) {

                    favoriteButton.addEventListener(
                        "click",
                        function () {

                            toggleFavorite(
                                item.name,
                                favoriteButton
                            );
                        }
                    );
                }

                return card;
            }

            coffeeItems.forEach(
                function (item) {

                    const card =
                        createMenuCard(item);

                    if (drinksHeading) {

                        menuContainer.insertBefore(
                            card,
                            drinksHeading
                        );

                    } else {

                        menuContainer.appendChild(
                            card
                        );
                    }
                }
            );

            if (drinksHeading) {
                menuContainer.appendChild(
                    drinksHeading
                );
            }

            drinkItems.forEach(
                function (item) {

                    menuContainer.appendChild(
                        createMenuCard(item)
                    );
                }
            );

            console.log(
                "Menu loaded from backend:",
                items
            );
        })

        .catch(function (error) {

            console.error(
                "Backend connection failed:",
                error
            );
        });
}


/* =========================
   GALLERY LIGHTBOX
========================= */

const lightboxOverlay =
    $("lightboxOverlay");

const lightboxImage =
    $("lightboxImage");

const closeLightboxButton =
    $("closeLightbox");

function openLightbox(item) {

    if (
        !lightboxOverlay ||
        !lightboxImage
    ) {
        return;
    }

    const img =
        item.querySelector("img");

    if (!img) return;

    lightboxImage.src =
        img.src;

    lightboxImage.alt =
        img.alt;

    lightboxOverlay.classList.add(
        "active"
    );
}

function closeLightbox() {

    if (
        !lightboxOverlay ||
        !lightboxImage
    ) {
        return;
    }

    lightboxOverlay.classList.remove(
        "active"
    );

    lightboxImage.src = "";
}

if (closeLightboxButton) {

    closeLightboxButton.addEventListener(
        "click",
        closeLightbox
    );
}

if (lightboxOverlay) {

    lightboxOverlay.addEventListener(
        "click",
        function (e) {

            if (
                e.target ===
                lightboxOverlay
            ) {
                closeLightbox();
            }
        }
    );
}


/* =========================
   FAQ ACCORDION
========================= */

function toggleFaq(button) {

    const item =
        button.closest(".faq-item");

    if (!item) return;

    const answer =
        item.querySelector(
            ".faq-answer"
        );

    const wasOpen =
        item.classList.contains(
            "open"
        );

    document
        .querySelectorAll(
            ".faq-item.open"
        )
        .forEach(
            function (openItem) {

                if (
                    openItem !== item
                ) {

                    openItem.classList.remove(
                        "open"
                    );

                    openItem
                        .querySelector(
                            ".faq-answer"
                        )
                        .style.maxHeight =
                        null;
                }
            }
        );

    if (wasOpen) {

        item.classList.remove(
            "open"
        );

        answer.style.maxHeight =
            null;

    } else {

        item.classList.add(
            "open"
        );

        answer.style.maxHeight =
            answer.scrollHeight +
            "px";
    }
}


/* =========================
   TABLE RESERVATION
========================= */

const reservationForm =
    $("reservationForm");

if (reservationForm) {

    reservationForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();

            const errorBox =
                $("reservationError");

            const name =
                $("resName").value.trim();

            const phone =
                $("resPhone").value.trim();

            const date =
                $("resDate").value;

            const time =
                $("resTime").value;

            const guests =
                $("resGuests").value;

            const note =
                $("resNote").value.trim();

            if (
                !name ||
                !phone ||
                !date ||
                !time ||
                !guests
            ) {

                if (errorBox) {

                    errorBox.textContent =
                        "Please fill in all required fields.";

                    errorBox.style.display =
                        "block";
                }

                return;
            }

            if (errorBox) {
                errorBox.style.display =
                    "none";
            }

            const formattedDate =
                new Date(
                    date + "T00:00:00"
                ).toLocaleDateString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );

            let message =
                "Hello Bean & Brew Cafe! I'd like to reserve a table.\n\n";

            message +=
                "Name: " + name + "\n";

            message +=
                "Phone: " + phone + "\n";

            message +=
                "Date: " +
                formattedDate +
                "\n";

            message +=
                "Time: " +
                time +
                "\n";

            message +=
                "Guests: " +
                guests +
                "\n";

            if (note) {
                message +=
                    "Note: " +
                    note +
                    "\n";
            }

            const whatsappURL =
                "https://wa.me/" +
                WHATSAPP_NUMBER +
                "?text=" +
                encodeURIComponent(
                    message
                );

            window.open(
                whatsappURL,
                "_blank"
            );

            reservationForm.reset();

            showMessage(
                "Reservation details ready to send on WhatsApp"
            );
        }
    );
}


/* =========================
   TODAY'S SPECIAL
========================= */

function orderTodaySpecial() {

    addToOrder(
        "Chocolate Mocha",
        3500
    );

    const orderSection =
        document.getElementById(
            "order"
        );

    if (orderSection) {

        orderSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* =========================
   OPENING STATUS
========================= */

function updateOpenStatus() {

    const status =
        document.getElementById(
            "openStatus"
        );

    if (!status) return;

    const lagosTime =
        new Date(
            new Date().toLocaleString(
                "en-US",
                {
                    timeZone:
                        "Africa/Lagos"
                }
            )
        );

    const day =
        lagosTime.getDay();

    const currentMinutes =
        lagosTime.getHours() * 60 +
        lagosTime.getMinutes();

    const isWeekend =
        day === 0 ||
        day === 6;

    const openingTime =
        isWeekend
            ? 9 * 60
            : 8 * 60;

    const closingTime =
        isWeekend
            ? 21 * 60
            : 20 * 60;

    const closingLabel =
        isWeekend
            ? "9:00 PM"
            : "8:00 PM";

    const isOpen =
        currentMinutes >=
            openingTime &&
        currentMinutes <
            closingTime;

    status.textContent =
        isOpen
            ? `● Open now · Closes at ${closingLabel}`
            : `● Closed now · Opens at ${
                isWeekend
                    ? "9:00 AM"
                    : "8:00 AM"
              }`;

    status.classList.toggle(
        "is-open",
        isOpen
    );

    status.classList.toggle(
        "is-closed",
        !isOpen
    );
}

updateOpenStatus();


/* =========================
   BACK TO TOP
========================= */

const backToTop =
    document.getElementById(
        "backToTop"
    );

if (backToTop) {

    window.addEventListener(
        "scroll",
        () => {

            backToTop.classList.toggle(
                "visible",
                window.scrollY > 400
            );
        }
    );

    backToTop.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );
}


/* =========================================================
   PROFESSIONAL NAVIGATION
   ========================================================= */


/* -----------------------------------------
   ACTIVE NAVIGATION
----------------------------------------- */

function updateActiveNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";

    const currentHash =
        window.location.hash;

    /* Normal top-level links */

    document
        .querySelectorAll(
            ".nav-links > a"
        )
        .forEach(function (link) {

            const linkUrl =
                new URL(
                    link.href,
                    window.location.href
                );

            const linkPage =
                linkUrl.pathname
                    .split("/")
                    .pop() ||
                "index.html";

            let isActive = false;

            if (
                linkPage ===
                currentPage
            ) {

                if (linkUrl.hash) {

                    isActive =
                        linkUrl.hash ===
                        currentHash;

                } else {

                    isActive =
                        !currentHash;
                }
            }

            link.classList.toggle(
                "active",
                isActive
            );
        });


    /* -------------------------------------
       About dropdown
    ------------------------------------- */

    const aboutLink =
        document.querySelector(
            '.dropdown-menu a[href="about.html"]'
        );

    const aboutDropdown =
        aboutLink
            ? aboutLink.closest(
                ".nav-dropdown"
              )
            : null;

    if (aboutDropdown) {

        const isAboutPage =
            currentPage ===
            "about.html";

        const aboutButton =
            aboutDropdown.querySelector(
                ".dropdown-toggle"
            );

        if (aboutButton) {

            aboutButton.classList.toggle(
                "active",
                isAboutPage
            );
        }
    }


    /* -------------------------------------
       Visit Us dropdown
    ------------------------------------- */

    const visitDropdown =
        document.querySelector(
            ".nav-dropdown:nth-of-type(2)"
        );

    if (visitDropdown) {

        const isReservationPage =
            currentPage ===
            "reservation.html";

        const visitButton =
            visitDropdown.querySelector(
                ".dropdown-toggle"
            );

        if (visitButton) {

            visitButton.classList.toggle(
                "active",
                isReservationPage
            );
        }
    }
}

updateActiveNavigation();

window.addEventListener(
    "hashchange",
    updateActiveNavigation
);


/* =========================================================
   MOBILE MENU
   ========================================================= */

const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const navLinks =
    document.getElementById(
        "navLinks"
    );


function closeMobileMenu() {

    if (!menuToggle || !navLinks) {
        return;
    }

    navLinks.classList.remove(
        "open"
    );

    menuToggle.textContent =
        "☰";

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
    );
}


if (
    menuToggle &&
    navLinks
) {

    menuToggle.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            const isOpen =
                navLinks.classList.toggle(
                    "open"
                );

            menuToggle.textContent =
                isOpen
                    ? "×"
                    : "☰";

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );
        }
    );


    /* Close when a normal navigation link is clicked */

    navLinks
        .querySelectorAll(
            ":scope > a"
        )
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function () {

                    closeMobileMenu();
                }
            );
        });
}


/* =========================================================
   DROPDOWN NAVIGATION
   ========================================================= */

const dropdownToggles =
    document.querySelectorAll(
        ".dropdown-toggle"
    );


dropdownToggles.forEach(
    function (toggle) {

        toggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                const dropdown =
                    toggle.closest(
                        ".nav-dropdown"
                    );

                if (!dropdown) {
                    return;
                }


                /* Close other dropdowns */

                document
                    .querySelectorAll(
                        ".nav-dropdown.open"
                    )
                    .forEach(
                        function (item) {

                            if (
                                item !==
                                dropdown
                            ) {

                                item.classList.remove(
                                    "open"
                                );
                            }
                        }
                    );


                /* Toggle selected dropdown */

                dropdown.classList.toggle(
                    "open"
                );
            }
        );
    }
);


/* -----------------------------------------
   Dropdown links
----------------------------------------- */

document
    .querySelectorAll(
        ".dropdown-menu a"
    )
    .forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(
                        ".nav-dropdown.open"
                    )
                    .forEach(
                        function (dropdown) {

                            dropdown.classList.remove(
                                "open"
                            );
                        }
                    );

                closeMobileMenu();
            }
        );
    });


/* -----------------------------------------
   Close dropdown when clicking elsewhere
----------------------------------------- */

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".nav-dropdown"
            )
        ) {

            document
                .querySelectorAll(
                    ".nav-dropdown.open"
                )
                .forEach(
                    function (dropdown) {

                        dropdown.classList.remove(
                            "open"
                        );
                    }
                );
        }
    }
);


/* =========================================================
   RESERVATION DATE / TIME LIMITS
   ========================================================= */

const reservationDate =
    document.getElementById(
        "resDate"
    );

const reservationTime =
    document.getElementById(
        "resTime"
    );

function setReservationLimits() {

    if (
        !reservationDate ||
        !reservationTime
    ) {
        return;
    }

    const today =
        new Date();

    const todayText =
        today.toISOString()
            .split("T")[0];

    reservationDate.min =
        todayText;

    if (!reservationDate.value) {
        return;
    }

    const selectedDate =
        new Date(
            `${reservationDate.value}T00:00:00`
        );

    const day =
        selectedDate.getDay();

    const isWeekend =
        day === 0 ||
        day === 6;

    reservationTime.min =
        isWeekend
            ? "09:00"
            : "08:00";

    reservationTime.max =
        isWeekend
            ? "21:00"
            : "20:00";
}

if (reservationDate) {

    reservationDate.addEventListener(
        "change",
        setReservationLimits
    );

    setReservationLimits();
}