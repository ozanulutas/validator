import { Validator } from "./modules/validator.js";


const form = document.querySelector(".js-form");

const validator = new Validator({
  form: ".js-form",
  // inject: true // opsiyonel
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  validator.validate();
});
