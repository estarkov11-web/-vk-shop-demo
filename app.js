// VK Mini App Shop - Application Logic

// Инициализация данных товаров
const products = [
    {
        id: 1,
        name: "Наушники VK Edition",
        description: "Беспроводные наушники с шумоподавлением",
        price: 5990,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
        badge: "Хит"
    },
    {
        id: 2,
        name: "Кофемашина Mini",
        description: "Компактная кофемашина для дома и офиса",
        price: 12990,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
        badge: "New"
    },
    {
        id: 3,
        name: "Смарт-часы Pro",
        description: "Мониторинг здоровья, пульс, СО2, глубокий сон",
        price: 18990,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6a4f23?w=400&auto=format&fit=crop&q=80",
        badge: "Скидка 10%"
    },
    {
        id: 4,
        name: "Фотоаппарат Instant",
        description: "Мгновенные фотографии в стиле ретро",
        price: 15990,
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80",
        badge: "Best"
    },
    {
        id: 5,
        name: "Рюкзак Urban",
        description: "Водонепроницаемый рюкзак с USB портом",
        price: 3490,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80",
        badge: ""
    },
    {
        id: 6,
        name: "Фитнес-браслет",
        description: "14-дневный срок работы, водонепроницаемость 5 ATM",
        price: 2490,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&auto=format&fit=crop&q=80",
        badge: ""
    }
];

// Состояние корзины
let cart = [];

// Элементы DOM
let productGrid = null;
let cartPanel = null;
let cartButton = null;
let cartCount = null;
let cartCountPanel = null;
let totalPrice = null;
let checkoutButton = null;
let checkoutAmount = null;
let emptyCartButton = null;
let toastContainer = null;

// Инициализация VK Bridge
function initVKBridge() {
    if (window.vkBridge) {
        vkBridge.send('VKWebAppInit');
        console.log('VK Bridge initialized');

        vkBridge.send('VKWebAppResizeWindow', { height: document.body.scrollHeight });
        vkBridge.send('VKWebAppGetUserInfo');
    } else {
        console.warn('VK Bridge not loaded yet');
        setTimeout(initVKBridge, 500);
    }
}

// Показать уведомление
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '<i class="fa-solid fa-check-circle"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-circle-xmark"></i>';
    if (type === 'info') icon = '<i class="fa-solid fa-info-circle"></i>';

    toast.innerHTML = `${icon}<span class="flex-1">${message}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
    }, 2500);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Создание карточки товара (возвращает готовый DOM-элемент)
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);

    const badgeHtml = product.badge ?
        `<div class="product-badge" style="background: ${getBadgeColor(product.badge)}">${product.badge}</div>` : '';

    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            ${badgeHtml}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <div class="product-price">${product.price.toLocaleString('ru-RU')} ₽</div>
                <div class="product-actions">
                    <button class="btn-add" data-id="${product.id}">
                        <i class="fa-solid fa-plus"></i> В корзину
                    </button>
                </div>
            </div>
        </div>
    `;

    return card;
}

// Цвета для бейджей
function getBadgeColor(badge) {
    const colors = {
        'Хит': '#F59E0B',
        'New': '#3B82F6',
        'Скидка 10%': '#10B981',
        'Best': '#EF4444'
    };
    return colors[badge] || '#3B82F6';
}

// Отображение каталога (использует appendChild для DOM-элементов)
function renderProducts() {
    if (!productGrid) {
        console.error('productGrid не найден');
        return;
    }

    // Очищаем контейнер
    productGrid.innerHTML = '';

    if (products.length === 0) {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    }

    // Создаём и добавляем карточки через appendChild
    products.forEach(product => {
        const card = createProductCard(product);

        // Добавляем обработчик клика на карточку (для кнопок внутри)
        card.addEventListener('click', (e) => {
            // Ищем кнопку "В корзину" в кликнутом элементе
            const btn = e.target.closest('.btn-add');
            if (btn) {
                e.preventDefault();
                const productId = parseInt(btn.getAttribute('data-id'));
                addToCart(productId);
            }
        });

        productGrid.appendChild(card);
    });
}

// Добавление товара в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
        showToast('Количество обновлено', 'info');
    } else {
        cart.push({ ...product, quantity: 1 });
        showToast('Товар добавлен в корзину');
    }

    updateCartUI();
    saveCart();
}

// Удаление товара из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

// Изменение количества товара
function changeQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
    }
}

