import ValidatonRules from "./rules.js";

class Validator {

  constructor(props) {
    this.form = {};
    this.formElements = [];
    this.inject = false;
    this.onInput = false;
    this.handleError = () => { };

    this.inputs = []; // Form içindeki data-rules'u belirtilmiş elemtler ve rule'ları

    this.isFormValid = true;
    this.ruleParam = null; // elementin data-rule'undaki rule parametresi (rule[param])
    this.nonValids = []; // valid olmayan elementler
    this.unsatisfiedRules = []; // benzersiz valid olmayan rule'lar
    this.messages = [];

    this.customMessages = {};
    this.validatonRules = new ValidatonRules();

    if(props) {
      this.init(props);
    }
  }

  setProps(props) {
    this.form = document.querySelector(props.form);
    this.formElements = [...this.form];
    this.inject = props.inject ? props.inject : false;
    this.onInput = props.onInput ? props.onInput : false;
    this.handleError = props.handleError ? props.handleError : () => { };
    
    this.customMessages = props.customMessages ? props.customMessages : {};
  }

  init(props) {
    this.setProps(props);

    this.setInputs();

    if (this.inject) {
      this.renderErrorContainers();
    }
    if (this.onInput) {
      this.validateOnInput();
    }
  }

  // Form içindeki data-rules'u belirtilmiş elementleri alır
  setInputs() {
    this.formElements.forEach((formItem) => {
      if (formItem.dataset.rules) {
        this.inputs.push({
          element: formItem,
          name: formItem.name,
          rules: formItem.dataset.rules.split("|"),
          errors: [],
        });
      }
    });
    // console.log("setInputs()", this.inputs);
  }

  isValid() {
    this.validateAll();

    if (this.nonValids.length > 0) {
      this.handleError();
      this.isFormValid = false;
    } else {
      this.isFormValid = true;
    }

    return this.isFormValid;
  }

  validateAll() {
    this.nonValids = [];
    this.unsatisfiedRules = [];

    this.inputs.forEach((input) => {
      this.validate(input, (inp, rule) => {
        if (this.nonValids.indexOf(inp) === -1) {
          this.nonValids.push(inp);
        }

        if (this.unsatisfiedRules.indexOf(rule) === -1) {  // benzersiz valid olmayan rule'lar
          this.unsatisfiedRules.push(rule);
        }
      });
    });

    // this.setUniqueMessages();

    // console.log("validateAll -> this.nonValids", this.nonValids);
    // console.log("validateAll -> this.inputs", this.inputs);
  }

  validate(inp, callback) {
    let element = {};
    let rules = [];
    let errorMessage = "";

    inp.errors = [];
    element = inp.element;
    rules = inp.rules;

    rules.forEach((rule) => {  // RULE

      if (rule.includes("[")) {  // eğer rule parametresi varsa (rule[param])
        this.ruleParam = this.parseRuleParams(rule);
        this.validatonRules.ruleParam = this.ruleParam;
        rule = rule.slice(0, rule.indexOf("["));
      }

      if (!this.validatonRules.rules[rule].method(element)) {  // valid değilse
      // if (!validatonRules[rule].method(element, this.ruleParam)) {  // valid değilse
      // if (!this.mapRules(rule).method(element)) {  // valid değilse

        if (inp.errors.indexOf(this.validatonRules.rules[rule].message()) === -1) {
          errorMessage = (this.customMessages.hasOwnProperty(inp.name) && this.customMessages[inp.name][rule]) 
            ? this.customMessages[inp.name][rule] 
            : this.validatonRules.rules[rule].message();

          inp.errors.push(errorMessage);
        }

        if (callback) {
          callback(inp, rule);
        }
      }

      this.ruleParam = null;
    });

    if (this.inject) {
      this.injectErrors();
    }
  }

  validateOnInput() {
    this.inputs.forEach(input => {
      input.element.addEventListener("input", () => {
        this.validate(input);
        // console.log("validateOnInput -> this.nonValids", this.nonValids);
        // console.log("validateOnInput -> this.inputs", this.inputs);
      });
    });
  }

  renderErrorContainers() {
    let div;

    this.inputs.forEach(input => {
      div = document.createElement("div");
      div.className = "validator-error";
      input.element.insertAdjacentElement("afterend", div)
    });
  }

  injectErrors() {
    this.inputs.forEach(input => input.element.nextElementSibling.innerHTML = (input.errors.length > 0) ? input.errors[0] : "");
  }

  // mapRules(rule) {
  //   // metdolar true döndürmeli (valid olan durumu)
  //   const rules = {
  //     required: {
  //       method: (element) => element.value !== "",
  //       message: "Bu alanı doldurun."
  //     },
  //     minlen: {
  //       method: (element) => element.value.length >= parseInt(this.ruleParam),
  //       message: `En az ${this.ruleParam} karakter girmelisiniz.`
  //     },
  //     selected: {
  //       method: (element) => element.value != this.ruleParam,
  //       message: "Bir seçim yapın."
  //     },
  //     matches: {
  //       method: (element) => element.value == this.form[this.ruleParam].value,
  //       message: "Değerler eşleşmiyor."
  //     },
  //     phone: {
  //       method: (element) => (element.value[0] == 5 && element.value.length === 10),
  //       message: "Geçerli bir telefon numarası girin."
  //     },
  //     email: {
  //       method: (element) => (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(element.value) || element.value === ""),
  //       message: "Geçerli bir e-mail adresi girin."
  //     },
  //   }
  //   return rules[rule];
  // }

  // Benzersiz hata mesajlarını set eder
  setUniqueMessages() {
    this.messages = this.unsatisfiedRules.map(unsatisfiedRule => this.mapRules(unsatisfiedRule).message);
  }

  // [] içindeki rule parametresini döndürür
  parseRuleParams(rule) {
    return rule.match(/\[(.*?)\]/)[1];
  }

}

// new Validator({
//   form: ".js-form",
//   inject: true, // opsiyonel
//   onInput: true, // opsiyonel
//   // handleError: () => {console.log("notvalid")}, // opsiyonel
// });

export { Validator };