// BMW 330e M Sport Ultimate Checklist Application
class BMWChecklistApp {
	constructor() {
		this.savedCars = JSON.parse(localStorage.getItem("bmw330eChecklist")) || [];
		this.currentCarId = null;
		this.syncEnabled = localStorage.getItem("bmwSyncEnabled") === "true";
		this.googleDriveToken = localStorage.getItem("bmwGoogleDriveToken");
		this.init();
	}

	init() {
		this.setupEventListeners();
		this.setupColorPreview();
		this.renderSavedCars();
		this.updatePackageSummary();
		this.autoSaveTimer = setInterval(() => this.autoSave(), 30000); // Auto-save every 30 seconds
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
				this.autoSave();
			});
		});

		// Color selection
		document.getElementById("exteriorColor").addEventListener("change", (e) => {
			this.updateColorPreview();
			this.autoSave();
		});

		document.getElementById("interiorColor").addEventListener("change", (e) => {
			this.updateColorPreview();
			this.autoSave();
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

		// Sync and export/import buttons
		document
			.getElementById("syncBtn")
			.addEventListener("click", () => this.showSyncModal());
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

		// Sync modal buttons
		document
			.getElementById("googleSyncBtn")
			.addEventListener("click", () => this.setupGoogleDriveSync());
		document
			.getElementById("exportBackupBtn")
			.addEventListener("click", () => this.exportBackup());
		document
			.getElementById("importBackupBtn")
			.addEventListener("click", () =>
				document.getElementById("importFile").click()
			);
		document
			.getElementById("qrCodeBtn")
			.addEventListener("click", () => this.generateQRCode());

		// Modal events
		document.querySelectorAll(".close").forEach((closeBtn) => {
			closeBtn.addEventListener("click", () => this.closeAllModals());
		});

		document.getElementById("syncDismiss").addEventListener("click", () => {
			document.getElementById("syncStatus").classList.add("hidden");
		});

		// Close modal when clicking outside
		window.addEventListener("click", (e) => {
			if (e.target.classList.contains("modal")) {
				this.closeAllModals();
			}
		});

		// Sync status indicator
		document
			.getElementById("modalLoadBtn")
			.addEventListener("click", () => this.loadSelectedCar());
		document
			.getElementById("modalDeleteBtn")
			.addEventListener("click", () => this.deleteSelectedCar());

		// Auto-save on form changes
		const formInputs = document.querySelectorAll(
			"#carName, #licensePlate, #vinNumber, #carPrice, #carNotes"
		);
		formInputs.forEach((input) => {
			input.addEventListener("input", () => this.autoSave());
		});
	}

	setupColorPreview() {
		this.updateColorPreview();
	}

	updateColorPreview() {
		const exteriorColor = document.getElementById("exteriorColor").value;
		const interiorColor = document.getElementById("interiorColor").value;

		const exteriorSwatch = document.getElementById("exteriorSwatch");
		const interiorSwatch = document.getElementById("interiorSwatch");

		if (exteriorColor) {
			exteriorSwatch.style.backgroundColor = this.getColorValue(exteriorColor);
			exteriorSwatch.setAttribute("data-color", exteriorColor);
			exteriorSwatch.textContent = this.getColorName(exteriorColor);
		} else {
			exteriorSwatch.style.backgroundColor = "#f0f0f0";
			exteriorSwatch.removeAttribute("data-color");
			exteriorSwatch.textContent = "Exterior";
			exteriorSwatch.style.color = "#333";
		}

		if (interiorColor) {
			interiorSwatch.style.backgroundColor = this.getColorValue(interiorColor);
			interiorSwatch.setAttribute("data-color", interiorColor);
			interiorSwatch.textContent = this.getColorName(interiorColor);
		} else {
			interiorSwatch.style.backgroundColor = "#f0f0f0";
			interiorSwatch.removeAttribute("data-color");
			interiorSwatch.textContent = "Interior";
			interiorSwatch.style.color = "#333";
		}
	}

	getColorValue(colorKey) {
		const colorMap = {
			// Exterior colors
			"alpine-white": "#ffffff",
			"black-sapphire": "#1c1c1c",
			"mineral-grey": "#5a5d5f",
			"mediterranean-blue": "#1560bd",
			"glacier-silver": "#a1a3a5",
			"carbon-black": "#1e1e1e",
			bluestone: "#5d7b93",
			"sunset-orange": "#d15e28",
			"tanzanite-blue": "#1e3a5f",
			"dravit-grey": "#5c5c5c",
			"oxide-grey": "#6b6b6b",
			"arctic-race-blue": "#0066b3",

			// Interior colors
			"sensatec-black": "#1a1a1a",
			"sensatec-mocha": "#8b7355",
			"sensatec-cognac": "#b38e5d",
			"vernasca-black": "#1a1a1a",
			"vernasca-mocha": "#8b7355",
			"vernasca-cognac": "#b38e5d",
			"vernasca-tartufo": "#a67c52",
			"vernasca-canberra": "#e8d9c5",
			"individual-ivory": "#f5f5dc",
			"individual-black": "#1a1a1a",
			"individual-tartufo": "#a67c52",
		};

		return colorMap[colorKey] || "#f0f0f0";
	}

	getColorName(colorKey) {
		const nameMap = {
			// Exterior colors
			"alpine-white": "Alpine White",
			"black-sapphire": "Black Sapphire",
			"mineral-grey": "Mineral Grey",
			"mediterranean-blue": "Mediterranean Blue",
			"glacier-silver": "Glacier Silver",
			"carbon-black": "Carbon Black",
			bluestone: "Bluestone",
			"sunset-orange": "Sunset Orange",
			"tanzanite-blue": "Tanzanite Blue",
			"dravit-grey": "Dravit Grey",
			"oxide-grey": "Oxide Grey",
			"arctic-race-blue": "Arctic Race Blue",

			// Interior colors
			"sensatec-black": "Black SensaTec",
			"sensatec-mocha": "Mocha SensaTec",
			"sensatec-cognac": "Cognac SensaTec",
			"vernasca-black": "Black Vernasca",
			"vernasca-mocha": "Mocha Vernasca",
			"vernasca-cognac": "Cognac Vernasca",
			"vernasca-tartufo": "Tartufo Vernasca",
			"vernasca-canberra": "Canberra Beige",
			"individual-ivory": "Ivory White",
			"individual-black": "Black Merino",
			"individual-tartufo": "Tartufo Merino",
		};

		return nameMap[colorKey] || "Select Color";
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
					"msportLEDLights",
					"msportSteering",
					"msportSeats",
					"msportUpholstery",
					"msportInteriorTrim",
					"msportAnthracite",
					"msportSuspension",
					"msportPaddles",
				],
				checked: 0,
			},
			comfort: {
				name: "Comfort Pack",
				items: [
					"comfortAutoTailgate",
					"comfortAccess",
					"comfortLumbar",
					"comfortAmbient",
					"comfortWireless",
				],
				checked: 0,
			},
			technology: {
				name: "Technology Pack",
				items: [
					"techDrivingAssistant",
					"techLiveCockpitPro",
					"techParkingAssistant",
					"techHeadUp",
				],
				checked: 0,
			},
			executive: {
				name: "Executive Pack",
				items: [
					"execAdaptiveLED",
					"execHarmanKardon",
					"execHeatedSteering",
					"execSunProtection",
				],
				checked: 0,
			},
			exterior: {
				name: "Exterior Options",
				items: [
					"extMetallicPaint",
					"ext19InchWheels",
					"extMSportBrakes",
					"extPanoramicRoof",
					"extAdaptiveSuspension",
				],
				checked: 0,
			},
			interior: {
				name: "Interior Options",
				items: [
					"intVernascaLeather",
					"intHeatedSeats",
					"intMemorySeats",
					"intSplitRear",
					"intExtendedStorage",
				],
				checked: 0,
			},
			"tech-features": {
				name: "Technology Features",
				items: [
					"techLiveCockpitPlus",
					"techBMWOnline",
					"techTeleservices",
					"techConnectedPackage",
					"techAppleCarPlay",
					"techDAB",
					"techGestureControl",
				],
				checked: 0,
			},
			mechanical: {
				name: "Mechanical",
				items: [
					"mechXtraBoost",
					"mechDrivingModes",
					"mechChargingCable",
					"mechEDriveSound",
					"mechMSportDiff",
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
			exteriorColor: document.getElementById("exteriorColor").value,
			interiorColor: document.getElementById("interiorColor").value,
			notes: document.getElementById("carNotes").value.trim(),
			timestamp: new Date().toLocaleString(),
			lastModified: new Date().toISOString(),
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

		this.saveToStorage();
		this.renderSavedCars();
		this.showSyncMessage("Car saved successfully!", "success");

		// Reset current car ID after saving
		this.currentCarId = null;
	}

	saveToStorage() {
		localStorage.setItem("bmw330eChecklist", JSON.stringify(this.savedCars));

		// If sync is enabled, sync to cloud
		if (this.syncEnabled) {
			this.syncToCloud();
		}
	}

	clearForm() {
		if (confirm("Are you sure you want to clear the form?")) {
			document.getElementById("carName").value = "";
			document.getElementById("licensePlate").value = "";
			document.getElementById("vinNumber").value = "";
			document.getElementById("carPrice").value = "";
			document.getElementById("exteriorColor").value = "";
			document.getElementById("interiorColor").value = "";
			document.getElementById("carNotes").value = "";
			document
				.querySelectorAll('input[type="checkbox"]')
				.forEach((checkbox) => {
					checkbox.checked = false;
					this.updateChecklistItemState(checkbox);
				});
			this.updatePackageSummary();
			this.updateColorPreview();
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

			// Create color indicators
			let colorHTML = "";
			if (car.exteriorColor) {
				const extColor = this.getColorValue(car.exteriorColor);
				colorHTML += `<div class="color-indicator" style="background-color: ${extColor}" title="${this.getColorName(
					car.exteriorColor
				)}"></div>`;
			}
			if (car.interiorColor) {
				const intColor = this.getColorValue(car.interiorColor);
				colorHTML += `<div class="color-indicator" style="background-color: ${intColor}" title="${this.getColorName(
					car.interiorColor
				)}"></div>`;
			}

			carElement.innerHTML = `
                <div class="saved-car-info">
                    <h3>${car.name}</h3>
                    <div class="saved-car-details">
                        <span>License: ${car.licensePlate}</span>
                        <span>VIN: ${car.vin || "N/A"}</span>
                        ${car.price ? `<span>Price: £${car.price}</span>` : ""}
                        <span>Saved: ${car.timestamp}</span>
                    </div>
                    ${
											colorHTML
												? `<div class="saved-car-color">${colorHTML}</div>`
												: ""
										}
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
                ${
									car.exteriorColor
										? `<p><strong>Exterior Color:</strong> ${this.getColorName(
												car.exteriorColor
										  )}</p>`
										: ""
								}
                ${
									car.interiorColor
										? `<p><strong>Interior Color:</strong> ${this.getColorName(
												car.interiorColor
										  )}</p>`
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
		document.getElementById("exteriorColor").value = car.exteriorColor || "";
		document.getElementById("interiorColor").value = car.interiorColor || "";
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
		this.updateColorPreview();
		this.currentCarId = carId;

		// Scroll to top
		window.scrollTo(0, 0);

		// Close modal if open
		this.closeAllModals();
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
			this.saveToStorage();
			this.renderSavedCars();
			this.closeAllModals();

			// If we're currently editing this car, clear the form
			if (this.currentCarId === carId) {
				this.clearForm();
			}
		}
	}

	closeAllModals() {
		document.querySelectorAll(".modal").forEach((modal) => {
			modal.style.display = "none";
		});
	}

	toggleQuickCheckMode() {
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

	// Sync and Cloud Storage Functions
	showSyncModal() {
		document.getElementById("syncModal").style.display = "block";
	}

	setupGoogleDriveSync() {
		// In a real implementation, this would use Google Drive API
		// For demo purposes, we'll simulate the process
		this.showSyncMessage("Connecting to Google Drive...", "warning");

		setTimeout(() => {
			this.syncEnabled = true;
			localStorage.setItem("bmwSyncEnabled", "true");
			this.showSyncMessage("Google Drive connected successfully!", "success");
			this.syncToCloud();
		}, 2000);
	}

	syncToCloud() {
		// Simulate cloud sync
		this.showSyncMessage("Syncing data to cloud...", "warning");

		setTimeout(() => {
			// In a real app, this would upload to cloud storage
			localStorage.setItem("bmwCloudBackup", JSON.stringify(this.savedCars));
			this.showSyncMessage("Data synced successfully!", "success");
		}, 1500);
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

		this.showSyncMessage("Data exported successfully!", "success");
	}

	exportBackup() {
		const backupData = {
			version: "1.0",
			exportDate: new Date().toISOString(),
			cars: this.savedCars,
		};

		const dataStr = JSON.stringify(backupData, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });

		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `bmw_checklist_backup_${
			new Date().toISOString().split("T")[0]
		}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		this.showSyncMessage("Backup exported successfully!", "success");
	}

	importData(event) {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const importedData = JSON.parse(e.target.result);
				let carsToImport = [];

				// Handle both backup format and simple array format
				if (importedData.cars && Array.isArray(importedData.cars)) {
					carsToImport = importedData.cars;
				} else if (Array.isArray(importedData)) {
					carsToImport = importedData;
				} else {
					throw new Error("Invalid file format");
				}

				if (
					confirm(
						`This will import ${carsToImport.length} car(s). Do you want to proceed?`
					)
				) {
					this.savedCars = carsToImport;
					this.saveToStorage();
					this.renderSavedCars();
					this.showSyncMessage("Data imported successfully!", "success");
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

	generateQRCode() {
		// In a real implementation, this would use a QR code library
		// For demo, we'll show a message
		this.showSyncMessage(
			"QR code feature requires additional libraries",
			"warning"
		);

		// Example of how it would work:
		// const qr = new QRCode(document.getElementById("qrcode"), {
		//     text: JSON.stringify(this.savedCars),
		//     width: 256,
		//     height: 256
		// });
	}

	showSyncMessage(message, type = "info") {
		const syncStatus = document.getElementById("syncStatus");
		const syncMessage = document.getElementById("syncMessage");

		syncMessage.textContent = message;
		syncStatus.className = `sync-status ${type}`;
		syncStatus.classList.remove("hidden");

		// Auto-hide after 5 seconds
		setTimeout(() => {
			syncStatus.classList.add("hidden");
		}, 5000);
	}

	autoSave() {
		// Only auto-save if we have data in the form
		const carName = document.getElementById("carName").value.trim();
		const licensePlate = document.getElementById("licensePlate").value.trim();

		if (carName && licensePlate) {
			// Create a temporary auto-save
			const autoSaveData = {
				carName,
				licensePlate,
				vin: document.getElementById("vinNumber").value.trim(),
				price: document.getElementById("carPrice").value.trim(),
				exteriorColor: document.getElementById("exteriorColor").value,
				interiorColor: document.getElementById("interiorColor").value,
				notes: document.getElementById("carNotes").value.trim(),
				checklist: this.getChecklistData(),
				lastAutoSave: new Date().toISOString(),
			};

			localStorage.setItem("bmwAutoSave", JSON.stringify(autoSaveData));
		}
	}

	loadAutoSave() {
		const autoSaveData = localStorage.getItem("bmwAutoSave");
		if (autoSaveData) {
			try {
				const data = JSON.parse(autoSaveData);
				if (confirm("Found auto-saved data. Would you like to restore it?")) {
					document.getElementById("carName").value = data.carName || "";
					document.getElementById("licensePlate").value =
						data.licensePlate || "";
					document.getElementById("vinNumber").value = data.vin || "";
					document.getElementById("carPrice").value = data.price || "";
					document.getElementById("exteriorColor").value =
						data.exteriorColor || "";
					document.getElementById("interiorColor").value =
						data.interiorColor || "";
					document.getElementById("carNotes").value = data.notes || "";

					// Set checkboxes
					if (data.checklist) {
						for (const key in data.checklist) {
							const checkbox = document.getElementById(key);
							if (checkbox) {
								checkbox.checked = data.checklist[key].checked;
								this.updateChecklistItemState(checkbox);
							}
						}
					}

					this.updatePackageSummary();
					this.updateColorPreview();
					this.showSyncMessage("Auto-saved data restored!", "success");
				}
			} catch (error) {
				console.error("Error loading auto-save:", error);
			}
		}
	}
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	const app = new BMWChecklistApp();
	// Load auto-save data if available
	setTimeout(() => app.loadAutoSave(), 1000);

	// Register service worker for PWA functionality
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker
			.register("/sw.js")
			.then((registration) => console.log("SW registered"))
			.catch((err) => console.log("SW registration failed"));
	}
});
