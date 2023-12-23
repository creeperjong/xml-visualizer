export default class Queue {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}