// Обновление UI корзины
function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPriceValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Обновление счетчика
    if (cartCount) cartCount.textContent = totalCount;
    if (cartCountPanel) cartCountPanel.textContent = totalCount;

    if (totalCount > 0) {
        if (cartCount) cartCount.classList.remove('opacity-0');
        if (cartPanel) {
            cartPanel.classList.remove('translate-y-full');
            cartPanel.classList.add('translate-y-0');
        }

        if (checkoutButton) {
            checkoutButton.classList.remove('hidden');
            if (checkoutAmount) checkoutAmount.textContent = totalPriceValue.toLocaleString('ru-RU');
        }

        if (emptyCartButton) emptyCartButton.classList.remove('hidden');
    } else {
        if (cartCount) cartCount.classList.add('opacity-0');
        if (cartPanel) {
            cartPanel.classList.remove('translate-y-0');
            cartPanel.classList.add('translate-y-full');
        }

        if (checkoutButton) checkoutButton.classList.add('hidden');
        if (emptyCartButton) emptyCartButton.classList.add('hidden');
    }

    // Обновление общей суммы
    if (totalPrice) totalPrice.textContent = totalPriceValue.toLocaleString('ru-RU');

    // Обновление кнопок в карточках
    document.querySelectorAll('.btn-add').forEach(btn => {
        const productId = parseInt(btn.getAttribute('data-id'));
        const inCart = cart.find(item => item.id === productId);
        if (inCart) {
            btn.innerHTML = `<i class="fa-solid fa-check"></i> В корзине`;
            btn.style.background = '#10B981';
        } else {
            btn.innerHTML = `<i class="fa-solid fa-plus"></i> В корзину`;
            btn.style.background = '#2680EB';
        }
    });
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showToast('Корзина пуста', 'error');
        return;
    }

    const orderTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderItems = cart.map(item =>
        `• ${item.name} x${item.quantity} - ${item.price.toLocaleString('ru-RU')} ₽`
    ).join('\n');

    const orderMessage = `🚀 Новый заказ!\n\n` +
        `Товаров: ${cart.reduce((sum, item) => sum + item.quantity, 0)}\n` +
        `Сумма: ${orderTotal.toLocaleString('ru-RU')} ₽\n\n` +
        `Заказ:\n${orderItems}\n\n` +
        `⭐ Спасибо за заказ!`;

    if (window.vkBridge) {
        vkBridge.send('VKWebAppShowWallPostBox', {
            message: orderMessage,
            attachments: 'photo208472431_456239032'
        }, (data) => {
            if (data.result) {
                showToast('Заказ успешно отправлен!', 'success');
                cart = [];
                updateCartUI();
                vkBridge.send('VKWebAppStorageSet', { key: 'cart', value: JSON.stringify([]) });
            } else {
                handleFallbackOrder(orderMessage);
            }
        });
    } else {
        handleFallbackOrder(orderMessage);
    }
}

// Альтернативный способ оформления заказа
function handleFallbackOrder(message) {
    const vkParams = getVKParams();

    if (vkParams && vkParams.viewer_id) {
        showToast('Отправка заказа...', 'info');

        setTimeout(() => {
            showToast('Заказ оформлен!', 'success');
            cart = [];
            updateCartUI();
        }, 1500);
    } else {
        console.log('--- ЗАКАЗ ---');
        console.log(message);
        console.log('-------------');
        showToast('Проверьте консоль для просмотра заказа', 'info');
    }
}

// Получение параметров VK
function getVKParams() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const result = {};

    for (const [key, value] of params) {
        result[key] = value;
    }

    return result;
}

// Сохранение корзины в хранилище
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Ошибка сохранения корзины:', e);
    }
}

// Очистка корзины
function clearCart() {
    if (cart.length === 0) return;

    if (confirm('Очистить корзину?')) {
        cart = [];
        updateCartUI();
        saveCart();
        showToast('Корзина очищена', 'info');
    }
}

// Загрузка корзины из хранилища
function loadCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartUI();
        }
    } catch (e) {
        console.error('Ошибка загрузки корзины:', e);
    }
}

// Инициализация при загрузке
function init() {
    // Получаем элементы DOM
    productGrid = document.getElementById('productGrid');
    cartPanel = document.getElementById('cartPanel');
    cartButton = document.getElementById('cartButton');
    cartCount = document.getElementById('cartCount');
    cartCountPanel = document.getElementById('cartCountPanel');
    totalPrice = document.getElementById('totalPrice');
    checkoutButton = document.getElementById('checkoutButton');
    checkoutAmount = document.getElementById('checkoutAmount');
    emptyCartButton = document.getElementById('emptyCartButton');
    toastContainer = document.getElementById('toastContainer');

    if (!productGrid) {
        console.error('Элемент #productGrid не найден!');
        return;
    }

    // Загрузка корзины из хранилища
    loadCart();

    // Рендер продуктов
    renderProducts();

    // Инициализация VK Bridge
    initVKBridge();

    // Обработчики событий для корзины
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            if (cart.length > 0) {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        });
    }

    if (checkoutButton) {
        checkoutButton.addEventListener('click', checkout);
    }

    if (emptyCartButton) {
        emptyCartButton.addEventListener('click', clearCart);
    }

    // Обработка ресайза окна
    if (window.vkBridge) {
        vkBridge.subscribe((event) => {
            if (event.detail && event.detail.type === 'VKWebAppUpdateConfig') {
                const palette = event.detail.data.palette;
                if (palette.text_primary) {
                    document.documentElement.style.setProperty('--vk-blue', palette.text_primary);
                }
            }
        });
    }

    console.log('Магазин VK Mini App готов к работе!');
}

// Запуск при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
