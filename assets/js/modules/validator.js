class Validator {

  constructor(props) {
    this.formElements = [...document.querySelector(props.form)];
    this.inject = props.inject ? props.inject : false;
    this.onInput = props.onInput ? props.onInput : false;
    this.handleError = props.handleError ? props.handleError : () => { };

    this.inputs = []; // Form içindeki data-rules'u belirtilmiş elemtler ve rule'ları

    this.isValid = true;
    this.ruleParam = null; // elementin data-rule'undaki rule parametresi (rule[param])
    this.nonValids = []; // valid olmayan elementler
    this.unsatisfiedRules = []; // benzersiz valid olmayan rule'lar
    this.messages = [];

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
    this.formElements.forEach((formItem, index) => {
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

  validate() {
    let element = {};
    let rules = [];
    this.nonValids = [];
    this.unsatisfiedRules = [];
    console.log("this.inputs", this.inputs);

    this.inputs.forEach((input) => { // INP
      input.errors = [];
      element = input.element;
      rules = input.rules;

      rules.forEach((rule) => {  // RULE

        if (rule.includes("[")) {  // eğer rule parametresi varsa (rule[param])
          this.ruleParam = this.parseRuleParams(rule);
          rule = rule.slice(0, rule.indexOf("["));
        }

        if (!this.mapRules(rule).method(element)) {  // valid değilse

          if (input.errors.indexOf(this.mapRules(rule).message) === -1) {
            input.errors.push(this.mapRules(rule).message);
          }

          if (this.nonValids.indexOf(input) === -1) {
            this.nonValids.push(input);
          }

          if (this.unsatisfiedRules.indexOf(rule) === -1) {  // benzersiz valid olmayan rule'lar
            this.unsatisfiedRules.push(rule);
          }
        }
      });
    });

    if (this.nonValids.length > 0) {
      this.isValid = false;
      this.handleError();
    }

    this.setUniqueMessages();

    if (this.inject) {
      this.injectErrors();
    }

    console.log("nonValids2", this.nonValids);
    // console.log("unsatisfiedRules", this.unsatisfiedRules);
  }

  validateOnInput() { // *** iyileştir. validate() metoduna input parametresini ver ***
    this.inputs.forEach(input => {

      input.element.addEventListener("input", (e) => {
        console.log(e.target.value);
        // this.validate();
        let element = {};
        let rules = [];
        this.nonValids = [];
        this.unsatisfiedRules = [];

        // this.inputs.forEach((input) => { // INP
          input.errors = [];
          element = input.element;
          rules = input.rules;

          rules.forEach((rule) => {  // RULE

            if (rule.includes("[")) {  // eğer rule parametresi varsa (rule[param])
              this.ruleParam = this.parseRuleParams(rule);
              rule = rule.slice(0, rule.indexOf("["));
            }

            if (!this.mapRules(rule).method(element)) {  // valid değilse

              if (input.errors.indexOf(this.mapRules(rule).message) === -1) {
                input.errors.push(this.mapRules(rule).message);
              }

              if (this.nonValids.indexOf(input) === -1) {
                this.nonValids.push(input);
              }

              if (this.unsatisfiedRules.indexOf(rule) === -1) {  // benzersiz valid olmayan rule'lar
                this.unsatisfiedRules.push(rule);
              }
            }
          });
        // });

        if (this.nonValids.length > 0) {
          this.isValid = false;
          this.handleError();
        }

        this.setUniqueMessages();

        if (this.inject) {
          this.injectErrors();
        }
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

  mapRules(rule) {
    // metdolar true döndürmeli (valid olan durumu)
    const rules = {
      required: {
        method: (element) => element.value !== "",
        message: "Lütfen bu alanı doldurun."
      },
      minlen: {
        method: (element) => element.value.length >= parseInt(this.ruleParam),
        message: `En az ${this.ruleParam} karakter girmelisiniz.`
      },
      selected: {
        method: (element) => element.value != this.ruleParam,
        message: "Lütfen bir seçim yapın."
      }
    }
    return rules[rule];
  }

  // Benzersiz hata mesajlarını set eder
  setUniqueMessages() {
    // const ruleKeys = [...new Set(this.nonValids.map(nonValid => nonValid.rules))];
    // this.messages = ruleKeys.map(ruleKey => this.mapRules(ruleKey).message);
    this.messages = this.unsatisfiedRules.map(unsatisfiedRule => this.mapRules(unsatisfiedRule).message);
    // console.log("setUniqueMessages()", this.messages);
  }

  // [] içindeki rule parametresini döndürür
  parseRuleParams(rule) {
    return rule.match(/\[(.*?)\]/)[1];
  }

}

export { Validator };