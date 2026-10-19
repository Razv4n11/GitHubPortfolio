const contactForm = document.getElementById("contactForm");
const fields = {
    name: {
        input: document.getElementById("name"),
        error: document.getElementById("nameError"),
        message: "Introdu numele tau."
    },
    email: {
        input: document.getElementById("email"),
        error: document.getElementById("emailError"),
        message: "Introdu o adresa de email valida."
    },
    message: {
        input: document.getElementById("message"),
        error: document.getElementById("messageError"),
        message: "Scrie un mesaj."
    }
};
const formFeedback = document.getElementById("formFeedback");
const messageCounter = document.getElementById("messageCounter");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxMessageLength = 1000;

function updateMessageCounter() {
    const messageLength = fields.message.input.value.length;
    messageCounter.textContent = `${messageLength}/${maxMessageLength} caractere`;
    if (messageLength === maxMessageLength) {
        fields.message.error.textContent = "Ai atins numarul maxim de 1000 de caractere.";
    }
}

function validateField(field) {
    const value = field.input.value.trim();
    const isEmail = field.input.type === "email";
    const valid = value.length > 0 && (!isEmail || emailRegex.test(value));

    field.error.textContent = valid ? "" : field.message;
    field.input.setAttribute("aria-invalid", String(!valid));
    return valid;
}

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = Object.values(fields).every(validateField);

    if (!valid) {
        formFeedback.textContent = "Verifica datele introduse si incearca din nou.";
        formFeedback.className = "form-feedback is-error";
        return;
    }

    formFeedback.textContent = "Mesajul este valid si poate fi trimis.";
    formFeedback.className = "form-feedback is-success";
    contactForm.reset();
    updateMessageCounter();
    Object.values(fields).forEach((field) => field.input.removeAttribute("aria-invalid"));
});

Object.values(fields).forEach((field) => {
    field.input.addEventListener("input", () => validateField(field));
});

fields.message.input.addEventListener("input", updateMessageCounter);
updateMessageCounter();
