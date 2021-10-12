export default class {
  constructor() {
    this.rules = {};
    this.ruleParam = null;
    this.setRules();
  }

  set ruleParam(param) {
    this._ruleParam = param;
  }
  get ruleParam() {
    return this._ruleParam;
  }

  setRules() {
    this.rules = {
      required: {
        method: (element) => element.value !== "",
        message: () => "Bu alanı doldurun."
      },
      minlen: {
        method: (element) => element.value.length >= parseInt(this.ruleParam),
        message: () => `En az ${this.ruleParam} karakter girmelisiniz.`
      },
      selected: {
        method: (element) => element.value != this.ruleParam,
        message: () => "Bir seçim yapın."
      },
      // matches: {
      //   method: (element) => element.value == this.form[this.ruleParam].value,
      //   message: "Değerler eşleşmiyor."
      // },
      phone: {
        method: (element) => (element.value[0] == 5 && element.value.length === 10),
        message: () => "Geçerli bir telefon numarası girin."
      },
      email: {
        method: (element) => (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(element.value) || element.value === ""),
        message: () => "Geçerli bir e-mail adresi girin."
      },
    }
  }

};