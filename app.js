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
const productGrid = document.getElementById('productGrid');
const cartPanel = document.getElementById('cartPanel');
const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');
const cartCountPanel = document.getElementById('cartCountPanel');
const totalPrice = document.getElementById('totalPrice');
const checkoutButton = document.getElementById('checkoutButton');
const checkoutAmount = document.getElementById('checkoutAmount');
const emptyCartButton = document.getElementById('emptyCartButton');
const toastContainer = document.getElementById('toastContainer');

// Инициализация VK Bridge
function initVKBridge() {
    if (window.vkBridge) {
        vkBridge.send('VKWebAppInit');
        console.log('VK Bridge initialized');

        // Проверка расширения приложения
        vkBridge.send('VKWebAppResizeWindow', { height: document.body.scrollHeight });

        // Получение параметров авторизации (если нужно)
        vkBridge.send('VKWebAppGetUserInfo');
    } else {
        console.warn('VK Bridge not loaded yet');
        // Задержанная попытка инициализации
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

    toast.innerHTML = `
        ${icon}
        <span class="flex-1">${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Анимация показа
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
    }, 2500);

    // Удаление элемента
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Создание карточки товара
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            ${product.badge ? `<div class="product-badge" style="background: ${getBadgeColor(product.badge)}">${product.badge}</div>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <div class="product-price">${product.price.toLocaleString('ru-RU')} ₽</div>
                <div class="product-actions">
                    <button class="btn-add" onclick="addToCart(${product.id})">
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

// Отображение каталога
function renderProducts() {
    productGrid.innerHTML = '';
    products.forEach(product => {
        productGrid.appendChild(createProductCard(product));
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

    // Показать карусель с товарами
    if (window.vkBridge) {
        vkBridge.send('VKWebAppStorageSet', { key: 'cart', value: JSON.stringify(cart) });
    }
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
    cartCount.textContent = totalCount;
    cartCountPanel.textContent = totalCount;

    if (totalCount > 0) {
        cartCount.classList.remove('opacity-0');
        cartPanel.classList.remove('translate-y-full');
        cartPanel.classList.add('translate-y-0');

        // Показать кнопку оформления
        checkoutButton.classList.remove('hidden');
        checkoutAmount.textContent = totalPriceValue.toLocaleString('ru-RU');

        // Показать кнопку очистки
        emptyCartButton.classList.remove('hidden');
    } else {
        cartCount.classList.add('opacity-0');
        cartPanel.classList.remove('translate-y-0');
        cartPanel.classList.add('translate-y-full');

        // Скрыть кнопки
        checkoutButton.classList.add('hidden');
        emptyCartButton.classList.add('hidden');
    }

    // Обновление общей суммы
    totalPrice.textContent = totalPriceValue.toLocaleString('ru-RU');

    // Обновление кнопок в карточках
    document.querySelectorAll('.btn-add').forEach(btn => {
        const productId = parseInt(btn.getAttribute('onclick').match(/\d+/)[0]);
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

    // Формирование сообщения заказа
    const orderItems = cart.map(item =>
        `• ${item.name} x${item.quantity} - ${item.price.toLocaleString('ru-RU')} ₽`
    ).join('\n');

    const orderMessage = `🚀 Новый заказ!\n\n` +
        `Товаров: ${cart.reduce((sum, item) => sum + item.quantity, 0)}\n` +
        `Сумма: ${orderTotal.toLocaleString('ru-RU')} ₽\n\n` +
        `Заказ:\n${orderItems}\n\n` +
        `⭐ Спасибо за заказ!`;

    // Отправка через VK Bridge
    if (window.vkBridge) {
        // Попытка использовать VKWebAppShowWallPostBox
        vkBridge.send('VKWebAppShowWallPostBox', {
            message: orderMessage,
            attachments: 'photo208472431_456239032'
        }, (data) => {
            if (data.result) {
                showToast('Заказ успешно отправлен!', 'success');
                cart = [];
                updateCartUI();

                // Сохранение в хранилище
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
    // Проверка, запущено ли в VK
    const vkParams = getVKParams();

    if (vkParams && vkParams.viewer_id) {
        // В VK - показываем диалог
        showToast('Отправка заказа...', 'info');

        setTimeout(() => {
            showToast('Заказ оформлен!', 'success');
            cart = [];
            updateCartUI();
        }, 1500);
    } else {
        // В браузере - показываем консоль
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

// Очистка корзины
function clearCart() {
    if (cart.length === 0) return;

    if (confirm('Очистить корзину?')) {
        cart = [];
        updateCartUI();
        showToast('Корзина очищена', 'info');
    }
}

// Загрузка корзины из хранилища
function loadCart() {
    if (window.vkBridge) {
        vkBridge.send('VKWebAppStorageGet', { keys: ['cart'] }, (data) => {
            if (data.results && data.results[0]) {
                try {
                    cart = JSON.parse(data.results[0]);
                    updateCartUI();
                } catch (e) {
                    console.error('Ошибка загрузки корзины:', e);
                }
            }
        });
    }
}

// Инициализация при загрузке
function init() {
    // Загрузка корзины из хранилища
    loadCart();

    // Рендер продуктов
    renderProducts();

    // Инициализация VK Bridge
    initVKBridge();

    // Обработчики событий
    cartButton.addEventListener('click', () => {
        if (cart.length > 0) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    });

    checkoutButton.addEventListener('click', checkout);
    emptyCartButton.addEventListener('click', clearCart);

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
