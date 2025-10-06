document.addEventListener("DOMContentLoaded", function () {
	const carNameInput = document.getElementById("carName");
	const licensePlateInput = document.getElementById("licensePlate");
	const vinNumberInput = document.getElementById("vinNumber");
	const saveBtn = document.getElementById("saveBtn");
	const clearBtn = document.getElementById("clearBtn");
	const savedCarsList = document.getElementById("savedCarsList");
	const packageSummary = document.getElementById("packageSummary");
	const summarySection = document.getElementById("summarySection");

	let savedCars = JSON.parse(localStorage.getItem("bmw330eChecklist")) || [];

	// Update package summary when checkboxes change
	document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
		checkbox.addEventListener("change", updatePackageSummary);
	});

	// Save car button
	saveBtn.addEventListener("click", function () {
		const carName = carNameInput.value.trim();
		const licensePlate = licensePlateInput.value.trim();

		if (!carName || !licensePlate) {
			alert("Please enter both a car name and license plate number");
			return;
		}

		const carData = {
			id: Date.now().toString(),
			name: carName,
			licensePlate: licensePlate,
			vin: vinNumberInput.value.trim(),
			timestamp: new Date().toLocaleString(),
			checklist: getChecklistData(),
		};

		// Check if car with same license plate already exists
		const existingIndex = savedCars.findIndex(
			(car) => car.licensePlate.toLowerCase() === licensePlate.toLowerCase()
		);

		if (existingIndex !== -1) {
			savedCars[existingIndex] = carData;
		} else {
			savedCars.push(carData);
		}

		localStorage.setItem("bmw330eChecklist", JSON.stringify(savedCars));
		renderSavedCars();
		alert("Car saved successfully!");
	});

	// Clear form button
	clearBtn.addEventListener("click", function () {
		if (confirm("Are you sure you want to clear the form?")) {
			carNameInput.value = "";
			licensePlateInput.value = "";
			vinNumberInput.value = "";
			document
				.querySelectorAll('input[type="checkbox"]')
				.forEach((checkbox) => {
					checkbox.checked = false;
				});
			updatePackageSummary();
		}
	});

	// Get checklist data
	function getChecklistData() {
		const checklistData = {};
		document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
			checklistData[checkbox.id] = checkbox.checked;
		});
		return checklistData;
	}

	// Update package summary
	function updatePackageSummary() {
		const packages = {
			executive: {
				name: "Executive Package",
				items: [
					"execAdaptiveLED",
					"execHarmanKardon",
					"execHeatedSteering",
					"execWirelessCharging",
					"execWiFiHotspot",
				],
				count: 0,
			},
			premium: {
				name: "Premium Package",
				items: [
					"premHeadUpDisplay",
					"premComfortAccess",
					"premLiveCockpitPro",
					"premLumbarSupport",
				],
				count: 0,
			},
			driving: {
				name: "Driving Assistance Package",
				items: [
					"driveAssistActiveCruise",
					"driveAssistLaneKeep",
					"driveAssistBlindSpot",
				],
				count: 0,
			},
			parking: {
				name: "Parking Assistance Package",
				items: ["parkSurroundView", "parkReversingAssistant"],
				count: 0,
			},
		};

		// Count checked items for each package
		for (const packageKey in packages) {
			packages[packageKey].count = packages[packageKey].items.filter((item) => {
				return document.getElementById(item).checked;
			}).length;
		}

		// Generate summary HTML
		let summaryHTML = "";
		let hasPackages = false;

		for (const packageKey in packages) {
			const pkg = packages[packageKey];
			if (pkg.count > 0) {
				hasPackages = true;
				const percentage = Math.round((pkg.count / pkg.items.length) * 100);
				summaryHTML += `<p><strong>${pkg.name}:</strong> ${pkg.count}/${pkg.items.length} features (${percentage}%)</p>`;
			}
		}

		if (hasPackages) {
			packageSummary.innerHTML = summaryHTML;
			summarySection.classList.remove("hidden");
		} else {
			summarySection.classList.add("hidden");
		}
	}

	// Render saved cars
	function renderSavedCars() {
		if (savedCars.length === 0) {
			savedCarsList.innerHTML =
				"<p>No saved cars yet. Save a car to see it here.</p>";
			return;
		}

		savedCarsList.innerHTML = "";
		savedCars.forEach((car) => {
			const carElement = document.createElement("div");
			carElement.className = "saved-car";

			// Count checked items for this car
			let checkedCount = 0;
			let totalCount = 0;
			for (const key in car.checklist) {
				totalCount++;
				if (car.checklist[key]) checkedCount++;
			}

			carElement.innerHTML = `
                        <div class="saved-car-info">
                            <h3>${car.name}</h3>
                            <p>License: ${car.licensePlate} | ${car.timestamp}</p>
                            <p>Features: ${checkedCount}/${totalCount} checked</p>
                        </div>
                        <div class="saved-car-actions">
                            <button class="load-btn" data-id="${car.id}">Load</button>
                            <button class="delete-btn" data-id="${car.id}">Delete</button>
                        </div>
                    `;

			savedCarsList.appendChild(carElement);
		});

		// Add event listeners to load and delete buttons
		document.querySelectorAll(".load-btn").forEach((button) => {
			button.addEventListener("click", function () {
				const carId = this.getAttribute("data-id");
				loadCar(carId);
			});
		});

		document.querySelectorAll(".delete-btn").forEach((button) => {
			button.addEventListener("click", function () {
				const carId = this.getAttribute("data-id");
				deleteCar(carId);
			});
		});
	}

	// Load a saved car
	function loadCar(carId) {
		const car = savedCars.find((c) => c.id === carId);
		if (!car) return;

		carNameInput.value = car.name;
		licensePlateInput.value = car.licensePlate;
		vinNumberInput.value = car.vin || "";

		// Set checkboxes
		for (const key in car.checklist) {
			const checkbox = document.getElementById(key);
			if (checkbox) {
				checkbox.checked = car.checklist[key];
			}
		}

		updatePackageSummary();

		// Scroll to top
		window.scrollTo(0, 0);
	}

	// Delete a saved car
	function deleteCar(carId) {
		if (confirm("Are you sure you want to delete this car?")) {
			savedCars = savedCars.filter((car) => car.id !== carId);
			localStorage.setItem("bmw330eChecklist", JSON.stringify(savedCars));
			renderSavedCars();
		}
	}

	// Initial render
	renderSavedCars();
	updatePackageSummary();
});
