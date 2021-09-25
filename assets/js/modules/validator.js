class Validator {

  constructor(props) {
    this.formElements = [...document.querySelector(props.form)];
    this.inject = props.inject ? props.inject : false;    

    this.inputs = []; // Form içindeki data-rules'u belirtilmiş elemtler ve rule'ları

    this.isValid = true;
    this.ruleParam = null; // elementin data-rule'undaki rule parametresi (rule[param])
    this.nonValids = []; // valid olmayan elementler
    this.unsatisfiedRules = []; // benzersiz valid olmayan rule'lar
    this.messages = [];

    this.setInputs();
  }

  // Form içindeki data-rules'u belirtilmiş elementleri alır
  setInputs() {
    this.formElements.forEach(formItem => {
      if(formItem.dataset.rules) {
        this.inputs.push({
          element: formItem,
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
    console.log("nonValids1", this.nonValids);

    this.inputs.forEach((input, index) => {
      element = input.element;
      rules = input.rules;

      rules.forEach((rule) => {

        if(rule.includes("[")) { // eğer rule parametresi varsa (rule[param])
          this.ruleParam = this.parseRuleParams(rule);
          rule = rule.slice(0, rule.indexOf("["));
        }

        if(!this.mapRules(rule).method(element)) { // valid değilse
          if(this.nonValids.indexOf(input) === -1) { // *** 
            this.nonValids.push(input);
          }
          this.nonValids[index].errors.push(this.mapRules(rule).message);

          if(this.unsatisfiedRules.indexOf(rule) === -1) { // benzersiz valid olmayan rule'lar
            this.unsatisfiedRules.push(rule);
          }
        }
      });
    });
    
    if(this.nonValids.length > 0) {
      this.isValid = false;
    }

    this.setUniqueMessages();

    this.injectErrors();
    console.log("nonValids2", this.nonValids);
    // console.log("unsatisfiedRules", this.unsatisfiedRules);
  }

  injectErrors() {
    let element = {};

    this.nonValids.forEach((nonValid) => {
      element = nonValid.element;
      // nonValid.element.insertAdjacentElement("afterend", nonValid.element);
      if(element.nextElementSibling.classList.contains("validator-error")) {
        element.nextElementSibling.remove();
      }
      element.insertAdjacentHTML("afterend", `<div class="validator-error">${nonValid.errors[0]}</div>`);

    });
  }

  mapRules(rule) {
    const rules = {
      required: {
        method: (element) => element.value !== "",
        message: "Lütfen bu alanı doldurun."
      },
      minlen: {
        method: (element) => element.value.length >= parseInt(this.ruleParam),
        message: `En az ${this.ruleParam} karakter girmelisiniz.`
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

export { Validator }