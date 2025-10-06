// BMW 330e M Sport Ultimate Checklist Application
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
				this.updateChecklistItemState(checkbox);
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
		document
			.getElementById("quickCheckBtn")
			.addEventListener("click", () => this.toggleQuickCheckMode());

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

	updateChecklistItemState(checkbox) {
		const checklistItem = checkbox.closest(".checklist-item");
		if (checkbox.checked) {
			checklistItem.classList.add("checked");
		} else {
			checklistItem.classList.remove("checked");
		}
	}

	getChecklistData() {
		const checklistData = {};
		document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
			checklistData[checkbox.id] = {
				checked: checkbox.checked,
				package: checkbox.getAttribute("data-package"),
				importance: checkbox.getAttribute("data-importance"),
				label:
					checkbox.nextElementSibling.querySelector(".item-title").textContent,
			};
		});
		return checklistData;
	}

	updatePackageSummary() {
		const packages = {
			"m-sport": {
				name: "M Sport Package",
				items: [
					"msportWheels",
					"msportShadowline",
					"msportBodykit",
					"msportMirrors",
					"msportSteering",
					"msportSeats",
					"msportUpholstery",
					"msportTrim",
					"msportHeadlining",
					"msportAircon",
					"msportHeatedSeats",
					"msportSeatAdjust",
					"msportRearSeats",
					"msportHeadrests",
					"msportStorage",
				],
				checked: 0,
			},
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
				name: "Exterior Options",
				items: [
					"extAdaptiveSuspension",
					"extMSportBrakes",
					"ext19InchWheels",
					"extPowerTailgate",
					"extSunroof",
					"extMetallicPaint",
				],
				checked: 0,
			},
			interior: {
				name: "Interior Options",
				items: [
					"intVernascaLeather",
					"intAmbientLighting",
					"intMemorySeats",
					"intRearHeated",
				],
				checked: 0,
			},
			technology: {
				name: "Technology",
				items: [
					"techLiveCockpitPlus",
					"techWidescreen",
					"techOnlineServices",
					"techTeleservices",
					"techConnectedPro",
					"techPersonalESIM",
					"techDAB",
					"techAppleCarPlay",
				],
				checked: 0,
			},
			mechanical: {
				name: "Mechanical",
				items: [
					"mechXtraBoost",
					"mechMSportDiff",
					"mechDrivingModes",
					"mechChargingCable",
					"mechEDriveSound",
				],
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
		let totalChecked = 0;
		let totalItems = 0;

		for (const packageKey in packages) {
			const pkg = packages[packageKey];
			if (pkg.items.length > 0) {
				hasPackages = true;
				const percentage =
					pkg.items.length > 0
						? Math.round((pkg.checked / pkg.items.length) * 100)
						: 0;
				totalChecked += pkg.checked;
				totalItems += pkg.items.length;

				summaryHTML += `
                    <div class="summary-card">
                        <h4>${pkg.name}</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="summary-stats">
                            <span>${pkg.checked}/${pkg.items.length}</span>
                            <span>${percentage}%</span>
                        </div>
                    </div>
                `;
			}
		}

		const overallPercentage =
			totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

		const packageSummary = document.getElementById("packageSummary");
		if (hasPackages) {
			summaryHTML = `
                <div class="overall-summary" style="margin-bottom: 20px; padding: 15px; background: #e9f7fe; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #0066b3;">Overall Progress: ${totalChecked}/${totalItems} items (${overallPercentage}%)</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${overallPercentage}%"></div>
                    </div>
                </div>
                <div class="package-summary">${summaryHTML}</div>
            `;
			packageSummary.innerHTML = summaryHTML;
		} else {
			packageSummary.innerHTML =
				'<div class="summary-placeholder">Complete some checks to see detailed summary</div>';
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
			price: document.getElementById("carPrice").value.trim(),
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
			document.getElementById("carPrice").value = "";
			document.getElementById("carNotes").value = "";
			document
				.querySelectorAll('input[type="checkbox"]')
				.forEach((checkbox) => {
					checkbox.checked = false;
					this.updateChecklistItemState(checkbox);
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
                        ${car.price ? `<span>Price: £${car.price}</span>` : ""}
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
                ${
									car.price
										? `<p><strong>Price:</strong> £${car.price}</p>`
										: ""
								}
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
				detailsHTML += `<li>${car.checklist[key].label}</li>`;
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
		document.getElementById("carPrice").value = car.price || "";
		document.getElementById("carNotes").value = car.notes || "";

		// Set checkboxes
		for (const key in car.checklist) {
			const checkbox = document.getElementById(key);
			if (checkbox) {
				checkbox.checked = car.checklist[key].checked;
				this.updateChecklistItemState(checkbox);
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

	toggleQuickCheckMode() {
		// This would implement a simplified view for quick checking
		// For now, just scroll to the first unchecked item
		const firstUnchecked = document.querySelector(
			'input[type="checkbox"]:not(:checked)'
		);
		if (firstUnchecked) {
			firstUnchecked.scrollIntoView({ behavior: "smooth", block: "center" });
			// Highlight the item temporarily
			const item = firstUnchecked.closest(".checklist-item");
			item.style.backgroundColor = "#fff3cd";
			setTimeout(() => {
				item.style.backgroundColor = "";
			}, 2000);
		} else {
			alert("All items have been checked!");
		}
	}

	exportData() {
		const dataStr = JSON.stringify(this.savedCars, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });

		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "bmw_330e_m_sport_checklist.json";
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
