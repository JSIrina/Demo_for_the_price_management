// Глобални променливи и данни
const app = {
  products: [
    {
      id: 1,
      name: "Лаптоп HP Pavilion",
      basePrice: 1599.99,
      description: '15.6", Intel i7, 16GB RAM',
    },
    {
      id: 2,
      name: "Смартфон Samsung Galaxy S23",
      basePrice: 1299.0,
      description: '6.1", 128GB, 5G',
    },
    {
      id: 3,
      name: "Таблет iPad Air",
      basePrice: 899.0,
      description: '10.9", M1 чип, 64GB',
    },
    {
      id: 4,
      name: 'Монитор Dell 27"',
      basePrice: 349.99,
      description: "QHD, 144Hz, IPS",
    },
    {
      id: 5,
      name: "Безжични слушалки Sony WH-1000XM5",
      basePrice: 449.0,
      description: "Шумозаглушаващи",
    },
  ],

  customers: [
    {
      id: 1,
      name: "ТехноМаркет ООД",
      type: "vip",
      status: "active",
      email: "office@technomarket.bg",
      phone: "02 123 4567",
      contactPerson: "Иван Петров",
      address: "Бул. България 123, София",
    },
    {
      id: 2,
      name: "Електроникс ЕООД",
      type: "standard",
      status: "active",
      email: "sales@electronics.bg",
      phone: "032 765 432",
      contactPerson: "Мария Иванова",
      address: "ул. Електронна 45, Пловдив",
    },
    {
      id: 3,
      name: "Голям Дистрибутор АД",
      type: "gold",
      status: "active",
      email: "info@golddistributor.com",
      phone: "052 555 777",
      contactPerson: "Екип продажби",
      address: "Бул. Цар Освободител 1, Варна",
    },
    {
      id: 4,
      name: "Онлайн Магазин БГ",
      type: "standard",
      status: "inactive",
      email: "contact@onlinestore.bg",
      phone: "0888 123 456",
      contactPerson: "Георги Димитров",
      address: "Онлайн магазин",
    },
  ],

  customerPrices: {
    1: { 1: 1499.99, 3: 1679.99 },
    2: { 2: 1199.0, 4: 1349.0 },
    3: { 1: 849.0 },
  },

  currentState: {
    sort: { column: "name", direction: "asc" },
    productId: null,
    customerId: null,
  },

  // Помощни функции
  helpers: {
    calculatePrice(basePrice, markup) {
      return basePrice * (1 + markup / 100);
    },

    formatPrice(price) {
      return price.toFixed(2) + " лв.";
    },

    calculatePriceDiff(basePrice, currentPrice) {
      const diff = ((currentPrice - basePrice) / basePrice) * 100;
      return diff.toFixed(1) + "%";
    },

    showToast(message) {
      const toastEl = document.getElementById("successToast");
      const toastMessage = document.getElementById("toastMessage");

      if (toastEl && toastMessage) {
        toastMessage.textContent = message;
        new bootstrap.Toast(toastEl).show();
      }
    },

    getCustomerBadgeClass(type) {
      switch (type) {
        case "vip":
          return "bg-primary";
        case "gold":
          return "bg-warning text-dark";
        case "platinum":
          return "bg-secondary";
        default:
          return "bg-info";
      }
    },

    getCustomerTypeName(type) {
      switch (type) {
        case "vip":
          return "VIP";
        case "gold":
          return "Златен";
        case "platinum":
          return "Платинен";
        default:
          return "Стандартен";
      }
    },
  },

  // Функции за продукти
  productsModule: {
    populateTable(filter = "") {
      const tableBody = document.getElementById("productsTable");
      if (!tableBody) return;

      tableBody.innerHTML = "";

      // Филтриране и сортиране
      let filteredProducts = app.products.filter(
        (product) =>
          product.name.toLowerCase().includes(filter.toLowerCase()) ||
          product.description.toLowerCase().includes(filter.toLowerCase())
      );

      filteredProducts.sort((a, b) => {
        let aValue, bValue;

        if (app.currentState.sort.column === "name") {
          aValue = a.name;
          bValue = b.name;
        } else {
          aValue = a.basePrice;
          bValue = b.basePrice;
        }

        return app.currentState.sort.direction === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
          ? 1
          : -1;
      });

      // Попълване на таблицата
      filteredProducts.forEach((product) => {
        const row = document.createElement("tr");
        row.setAttribute("data-product-id", product.id);

        // Генериране на HTML за надценките
        let markupPricesHtml = "";
        for (let markup of [5, 10, 15, 20, 25]) {
          const price = app.helpers.calculatePrice(product.basePrice, markup);
          markupPricesHtml += `
                  <div class="d-inline-block me-2">
                    <span class="d-block small text-muted">+${markup}%</span>
                    <span class="price-cell">${app.helpers.formatPrice(
                      price
                    )}</span>
                  </div>
                `;
        }

        // Проверка за персонални цени
        const hasCustomPrices =
          app.customerPrices[product.id] &&
          Object.keys(app.customerPrices[product.id]).length > 0;
        const customPriceBadge = hasCustomPrices
          ? `<span class="badge bg-success ms-2"><i class="bi bi-people-fill"></i> ${
              Object.keys(app.customerPrices[product.id]).length
            }</span>`
          : "";

        row.innerHTML = `
                <td>
                  <div class="fw-semibold">${product.name}</div>
                  <div class="small text-muted">${product.description}</div>
                </td>
                <td class="base-price">${app.helpers.formatPrice(
                  product.basePrice
                )}</td>
                <td>${markupPricesHtml}</td>
                <td>
                  <button class="btn btn-sm btn-primary manage-prices" data-product-id="${
                    product.id
                  }" title="Управление на цени за купувачи">
                    <i class="bi bi-people-fill"></i> Цени${customPriceBadge}
                  </button>
                  <button class="btn btn-sm btn-outline-secondary ms-1 quick-action" data-product-id="${
                    product.id
                  }" data-markup="5" title="Бърза надценка 5%">
                    +5%
                  </button>
                  <button class="btn btn-sm btn-outline-secondary ms-1 quick-action" data-product-id="${
                    product.id
                  }" data-markup="10" title="Бърза надценка 10%">
                    +10%
                  </button>
                </td>
              `;
        tableBody.appendChild(row);
      });

      // Ако няма продукти
      if (filteredProducts.length === 0) {
        tableBody.innerHTML = `
                <tr>
                  <td colspan="4" class="text-center py-4 text-muted">
                    <i class="bi bi-exclamation-circle"></i> Няма намерени продукти
                  </td>
                </tr>
              `;
      }

      // Добавяне на event listeners
      document.querySelectorAll(".manage-prices").forEach((button) => {
        button.addEventListener("click", function () {
          app.productsModule.openPriceModal(
            parseInt(this.getAttribute("data-product-id"))
          );
        });
      });

      document.querySelectorAll(".quick-action").forEach((button) => {
        button.addEventListener("click", function () {
          app.productsModule.applyQuickMarkup(
            parseInt(this.getAttribute("data-product-id")),
            parseInt(this.getAttribute("data-markup"))
          );
        });
      });
    },

    populateCustomerDropdown() {
      const select = document.getElementById("customerSelect");
      if (!select) return;

      select.innerHTML = "";

      app.customers.forEach((customer) => {
        const option = document.createElement("option");
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
      });
    },

    openPriceModal(productId) {
      app.currentState.productId = productId;
      const product = app.products.find((p) => p.id === productId);
      if (!product) return;

      document.getElementById("modalProductName").textContent = product.name;
      document.getElementById("modalBasePrice").textContent =
        app.helpers.formatPrice(product.basePrice);

      document.getElementById("customPrice").value = "";
      document.getElementById("standardMarkup").value = "0";
      document.getElementById("customerSelect").value =
        app.customers[0]?.id || "";

      app.productsModule.populateCustomerPricesTable(productId);

      new bootstrap.Modal(document.getElementById("priceModal")).show();

      setTimeout(() => {
        const customerSelect = document.getElementById("customerSelect");
        if (customerSelect) customerSelect.focus();
      }, 500);
    },

    populateCustomerPricesTable(productId) {
      const tableBody = document.getElementById("customerPricesTable");
      if (!tableBody) return;

      tableBody.innerHTML = "";

      const product = app.products.find((p) => p.id === productId);
      if (!product) return;

      app.customers.forEach((customer) => {
        const row = document.createElement("tr");
        const customPrice = app.customerPrices[productId]?.[customer.id];
        const price = customPrice || product.basePrice;
        const diff = app.helpers.calculatePriceDiff(product.basePrice, price);
        const diffClass = customPrice
          ? customPrice > product.basePrice
            ? "price-increase"
            : "price-decrease"
          : "";

        row.innerHTML = `
                <td>${customer.name}</td>
                <td class="fw-semibold ${customPrice ? "custom-price" : ""}">
                  ${app.helpers.formatPrice(price)}
                  ${
                    customPrice
                      ? `<span class="price-change ${diffClass}">(${diff})</span>`
                      : ""
                  }
                </td>
                <td class="${diffClass}">${diff}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary edit-price" data-customer-id="${
                    customer.id
                  }">
                    <i class="bi bi-pencil"></i>
                  </button>
                </td>
              `;
        tableBody.appendChild(row);
      });

      document.querySelectorAll(".edit-price").forEach((button) => {
        button.addEventListener("click", function () {
          app.productsModule.selectCustomerInModal(
            parseInt(this.getAttribute("data-customer-id"))
          );
        });
      });
    },

    selectCustomerInModal(customerId) {
      app.currentState.customerId = customerId;
      document.getElementById("customerSelect").value = customerId;

      const product = app.products.find(
        (p) => p.id === app.currentState.productId
      );
      if (!product) return;

      const customPrice =
        app.customerPrices[app.currentState.productId]?.[customerId];
      const customPriceInput = document.getElementById("customPrice");
      const markupSelect = document.getElementById("standardMarkup");

      if (customPrice && customPriceInput && markupSelect) {
        customPriceInput.value = customPrice.toFixed(2);

        let isStandardMarkup = false;
        for (let markup of [0, 5, 10, 15, 20, 25]) {
          const calculatedPrice = app.helpers.calculatePrice(
            product.basePrice,
            markup
          );
          if (Math.abs(calculatedPrice - customPrice) < 0.01) {
            markupSelect.value = markup;
            isStandardMarkup = true;
            break;
          }
        }

        if (!isStandardMarkup) {
          markupSelect.value = "0";
        }
      } else if (customPriceInput && markupSelect) {
        customPriceInput.value = "";
        markupSelect.value = "0";
      }

      app.productsModule.updatePriceInfoInModal();
    },

    updatePriceInfoInModal() {
      const product = app.products.find(
        (p) => p.id === app.currentState.productId
      );
      if (!product) return;

      const customPriceInput = document.getElementById("customPrice");
      const markupSelect = document.getElementById("standardMarkup");
      const currentPriceEl = document.getElementById("modalCurrentPrice");
      const diffEl = document.getElementById("modalPriceDiff");

      if (!customPriceInput || !markupSelect || !currentPriceEl || !diffEl)
        return;

      let currentPrice;
      if (customPriceInput.value) {
        currentPrice = parseFloat(customPriceInput.value);
      } else {
        const markup = parseFloat(markupSelect.value);
        currentPrice = app.helpers.calculatePrice(product.basePrice, markup);
      }

      currentPriceEl.textContent = app.helpers.formatPrice(currentPrice);

      const diff = app.helpers.calculatePriceDiff(
        product.basePrice,
        currentPrice
      );
      diffEl.textContent = diff;

      if (currentPrice > product.basePrice) {
        diffEl.className = "price-increase";
      } else if (currentPrice < product.basePrice) {
        diffEl.className = "price-decrease";
      } else {
        diffEl.className = "";
      }
    },

    applyQuickMarkup(productId, markup) {
      const product = app.products.find((p) => p.id === productId);
      if (!product) return;

      const newPrice = app.helpers.calculatePrice(product.basePrice, markup);

      if (
        confirm(
          `Прилагане на ${markup}% надценка върху всички купувачи за продукт "${
            product.name
          }"?\nНова цена: ${app.helpers.formatPrice(newPrice)}`
        )
      ) {
        if (!app.customerPrices[productId]) {
          app.customerPrices[productId] = {};
        }

        app.customers.forEach((customer) => {
          app.customerPrices[productId][customer.id] = newPrice;
        });

        app.helpers.showToast(
          `Надценка от ${markup}% е приложена успешно за всички купувачи`
        );
        app.productsModule.populateTable();

        if (app.currentState.productId === productId) {
          app.productsModule.populateCustomerPricesTable(productId);
        }
      }
    },

    saveCustomerPrice() {
      if (!app.currentState.productId) return;

      const customerId = parseInt(
        document.getElementById("customerSelect").value
      );
      const customPriceInput = document.getElementById("customPrice");
      const markupSelect = document.getElementById("standardMarkup");

      const product = app.products.find(
        (p) => p.id === app.currentState.productId
      );
      if (!product || !customPriceInput || !markupSelect) return;

      let price;
      if (customPriceInput.value) {
        price = parseFloat(customPriceInput.value);
      } else {
        const markup = parseFloat(markupSelect.value);
        price = app.helpers.calculatePrice(product.basePrice, markup);
      }

      if (!app.customerPrices[app.currentState.productId]) {
        app.customerPrices[app.currentState.productId] = {};
      }

      if (Math.abs(price - product.basePrice) < 0.01) {
        delete app.customerPrices[app.currentState.productId][customerId];

        if (
          Object.keys(app.customerPrices[app.currentState.productId]).length ===
          0
        ) {
          delete app.customerPrices[app.currentState.productId];
        }
      } else {
        app.customerPrices[app.currentState.productId][customerId] = price;
      }

      const customer = app.customers.find((c) => c.id === customerId);
      if (customer) {
        app.helpers.showToast(`Цената за ${customer.name} е запазена успешно!`);
      }

      app.productsModule.populateTable();
      app.productsModule.populateCustomerPricesTable(
        app.currentState.productId
      );

      if (confirm("Цената е запазена. Желаете ли да затворите прозореца?")) {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("priceModal")
        );
        if (modal) modal.hide();
      }
    },
  },

  // Функции за купувачи
  customersModule: {
    init() {
      if (!document.getElementById("customersList")) return;

      this.loadStats();
      this.populateList();
      this.initEventListeners();
    },

    loadStats() {
      const stats = {
        totalCustomers: app.customers.length,
        activeProducts: app.products.length,
        customPrices: Object.values(app.customerPrices).reduce(
          (acc, curr) => acc + Object.keys(curr).length,
          0
        ),
      };

      const totalEl = document.getElementById("totalCustomersStat");
      const productsEl = document.getElementById("activeProductsStat");
      const pricesEl = document.getElementById("customPricesStat");

      if (totalEl) totalEl.textContent = stats.totalCustomers;
      if (productsEl) productsEl.textContent = stats.activeProducts;
      if (pricesEl) pricesEl.textContent = stats.customPrices;
    },

    populateList(filter = "") {
      const customersList = document.getElementById("customersList");
      if (!customersList) return;

      customersList.innerHTML = "";

      const filteredCustomers = app.customers.filter((customer) =>
        customer.name.toLowerCase().includes(filter.toLowerCase())
      );

      filteredCustomers.sort((a, b) => a.name.localeCompare(b.name));

      filteredCustomers.forEach((customer) => {
        const col = document.createElement("div");
        col.className = "col-lg-6 mb-3";

        const productCount = Object.values(app.customerPrices).reduce(
          (acc, prices) => {
            return acc + (prices[customer.id] ? 1 : 0);
          },
          0
        );

        col.innerHTML = `
          <div class="card customer-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h5 class="card-title mb-1">${customer.name}</h5>
                  ${
                    customer.address
                      ? `<p class="text-muted small mb-2">
                            <i class="bi ${
                              customer.address.toLowerCase().includes("онлайн")
                                ? "bi-globe"
                                : "bi-building"
                            }"></i> ${customer.address}
                          </p>`
                      : ""
                  }
                  <div class="mb-2">
                    <span class="badge ${app.helpers.getCustomerBadgeClass(
                      customer.type
                    )} me-1">
                      ${app.helpers.getCustomerTypeName(customer.type)}
                    </span>
                    <span class="badge ${
                      customer.status === "active" ? "bg-success" : "bg-danger"
                    }">
                      ${customer.status === "active" ? "Активен" : "Неактивен"}
                    </span>
                  </div>
                </div>
                <div class="customer-actions">
                  <button class="btn btn-sm btn-outline-primary me-1 edit-customer" data-customer-id="${
                    customer.id
                  }" title="Редактирай">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger delete-customer" data-customer-id="${
                    customer.id
                  }" title="Изтрий">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  ${
                    customer.email
                      ? `<p class="mb-1 small">
                            <i class="bi bi-envelope"></i> ${customer.email}
                          </p>`
                      : ""
                  }
                  ${
                    customer.phone
                      ? `<p class="mb-1 small">
                            <i class="bi bi-telephone"></i> ${customer.phone}
                          </p>`
                      : ""
                  }
                  ${
                    customer.contactPerson
                      ? `<p class="mb-0 small">
                            <i class="bi bi-person"></i> ${customer.contactPerson}
                          </p>`
                      : ""
                  }
                </div>
                <div class="text-end">
                  <span class="d-block text-muted small">Персонални цени:</span>
                  <span class="badge product-badge">${productCount} продукта</span>
                </div>
              </div>
            </div>
            <div class="card-footer bg-transparent">
              <button class="btn btn-sm btn-outline-secondary w-100 view-prices" data-customer-id="${
                customer.id
              }">
                <i class="bi bi-graph-up"></i> Виж цени и история
              </button>
            </div>
          </div>
        `;

        customersList.appendChild(col);
      });

      if (filteredCustomers.length === 0) {
        customersList.innerHTML = `
          <div class="col-12 text-center py-5 text-muted">
            <i class="bi bi-people fs-1"></i>
            <h5 class="mt-3">Няма намерени купувачи</h5>
          </div>
        `;
      }
    },

    showModal(modalId) {
      document.querySelectorAll(".modal").forEach((m) => {
        m.style.display = "none";
        m.classList.remove("show");
      });

      const modal = document.getElementById(modalId);
      if (modal) {
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade";
        backdrop.id = "custom-backdrop";
        document.body.appendChild(backdrop);

        modal.style.display = "block";
        document.body.classList.add("modal-open");

        setTimeout(() => {
          backdrop.classList.add("show");
          modal.classList.add("show");
        }, 10);

        const input = modal.querySelector("input, select, textarea");
        if (input) setTimeout(() => input.focus(), 50);
      }
    },

    hideModal(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;

      const backdrop = document.getElementById("custom-backdrop");

      modal.classList.remove("show");
      if (backdrop) backdrop.classList.remove("show");

      setTimeout(() => {
        modal.style.display = "none";
        if (backdrop) backdrop.remove();
        document.body.classList.remove("modal-open");
      }, 150);
    },

    showCustomerPrices(customerId) {
      const customer = app.customers.find((c) => c.id === customerId);
      if (!customer) return;

      this.showModal("customerPricesModal");

      const modalTitle = document.getElementById("modalCustomerName");
      if (modalTitle) modalTitle.textContent = customer.name;

      const tableBody = document.getElementById("customerPricesTableBody");
      if (tableBody) {
        tableBody.innerHTML = "";

        app.products.forEach((product) => {
          const customPrice = app.customerPrices[product.id]?.[customerId];
          const price = customPrice || product.basePrice;
          const diff = app.helpers.calculatePriceDiff(product.basePrice, price);
          const diffClass = customPrice
            ? customPrice > product.basePrice
              ? "price-increase"
              : "price-decrease"
            : "";

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${product.name}</td>
            <td>${app.helpers.formatPrice(product.basePrice)}</td>
            <td class="fw-bold ${
              customPrice ? "text-success" : ""
            }">${app.helpers.formatPrice(price)}</td>
            <td class="${diffClass}">${diff}</td>
            <td>
              <button class="btn btn-sm ${
                customPrice ? "btn-outline-primary" : "btn-primary"
              } edit-price" 
                      data-product-id="${
                        product.id
                      }" data-customer-id="${customerId}">
                ${customPrice ? "Редактирай" : "Добави цена"}
              </button>
            </td>
          `;
          tableBody.appendChild(row);
        });

        document.querySelectorAll(".edit-price").forEach((button) => {
          button.addEventListener("click", function () {
            const productId = parseInt(this.getAttribute("data-product-id"));
            const customerId = parseInt(this.getAttribute("data-customer-id"));
            app.productsModule.openPriceModal(productId);
            app.productsModule.selectCustomerInModal(customerId);
            app.customersModule.hideModal("customerPricesModal");
          });
        });
      }
    },

    addCustomerBtnClick() {
      this.resetCustomerForm();
      this.showModal("addCustomerModal");
    },

    saveCustomer() {
      const nameInput = document.getElementById("customerName");
      const typeInput = document.getElementById("customerType");
      const statusInput = document.getElementById("customerStatus");
      const emailInput = document.getElementById("customerEmail");
      const phoneInput = document.getElementById("customerPhone");
      const contactInput = document.getElementById("customerContact");
      const addressInput = document.getElementById("customerAddress");
      const notesInput = document.getElementById("customerNotes");

      if (!nameInput || !typeInput || !statusInput) return;

      const customerData = {
        name: nameInput.value,
        type: typeInput.value,
        status: statusInput.value,
        email: emailInput?.value || "",
        phone: phoneInput?.value || "",
        contactPerson: contactInput?.value || "",
        address: addressInput?.value || "",
        notes: notesInput?.value || "",
      };

      if (!customerData.name) {
        alert("Моля, въведете име на купувача!");
        return;
      }

      const saveBtn = document.getElementById("saveCustomerBtn");
      const isEdit = saveBtn && saveBtn.textContent.includes("промените");

      if (isEdit) {
        const customerId = parseInt(saveBtn.getAttribute("data-customer-id"));
        const customerIndex = app.customers.findIndex(
          (c) => c.id === customerId
        );

        if (customerIndex !== -1) {
          app.customers[customerIndex] = {
            ...app.customers[customerIndex],
            ...customerData,
          };
          app.helpers.showToast(
            "Данните за купувача са актуализирани успешно!"
          );
        }
      } else {
        const newCustomer = {
          id:
            app.customers.length > 0
              ? Math.max(...app.customers.map((c) => c.id)) + 1
              : 1,
          ...customerData,
        };

        app.customers.push(newCustomer);
        app.helpers.showToast(
          `Купувач "${newCustomer.name}" е добавен успешно!`
        );
      }

      this.hideModal("addCustomerModal");
      this.populateList();
      this.loadStats();
    },

    editCustomer(customerId) {
      const customer = app.customers.find((c) => c.id === customerId);
      if (!customer) return;

      const nameInput = document.getElementById("customerName");
      const typeInput = document.getElementById("customerType");
      const statusInput = document.getElementById("customerStatus");
      const emailInput = document.getElementById("customerEmail");
      const phoneInput = document.getElementById("customerPhone");
      const contactInput = document.getElementById("customerContact");
      const addressInput = document.getElementById("customerAddress");
      const notesInput = document.getElementById("customerNotes");

      if (nameInput) nameInput.value = customer.name;
      if (typeInput) typeInput.value = customer.type;
      if (statusInput) statusInput.value = customer.status;
      if (emailInput) emailInput.value = customer.email;
      if (phoneInput) phoneInput.value = customer.phone;
      if (contactInput) contactInput.value = customer.contactPerson;
      if (addressInput) addressInput.value = customer.address;
      if (notesInput) notesInput.value = customer.notes;

      const modalTitle = document.getElementById("addCustomerModalLabel");
      if (modalTitle)
        modalTitle.textContent = `Редактиране на ${customer.name}`;

      const saveBtn = document.getElementById("saveCustomerBtn");
      if (saveBtn) {
        saveBtn.textContent = "Запази промените";
        saveBtn.setAttribute("data-customer-id", customerId);
      }

      this.showModal("addCustomerModal");
    },

    resetCustomerForm() {
      const form = document.getElementById("customerForm");
      if (form) form.reset();

      const modalTitle = document.getElementById("addCustomerModalLabel");
      if (modalTitle) modalTitle.textContent = "Добавяне на нов купувач";

      const saveBtn = document.getElementById("saveCustomerBtn");
      if (saveBtn) {
        saveBtn.textContent = "Запази";
        saveBtn.onclick = () => this.saveCustomer();
      }
    },

    deleteCustomer(customerId) {
      if (!confirm("Сигурни ли сте, че искате да изтриете този купувач?"))
        return;

      const customerIndex = app.customers.findIndex((c) => c.id === customerId);
      if (customerIndex === -1) return;

      const customerName = app.customers[customerIndex].name;
      app.customers.splice(customerIndex, 1);

      for (const productId in app.customerPrices) {
        if (app.customerPrices[productId][customerId]) {
          delete app.customerPrices[productId][customerId];
          if (Object.keys(app.customerPrices[productId]).length === 0) {
            delete app.customerPrices[productId];
          }
        }
      }

      app.helpers.showToast(`Купувач "${customerName}" беше изтрит!`);
      this.populateList();
      this.loadStats();
    },

    initEventListeners() {
      // Търсене
      const customerSearch = document.getElementById("customerSearch");
      if (customerSearch) {
        customerSearch.addEventListener("input", () => {
          this.populateList(customerSearch.value);
        });
      }

      // Изчистване на търсенето
      const clearSearch = document.getElementById("clearCustomerSearch");
      if (clearSearch) {
        clearSearch.addEventListener("click", () => {
          const searchInput = document.getElementById("customerSearch");
          if (searchInput) {
            searchInput.value = "";
            this.populateList("");
          }
        });
      }

      // Добавяне на нов купувач
      const addCustomerBtn = document.getElementById("addCustomerBtn");
      if (addCustomerBtn) {
        addCustomerBtn.addEventListener("click", () => {
          this.addCustomerBtnClick();
        });
      }

      // Запазване на купувач
      const saveCustomerBtn = document.getElementById("saveCustomerBtn");
      if (saveCustomerBtn) {
        saveCustomerBtn.addEventListener("click", () => {
          this.saveCustomer();
        });
      }

      // Делегиране на събития
      document.addEventListener("click", (e) => {
        if (e.target.closest(".view-prices")) {
          const customerId = parseInt(
            e.target.closest(".view-prices").getAttribute("data-customer-id")
          );
          this.showCustomerPrices(customerId);
        }

        if (e.target.closest(".edit-customer")) {
          const customerId = parseInt(
            e.target.closest(".edit-customer").getAttribute("data-customer-id")
          );
          this.editCustomer(customerId);
        }

        if (e.target.closest(".delete-customer")) {
          const customerId = parseInt(
            e.target
              .closest(".delete-customer")
              .getAttribute("data-customer-id")
          );
          this.deleteCustomer(customerId);
        }
      });
    },
  },

  // Общи функции
  common: {
    initEventListeners() {
      // Търсене на продукти
      const productSearch = document.getElementById("productSearch");
      if (productSearch) {
        productSearch.addEventListener("input", () => {
          app.productsModule.populateTable(productSearch.value);
        });
      }

      // Изчистване на търсенето на продукти
      const clearSearch = document.getElementById("clearSearch");
      if (clearSearch) {
        clearSearch.addEventListener("click", () => {
          const searchInput = document.getElementById("productSearch");
          if (searchInput) {
            searchInput.value = "";
            app.productsModule.populateTable("");
          }
        });
      }

      // Сортиране на колони
      document.querySelectorAll(".sortable").forEach((header) => {
        header.addEventListener("click", function () {
          const column = this.getAttribute("data-column");

          if (app.currentState.sort.column === column) {
            app.currentState.sort.direction =
              app.currentState.sort.direction === "asc" ? "desc" : "asc";
          } else {
            app.currentState.sort.column = column;
            app.currentState.sort.direction = "asc";
          }

          const searchInput = document.getElementById("productSearch");
          app.productsModule.populateTable(searchInput?.value || "");
        });
      });

      // Запазване на цена в модалния прозорец
      const savePriceBtn = document.getElementById("savePriceBtn");
      if (savePriceBtn) {
        savePriceBtn.addEventListener("click", () => {
          app.productsModule.saveCustomerPrice();
        });
      }

      // Промяна на стойности в модалния прозорец за цени
      const customPriceInput = document.getElementById("customPrice");
      if (customPriceInput) {
        customPriceInput.addEventListener("input", () => {
          app.productsModule.updatePriceInfoInModal();
        });
      }

      const standardMarkup = document.getElementById("standardMarkup");
      if (standardMarkup) {
        standardMarkup.addEventListener("change", function () {
          const product = app.products.find(
            (p) => p.id === app.currentState.productId
          );
          if (!product) return;

          const markup = parseFloat(this.value);
          const price = app.helpers.calculatePrice(product.basePrice, markup);

          const customPrice = document.getElementById("customPrice");
          if (customPrice) {
            customPrice.value = markup > 0 ? price.toFixed(2) : "";
            app.productsModule.updatePriceInfoInModal();
          }
        });
      }

      // Избор на купувач в модалния прозорец за цени
      const customerSelect = document.getElementById("customerSelect");
      if (customerSelect) {
        customerSelect.addEventListener("change", function () {
          app.currentState.customerId = parseInt(this.value);
          const customPrice =
            app.customerPrices[app.currentState.productId]?.[
              app.currentState.customerId
            ];

          const customPriceInput = document.getElementById("customPrice");
          const markupSelect = document.getElementById("standardMarkup");

          if (customPrice && customPriceInput && markupSelect) {
            customPriceInput.value = customPrice.toFixed(2);

            let isStandardMarkup = false;
            for (let markup of [0, 5, 10, 15, 20, 25]) {
              const calculatedPrice = app.helpers.calculatePrice(
                app.products.find((p) => p.id === app.currentState.productId)
                  .basePrice,
                markup
              );
              if (Math.abs(calculatedPrice - customPrice) < 0.01) {
                markupSelect.value = markup;
                isStandardMarkup = true;
                break;
              }
            }

            if (!isStandardMarkup) {
              markupSelect.value = "0";
            }
          } else if (customPriceInput && markupSelect) {
            customPriceInput.value = "";
            markupSelect.value = "0";
          }

          app.productsModule.updatePriceInfoInModal();
        });
      }

      // Добавяне на нов продукт
      const addProductBtn = document.getElementById("addProductBtn");
      if (addProductBtn) {
        addProductBtn.addEventListener("click", function () {
          const modal = new bootstrap.Modal(
            document.getElementById("addProductModal")
          );
          modal.show();
        });
      }

      const confirmAddProduct = document.getElementById("confirmAddProduct");
      if (confirmAddProduct) {
        confirmAddProduct.addEventListener("click", function () {
          const name = document.getElementById("productName").value;
          const basePrice = parseFloat(
            document.getElementById("productBasePrice").value
          );
          const description =
            document.getElementById("productDescription").value;

          if (!name || isNaN(basePrice)) {
            alert("Моля, попълнете всички задължителни полета!");
            return;
          }

          const newProduct = {
            id: Math.max(...app.products.map((p) => p.id)) + 1,
            name,
            basePrice,
            description,
          };

          app.products.push(newProduct);
          app.helpers.showToast(`Продукт "${name}" е добавен успешно!`);

          const modal = bootstrap.Modal.getInstance(
            document.getElementById("addProductModal")
          );
          if (modal) modal.hide();
          document.getElementById("addProductForm").reset();

          app.productsModule.populateTable();
        });
      }

      // Превключване на темата
      const themeToggle = document.getElementById("themeToggle");
      if (themeToggle) {
        themeToggle.addEventListener("click", () => {
          document.body.classList.toggle("dark-theme");
          localStorage.setItem(
            "theme",
            document.body.classList.contains("dark-theme") ? "dark" : "light"
          );

          if (document.body.classList.contains("dark-theme")) {
            themeToggle.innerHTML =
              '<i class="bi bi-sun-fill"></i> Светла тема';
          } else {
            themeToggle.innerHTML =
              '<i class="bi bi-moon-fill"></i> Тъмна тема';
          }
        });
      }

      // Помощ
      const helpBtn = document.getElementById("helpBtn");
      if (helpBtn) {
        helpBtn.addEventListener("click", () => {
          alert(
            "Добре дошли в системата за управление на цени!\n\n" +
              '1. Изберете "Продукти" за да видите списък с всички продукти и техните цени\n' +
              '2. Кликнете на "Цени" за да управлявате цени за отделни купувачи\n' +
              "3. Използвайте бързите бутони за прилагане на стандартни надценки\n" +
              '4. В раздела "Купувачи" можете да управлявате списъка с купувачи\n' +
              '5. В раздела "Отчети" можете да видите анализи за цените'
          );
        });
      }

      // Клавишни комбинации
      document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.key === "f") {
          e.preventDefault();
          const searchInput =
            document.getElementById("productSearch") ||
            document.getElementById("customerSearch");
          if (searchInput) searchInput.focus();
        }
      });
    },

    loadThemePreference() {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        const themeBtn = document.getElementById("themeToggle");
        if (themeBtn) {
          themeBtn.innerHTML = '<i class="bi bi-sun-fill"></i> Светла тема';
        }
      }
    },
  },

  // Инициализация на приложението
  init() {
    this.common.loadThemePreference();
    this.common.initEventListeners();

    if (document.getElementById("productsTable")) {
      this.productsModule.populateTable();
      this.productsModule.populateCustomerDropdown();
    }

    this.customersModule.init();
  },
};

// Стартиране на приложението
document.addEventListener("DOMContentLoaded", function () {
  app.init();
});
