const brands = [
  "Maruti Suzuki", "Hyundai", "Tata", "Mahindra",
  "Honda", "Toyota", "Kia", "BMW", "Mercedes", "Tesla"
];

const models = {
  "Maruti Suzuki": ["Swift", "Baleno", "Brezza"],
  "Hyundai": ["i20", "Creta", "Venue"],
  "Tata": ["Nexon", "Punch", "Harrier"],
  "Mahindra": ["Scorpio", "XUV700", "Thar"],
  "Honda": ["City", "Amaze", "Elevate"],
  "Toyota": ["Fortuner", "Innova", "Glanza"],
  "Kia": ["Seltos", "Sonet", "Carens"],
  "BMW": ["3 Series", "X1", "5 Series"],
  "Mercedes": ["C-Class", "GLA", "E-Class"],
  "Tesla": ["Model 3", "Model Y", "Model S"]
};

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];
const fuelWeights = [45, 30, 15, 10];

function seededRandom(seed) {
  let value = seed;
  return function () {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const random = seededRandom(100);

function pick(array) {
  return array[Math.floor(random() * array.length)];
}

let cars = Array.from({ length: 300 }, (_, i) => {
  const brand = pick(brands);
  const model = pick(models[brand]);
  const fuelRoll = random() * 100;
  let fuel = "Petrol";
  let cumulative = 0;

  for (let j = 0; j < fuelTypes.length; j++) {
    cumulative += fuelWeights[j];
    if (fuelRoll < cumulative) {
      fuel = fuelTypes[j];
      break;
    }
  }

  let price = 500000 + Math.floor(random() * 4500000);

  if (brand === "BMW" || brand === "Mercedes") {
    price += 2500000;
  }
  if (brand === "Tesla") {
    price += 2000000;
  }
  if (fuel === "Electric") {
    price += 200000;
  }

  const units = 1 + Math.floor(random() * 50);

  return {
    costPrice: Number.isFinite(costPrice) && costPrice >= 0
  ? costPrice
  : 0,
    id: i + 1,
    brand,
    model,
    year: 2018 + Math.floor(random() * 9),
    fuel,
    units,
    price,
    costPrice: Math.round(price * 0.8),
    salesValue: units * price
  };
});

const money = value =>
  "₹" + Math.round(value).toLocaleString("en-IN");

let filteredCars = [...cars];
let currentPage = 1;
const pageSize = 10;
const chartInstances = {};

const search = document.getElementById("search");
const brandFilter = document.getElementById("brandFilter");
const fuelFilter = document.getElementById("fuelFilter");
const priceFilter = document.getElementById("priceFilter");

brands.forEach(brand => {
  const option = document.createElement("option");
  option.value = brand;
  option.textContent = brand;
  brandFilter.appendChild(option);
});

function getBrandCounts(data) {
  const counts = {};
  data.forEach(car => {
    counts[car.brand] = (counts[car.brand] || 0) + 1;
  });
  return counts;
}

function updateDashboard() {
  const totalUnits = filteredCars.reduce((sum, car) => sum + car.units, 0);
  const totalValue = filteredCars.reduce((sum, car) => sum + car.salesValue, 0);
  const avgPrice = filteredCars.length
  const totalProfit = filteredCars.reduce(
  (sum, car) => sum + (car.price - car.costPrice) * car.units,
  0
);

document.getElementById("totalProfit").textContent =
  money(totalProfit);

document.getElementById("profitMargin").textContent =
  totalValue > 0
    ? ((totalProfit / totalValue) * 100).toFixed(1) + "%"
    : "0%";
    filteredCars.reduce((sum, car) => sum + car.price, 0) / filteredCars.length
     0;

  const counts = getBrandCounts(filteredCars);
  const topBrand = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0];

  document.getElementById("totalCars").textContent =
    filteredCars.length.toLocaleString("en-IN");

  document.getElementById("totalSales").textContent = money(totalValue);
  document.getElementById("avgPrice").textContent = money(avgPrice);
  document.getElementById("topBrand").textContent =
    topBrand ? topBrand[0] : "—";

  document.getElementById("recordCount").textContent =
    `${filteredCars.length} records · ${totalUnits.toLocaleString("en-IN")} units sold`;

  renderTable();
  renderCharts();
}

function applyFilters() {
  const query = search.value.toLowerCase().trim();
  const selectedBrand = brandFilter.value;
  const selectedFuel = fuelFilter.value;
  const selectedPrice = priceFilter.value;

  filteredCars = cars.filter(car => {
    const matchesSearch =
      `${car.brand} ${car.model} ${car.year} ${car.id}`
        .toLowerCase().includes(query);

    const matchesBrand = !selectedBrand || car.brand === selectedBrand;
    const matchesFuel = !selectedFuel || car.fuel === selectedFuel;

    let matchesPrice = true;
    if (selectedPrice) {
      const [min, max] = selectedPrice.split("-").map(Number);
      matchesPrice = car.price >= min && car.price < max;
    }

    return matchesSearch && matchesBrand && matchesFuel && matchesPrice;
  });

  currentPage = 1;
  updateDashboard();
}

function renderTable() {
  const tbody = document.getElementById("carTable");
  tbody.replaceChildren();

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);

  const start = (currentPage - 1) * pageSize;
  const pageCars = filteredCars.slice(start, start + pageSize);

  pageCars.forEach(car => {
    const tr = document.createElement("tr");

    [
      car.id,
      car.brand,
      car.model,
      car.year,
      car.fuel,
      car.units,
      money(car.price),
      money(car.salesValue)
    ].forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  document.getElementById("pageInfo").textContent =
    `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevBtn").disabled = currentPage <= 1;
  document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}

function drawChart(id, config) {
  if (chartInstances[id]) chartInstances[id].destroy();

  chartInstances[id] = new Chart(
    document.getElementById(id),
    config
  );
}

function renderCharts() {
  const brandCounts = getBrandCounts(filteredCars);
  const brandNames = Object.keys(brandCounts);

  drawChart("brandChart", {
    type: "bar",
    data: {
      labels: brandNames,
      datasets: [{
        label: "Number of Cars",
        data: brandNames.map(name => brandCounts[name]),
        backgroundColor: "#3269bb",
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } }
    }
  });

  const fuels = ["Petrol", "Diesel", "Electric", "Hybrid"];
  const fuelCounts = fuels.map(fuel =>
    filteredCars.filter(car => car.fuel === fuel).length
  );

  drawChart("fuelChart", {
    type: "doughnut",
    data: {
      labels: fuels,
      datasets: [{
        data: fuelCounts,
        backgroundColor: ["#3269bb", "#f0a63a", "#31a879", "#8964cc"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });

  const averagePrices = brandNames.map(brand => {
    const matching = filteredCars.filter(car => car.brand === brand);
    return matching.length
      ? matching.reduce((sum, car) => sum + car.price, 0) / matching.length
      : 0;
  });

  drawChart("priceChart", {
    type: "bar",
    data: {
      labels: brandNames,
      datasets: [{
        label: "Average Price (₹)",
        data: averagePrices,
        backgroundColor: "#31a879",
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => "₹" + (value / 100000).toFixed(0) + "L"
          }
        }
      }
    }
  });
}

search.addEventListener("input", applyFilters);
brandFilter.addEventListener("change", applyFilters);
fuelFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("change", applyFilters);

document.getElementById("resetBtn").addEventListener("click", () => {
  search.value = "";
  brandFilter.value = "";
  fuelFilter.value = "";
  priceFilter.value = "";
  applyFilters();
});

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentPage < Math.ceil(filteredCars.length / pageSize)) {
    currentPage++;
    renderTable();
  }
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const headers = [
    "ID", "Brand", "Model", "Year", "Fuel",
    "Units Sold", "Price", "Sales Value"
  ];

  const rows = filteredCars.map(car => [
    car.id, car.brand, car.model, car.year, car.fuel,
    car.units, car.price, car.salesValue
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(value =>
      `"${String(value).replace(/"/g, '""')}"`
    ).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "car_sales_analysis.csv";
  link.click();
  URL.revokeObjectURL(url);
});
document.getElementById("csvUpload").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!window.Papa) {
    alert("CSV parser load nahi hua. Internet check karo.");
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: result => {
      const rows = result.data;

      if (!rows.length) {
        alert("CSV file mein data nahi mila.");
        return;
      }

      const normalize = row => {
        const output = {};
        Object.entries(row).forEach(([key, value]) => {
          output[key.trim().toLowerCase().replace(/[_\s-]+/g, "")] = value;
        });
        return output;
      };

      const getValue = (row, keys) => {
        for (const key of keys) {
          if (row[key] !== undefined && row[key] !== "") {
            return row[key];
          }
        }
        return "";
      };

      const numberValue = value =>
        Number(String(value).replace(/[₹,\s]/g, ""));

      const importedCars = rows.map((original, index) => {
        const row = normalize(original);

        const brand = getValue(row, ["brand", "company", "manufacturer"]);
        const model = getValue(row, ["model", "carname", "name"]);
        const price = numberValue(getValue(row, ["price", "carprice", "sellingprice"]));
        const costPrice = numberValue(
  getValue(row, ["costprice", "cost", "purchaseprice"])
);
        const year = numberValue(getValue(row, ["year", "modelyear"]));
        const units = numberValue(getValue(row, ["unitssold", "units", "quantity", "sales"]));
        const fuel = getValue(row, ["fuel", "fueltype"]) || "Unknown";

        if (
          !brand || !model ||
          !Number.isFinite(price) || price <= 0 ||
          !Number.isFinite(year) || year < 1900 ||
          !Number.isFinite(units) || units <= 0
        ) {
          return null;
        }

        return {
          id: index + 1,
          brand: String(brand).trim(),
          model: String(model).trim(),
          year,
          fuel: String(fuel).trim(),
          units,
          price,
          salesValue: price * units
        };
      }).filter(Boolean);

      if (!importedCars.length) {
        alert(
          "Valid records nahi mile. CSV headers check karo: Brand, Model, Year, Fuel, Units Sold, Price."
        );
        return;
      }

      cars = importedCars;

      const existingBrands = new Set(
        [...brandFilter.options].map(option => option.value)
      );

      [...new Set(cars.map(car => car.brand))].forEach(brand => {
        if (!existingBrands.has(brand)) {
          const option = document.createElement("option");
          option.value = brand;
          option.textContent = brand;
          brandFilter.appendChild(option);
        }
      });

      search.value = "";
      brandFilter.value = "";
      fuelFilter.value = "";
      priceFilter.value = "";
      event.target.value = "";

      applyFilters();

      alert(
        `${importedCars.length} valid car records import ho gaye!`
      );
    },
    error: () => alert("CSV file read nahi ho paayi.")
  });
});
updateDashboard();