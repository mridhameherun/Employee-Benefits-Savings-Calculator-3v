// Get all input elements
const numEmployeesInput = document.getElementById('numEmployees');
const avgSalaryInput = document.getElementById('avgSalary');
// Get all toggle elements
const toggleOptions = document.querySelectorAll('.toggle-option');
// Get all saving display elements
const pensionSaving = document.getElementById('pension-saving');
const bonusSaving = document.getElementById('bonus-saving');
const evSaving = document.getElementById('ev-saving');
const cycleSaving = document.getElementById('cycle-saving');
const holidaySaving = document.getElementById('holiday-saving');
const wellbeingSaving = document.getElementById('wellbeing-saving');
const totalSaving = document.getElementById('total-saving');

// ----------------- Constants (aligned to spreadsheet) -----------------
const COMPANY_NI_RATE = 0.15;

const PENSION_CONTRIBUTION_RATE = 0.05;

const BONUS_TAKE_UP_RATE = 0.10;   // 10%
const BONUS_AMOUNT_RATE = 0.20;    // 20% of salary bonus

const EV_MONTHLY_PAYMENT = 650;    // £650/month
const EV_TAKE_UP_RATE = 0.05;      // 5% take-up
const EV_VAT_SAVING = 0;           // VAT saving not applied in sheet total

const CYCLE_TAKE_UP_RATE = 0.10;   // 10% take-up
const CYCLE_MONTHLY_PAYMENT = 100; // £100/month
const CYCLE_VAT_SAVING = 200;      // £200 per participating employee per year

const HOLIDAY_TAKE_UP_RATE = 0.10; // 10% take-up
const WORKING_DAYS = 260;
const HOLIDAY_DAYS = 5;

const WELLBEING_TAKE_UP_RATE = 0.10; // 10% affected
const DAYS_LOST_PER_EMPLOYEE = 4.9;

// ----------------- Store scheme states -----------------
const schemeStates = {
    pension: true,
    bonus: true,
    ev: true,
    cycle: true,
    holiday: true,
    wellbeing: true
};

// Format currency
function formatCurrency(amount) {
    return '£' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Smooth number counting animation
function animateValue(element, start, end, duration) {
    if (element.animationId) {
        cancelAnimationFrame(element.animationId);
    }
    const startTime = performance.now();

    function updateValue(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = start + (end - start) * easeOutQuart;

        element.textContent = formatCurrency(currentValue);

        if (progress < 1) {
            element.animationId = requestAnimationFrame(updateValue);
        } else {
            element.animationId = null;
        }
    }

    element.animationId = requestAnimationFrame(updateValue);
}

// Handle toggle clicks
toggleOptions.forEach(option => {
    option.addEventListener('click', function () {
        const scheme = this.dataset.scheme;
        const value = this.dataset.value;
        schemeStates[scheme] = value === 'yes';

        const allOptions = document.querySelectorAll(`.toggle-option[data-scheme="${scheme}"]`);
        allOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');

        calculateSavings();
    });
});

// ----------------- Calculate savings (corrected) -----------------
function calculateSavings() {
    const numEmployees = parseInt(numEmployeesInput.value) || 0;
    const avgSalary = parseFloat(avgSalaryInput.value) || 0;
    let total = 0;

    // current values (for smooth animation)
    const currentPension   = parseFloat(pensionSaving.textContent.replace(/[^0-9.-]+/g, "")) || 0;
    const currentBonus     = parseFloat(bonusSaving.textContent.replace(/[^0-9.-]+/g, "")) || 0;
    const currentEv        = parseFloat(evSaving.textContent.replace(/[^0-9.-]+/g, "")) || 0;
    const currentCycle     = parseFloat(cycleSaving.textContent.replace(/[^0-9.-]+/g, "")) || 0;
    const currentHoliday   = parseFloat(holidaySaving.textContent.replace(/[^0-9.-]+/g, "")) || 0;
    const currentWellbeing = parseFloat(wellbeingSaving.textContent.replace(/[^0-9.-]+/g, "")) || 0;
    const currentTotal     = parseFloat(totalSaving.textContent.replace(/[^0-9.-]+/g, "")) || 0;

    // Pension Scheme
    if (schemeStates.pension) {
        const pensionTotal = avgSalary * PENSION_CONTRIBUTION_RATE * COMPANY_NI_RATE * numEmployees;
        animateValue(pensionSaving, currentPension, pensionTotal, 800);
        total += pensionTotal;
    } else animateValue(pensionSaving, currentPension, 0, 800);

    // Bonus Sacrifice
    if (schemeStates.bonus) {
        const participating = numEmployees * BONUS_TAKE_UP_RATE;
        const bonusTotal = avgSalary * BONUS_AMOUNT_RATE * COMPANY_NI_RATE * participating;
        animateValue(bonusSaving, currentBonus, bonusTotal, 800);
        total += bonusTotal;
    } else animateValue(bonusSaving, currentBonus, 0, 800);

    // Electric Vehicles
    if (schemeStates.ev) {
        const participating = numEmployees * EV_TAKE_UP_RATE;
        const niSavings = (EV_MONTHLY_PAYMENT * 12) * COMPANY_NI_RATE * participating;
        const evTotal = niSavings + (EV_VAT_SAVING * participating);
        animateValue(evSaving, currentEv, evTotal, 800);
        total += evTotal;
    } else animateValue(evSaving, currentEv, 0, 800);

    // Cycle to Work
    if (schemeStates.cycle) {
        const participating = numEmployees * CYCLE_TAKE_UP_RATE;
        const niSavings = (CYCLE_MONTHLY_PAYMENT * 12) * COMPANY_NI_RATE * participating;
        const vatSavings = CYCLE_VAT_SAVING * participating;
        const cycleTotal = niSavings + vatSavings;
        animateValue(cycleSaving, currentCycle, cycleTotal, 800);
        total += cycleTotal;
    } else animateValue(cycleSaving, currentCycle, 0, 800);

    // Buy Holiday
    if (schemeStates.holiday) {
        const participating = numEmployees * HOLIDAY_TAKE_UP_RATE;
        const dailySalary = avgSalary / WORKING_DAYS;
        const totalCost = dailySalary * HOLIDAY_DAYS * participating;
        const holidayTotal = totalCost * COMPANY_NI_RATE;
        animateValue(holidaySaving, currentHoliday, holidayTotal, 800);
        total += holidayTotal;
    } else animateValue(holidaySaving, currentHoliday, 0, 800);

    // Financial Wellbeing
    if (schemeStates.wellbeing) {
        const affected = numEmployees * WELLBEING_TAKE_UP_RATE;
        const wellbeingTotal = affected * DAYS_LOST_PER_EMPLOYEE * (avgSalary / WORKING_DAYS);
        animateValue(wellbeingSaving, currentWellbeing, wellbeingTotal, 800);
        total += wellbeingTotal;
    } else animateValue(wellbeingSaving, currentWellbeing, 0, 800);

    // Total
    animateValue(totalSaving, currentTotal, total, 800);
}

// Add event listeners
numEmployeesInput.addEventListener('input', calculateSavings);
avgSalaryInput.addEventListener('input', calculateSavings);

// Initial calculation
calculateSavings();
