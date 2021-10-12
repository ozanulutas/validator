import { Validator } from "./modules/validator.js";


const form = document.querySelector(".js-form");

const validator = new Validator();
validator.addRule("çükübik", {
  method: (element) => element.value === "çükübik",
  message: () => "Çükübik^^"
});

validator.init({
  form: ".js-form",
  inject: true, // opsiyonel
  onInput: true, // opsiyonel
  handleError: () => console.log("notvalid"), // opsiyonel
  customMessages: { // opsiyonel
    name: {
      // required: "Doldur işte beya",
      "çükübik": "Çükübik!!!"
    },
    phone: {
      // minlen: "asdasd",
      required: "Doldur işte beyazzzz",
    },
  },

});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  validator.isValid();
});
