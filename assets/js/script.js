// BMW 330e M Sport Checklist Application
class BMWChecklistApp {
	constructor() {
		this.savedCars = JSON.parse(localStorage.getItem("bmw330eChecklist")) || [];
		this.currentCarId = null;
		this.init();
	}

	init() {
		this.setupEventListeners();
		this.renderSavedCars();
		this.updatePackageSummary();
	}

	setupEventListeners() {
		// Tab navigation
		document.querySelectorAll(".tab-button").forEach((button) => {
			button.addEventListener("click", (e) => {
				this.switchTab(e.target.getAttribute("data-tab"));
			});
		});

		// Checklist item changes
		document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
			checkbox.addEventListener("change", () => {
				this.updatePackageSummary();
			});
		});

		// Action buttons
		document
			.getElementById("saveBtn")
			.addEventListener("click", () => this.saveCar());
		document
			.getElementById("clearBtn")
			.addEventListener("click", () => this.clearForm());

		// Export/Import buttons
		document
			.getElementById("exportBtn")
			.addEventListener("click", () => this.exportData());
		document
			.getElementById("importBtn")
			.addEventListener("click", () =>
				document.getElementById("importFile").click()
			);
		document
			.getElementById("importFile")
			.addEventListener("change", (e) => this.importData(e));

		// Modal events
		document
			.querySelector(".close")
			.addEventListener("click", () => this.closeModal());
		document
			.getElementById("modalLoadBtn")
			.addEventListener("click", () => this.loadSelectedCar());
		document
			.getElementById("modalDeleteBtn")
			.addEventListener("click", () => this.deleteSelectedCar());

		// Close modal when clicking outside
		window.addEventListener("click", (e) => {
			const modal = document.getElementById("carModal");
			if (e.target === modal) {
				this.closeModal();
			}
		});
	}

	switchTab(tabName) {
		// Update tab buttons
		document.querySelectorAll(".tab-button").forEach((button) => {
			button.classList.remove("active");
		});
		document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

		// Update tab content
		document.querySelectorAll(".tab-content").forEach((content) => {
			content.classList.remove("active");
		});
		document.getElementById(`${tabName}-tab`).classList.add("active");
	}

	getChecklistData() {
		const checklistData = {};
		document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
			checklistData[checkbox.id] = {
				checked: checkbox.checked,
				package: checkbox.getAttribute("data-package"),
				importance: checkbox.getAttribute("data-importance"),
			};
		});
		return checklistData;
	}

	updatePackageSummary() {
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
				checked: 0,
			},
			premium: {
				name: "Premium Package",
				items: [
					"premHeadUpDisplay",
					"premComfortAccess",
					"premLiveCockpitPro",
					"premLumbarSupport",
				],
				checked: 0,
			},
			driving: {
				name: "Driving Assistance",
				items: [
					"driveAssistActiveCruise",
					"driveAssistLaneKeep",
					"driveAssistBlindSpot",
				],
				checked: 0,
			},
			parking: {
				name: "Parking Assistance",
				items: ["parkSurroundView", "parkReversingAssistant"],
				checked: 0,
			},
			exterior: {
				name: "Exterior Features",
				items: [
					"extAdaptiveSuspension",
					"extMSportBrakes",
					"ext19InchWheels",
					"extPowerTailgate",
					"extSunroof",
				],
				checked: 0,
			},
			interior: {
				name: "Interior Features",
				items: [
					"intHeatedSeats",
					"intVernascaLeather",
					"intAmbientLighting",
					"intMSportSteering",
				],
				checked: 0,
			},
			mechanical: {
				name: "Mechanical Features",
				items: ["mechXtraBoost", "mechMSportDiff", "mechDrivingModes"],
				checked: 0,
			},
		};

		// Count checked items for each package
		for (const packageKey in packages) {
			packages[packageKey].checked = packages[packageKey].items.filter(
				(item) => {
					const checkbox = document.getElementById(item);
					return checkbox ? checkbox.checked : false;
				}
			).length;
		}

		// Generate summary HTML
		let summaryHTML = "";
		let hasPackages = false;

		for (const packageKey in packages) {
			const pkg = packages[packageKey];
			if (pkg.items.length > 0) {
				hasPackages = true;
				const percentage =
					pkg.items.length > 0
						? Math.round((pkg.checked / pkg.items.length) * 100)
						: 0;

				summaryHTML += `
                    <div class="summary-card">
                        <h4>${pkg.name}</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="summary-stats">
                            <span>${pkg.checked}/${pkg.items.length} features</span>
                            <span>${percentage}% complete</span>
                        </div>
                    </div>
                `;
			}
		}

		const packageSummary = document.getElementById("packageSummary");
		if (hasPackages) {
			packageSummary.innerHTML = `<div class="package-summary">${summaryHTML}</div>`;
		} else {
			packageSummary.innerHTML =
				'<div class="summary-placeholder">Complete some checks to see package summary</div>';
		}
	}

	saveCar() {
		const carName = document.getElementById("carName").value.trim();
		const licensePlate = document.getElementById("licensePlate").value.trim();

		if (!carName || !licensePlate) {
			alert("Please enter both a car name and license plate number");
			return;
		}

		const carData = {
			id: this.currentCarId || Date.now().toString(),
			name: carName,
			licensePlate: licensePlate,
			vin: document.getElementById("vinNumber").value.trim(),
			notes: document.getElementById("carNotes").value.trim(),
			timestamp: new Date().toLocaleString(),
			checklist: this.getChecklistData(),
		};

		// Check if car with same license plate already exists
		const existingIndex = this.savedCars.findIndex(
			(car) =>
				car.licensePlate.toLowerCase() === licensePlate.toLowerCase() &&
				car.id !== this.currentCarId
		);

		if (existingIndex !== -1) {
			if (
				!confirm(
					"A car with this license plate already exists. Do you want to overwrite it?"
				)
			) {
				return;
			}
			this.savedCars[existingIndex] = carData;
		} else if (this.currentCarId) {
			// Update existing car
			const index = this.savedCars.findIndex(
				(car) => car.id === this.currentCarId
			);
			if (index !== -1) {
				this.savedCars[index] = carData;
			}
		} else {
			// Add new car
			this.savedCars.push(carData);
		}

		localStorage.setItem("bmw330eChecklist", JSON.stringify(this.savedCars));
		this.renderSavedCars();
		alert("Car saved successfully!");

		// Reset current car ID after saving
		this.currentCarId = null;
	}

	clearForm() {
		if (confirm("Are you sure you want to clear the form?")) {
			document.getElementById("carName").value = "";
			document.getElementById("licensePlate").value = "";
			document.getElementById("vinNumber").value = "";
			document.getElementById("carNotes").value = "";
			document
				.querySelectorAll('input[type="checkbox"]')
				.forEach((checkbox) => {
					checkbox.checked = false;
				});
			this.updatePackageSummary();
			this.currentCarId = null;
		}
	}

	renderSavedCars() {
		const savedCarsList = document.getElementById("savedCarsList");

		if (this.savedCars.length === 0) {
			savedCarsList.innerHTML =
				'<div class="empty-state">No saved cars yet. Save a car to see it here.</div>';
			return;
		}

		savedCarsList.innerHTML = "";
		this.savedCars.forEach((car) => {
			// Count checked items for this car
			let checkedCount = 0;
			let totalCount = 0;
			for (const key in car.checklist) {
				totalCount++;
				if (car.checklist[key].checked) checkedCount++;
			}

			const completionPercentage =
				totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

			const carElement = document.createElement("div");
			carElement.className = "saved-car-card";
			carElement.innerHTML = `
                <div class="saved-car-info">
                    <h3>${car.name}</h3>
                    <div class="saved-car-details">
                        <span>License: ${car.licensePlate}</span>
                        <span>VIN: ${car.vin || "N/A"}</span>
                        <span>Saved: ${car.timestamp}</span>
                    </div>
                    <div class="saved-car-progress">
                        ${checkedCount}/${totalCount} features checked (${completionPercentage}%)
                    </div>
                </div>
                <div class="saved-car-actions">
                    <button class="btn-primary view-car" data-id="${
											car.id
										}">View</button>
                    <button class="btn-secondary load-car" data-id="${
											car.id
										}">Load</button>
                </div>
            `;

			savedCarsList.appendChild(carElement);
		});

		// Add event listeners to view and load buttons
		document.querySelectorAll(".view-car").forEach((button) => {
			button.addEventListener("click", (e) => {
				const carId = e.target.getAttribute("data-id");
				this.viewCarDetails(carId);
			});
		});

		document.querySelectorAll(".load-car").forEach((button) => {
			button.addEventListener("click", (e) => {
				const carId = e.target.getAttribute("data-id");
				this.loadCar(carId);
			});
		});
	}

	viewCarDetails(carId) {
		const car = this.savedCars.find((c) => c.id === carId);
		if (!car) return;

		document.getElementById("modalCarName").textContent = car.name;

		let detailsHTML = `
            <div class="car-details">
                <p><strong>License Plate:</strong> ${car.licensePlate}</p>
                <p><strong>VIN:</strong> ${car.vin || "N/A"}</p>
                <p><strong>Saved:</strong> ${car.timestamp}</p>
                ${
									car.notes ? `<p><strong>Notes:</strong> ${car.notes}</p>` : ""
								}
            </div>
            <div class="car-features">
                <h3>Features Checked</h3>
                <ul>
        `;

		// Add checked features to the list
		for (const key in car.checklist) {
			if (car.checklist[key].checked) {
				const checkbox = document.getElementById(key);
				if (checkbox) {
					const label = checkbox.nextElementSibling;
					const title = label.querySelector(".item-title").textContent;
					detailsHTML += `<li>${title}</li>`;
				}
			}
		}

		detailsHTML += `</ul></div>`;

		document.getElementById("modalCarDetails").innerHTML = detailsHTML;
		document.getElementById("modalLoadBtn").setAttribute("data-id", carId);
		document.getElementById("modalDeleteBtn").setAttribute("data-id", carId);

		document.getElementById("carModal").style.display = "block";
	}

	loadCar(carId) {
		const car = this.savedCars.find((c) => c.id === carId);
		if (!car) return;

		document.getElementById("carName").value = car.name;
		document.getElementById("licensePlate").value = car.licensePlate;
		document.getElementById("vinNumber").value = car.vin || "";
		document.getElementById("carNotes").value = car.notes || "";

		// Set checkboxes
		for (const key in car.checklist) {
			const checkbox = document.getElementById(key);
			if (checkbox) {
				checkbox.checked = car.checklist[key].checked;
			}
		}

		this.updatePackageSummary();
		this.currentCarId = carId;

		// Scroll to top
		window.scrollTo(0, 0);

		// Close modal if open
		this.closeModal();
	}

	loadSelectedCar() {
		const carId = document
			.getElementById("modalLoadBtn")
			.getAttribute("data-id");
		this.loadCar(carId);
	}

	deleteSelectedCar() {
		const carId = document
			.getElementById("modalDeleteBtn")
			.getAttribute("data-id");
		this.deleteCar(carId);
	}

	deleteCar(carId) {
		if (confirm("Are you sure you want to delete this car?")) {
			this.savedCars = this.savedCars.filter((car) => car.id !== carId);
			localStorage.setItem("bmw330eChecklist", JSON.stringify(this.savedCars));
			this.renderSavedCars();
			this.closeModal();

			// If we're currently editing this car, clear the form
			if (this.currentCarId === carId) {
				this.clearForm();
			}
		}
	}

	closeModal() {
		document.getElementById("carModal").style.display = "none";
	}

	exportData() {
		const dataStr = JSON.stringify(this.savedCars, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });

		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "bmw_330e_checklist_data.json";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	importData(event) {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const importedData = JSON.parse(e.target.result);

				if (Array.isArray(importedData)) {
					if (
						confirm(
							`This will import ${importedData.length} car(s). Do you want to proceed?`
						)
					) {
						this.savedCars = importedData;
						localStorage.setItem(
							"bmw330eChecklist",
							JSON.stringify(this.savedCars)
						);
						this.renderSavedCars();
						alert("Data imported successfully!");
					}
				} else {
					alert(
						"Invalid file format. Please select a valid JSON file exported from this app."
					);
				}
			} catch (error) {
				alert("Error reading file. Please make sure it's a valid JSON file.");
				console.error("Import error:", error);
			}
		};

		reader.readAsText(file);
		// Reset the file input
		event.target.value = "";
	}
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	new BMWChecklistApp();
});
