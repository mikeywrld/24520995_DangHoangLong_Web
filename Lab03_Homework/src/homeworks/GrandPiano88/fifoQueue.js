/** Minimal FIFO queue with O(1) amortised dequeue (head index instead of Array#shift). */
export class FifoQueue {
  #items = [];
  #head = 0;

  static from(iterable) {
    const q = new FifoQueue();
    for (const item of iterable) q.enqueue(item);
    return q;
  }

  enqueue(item) { this.#items.push(item); return this; }

  dequeue() {
    if (this.#head >= this.#items.length) return undefined;
    const item = this.#items[this.#head];
    this.#head += 1;
    if (this.#head > 32 && this.#head * 2 > this.#items.length) {
      this.#items = this.#items.slice(this.#head);
      this.#head = 0;
    }
    return item;
  }

  peek() { return this.#items[this.#head]; }
  get size() { return this.#items.length - this.#head; }
  clear() { this.#items = []; this.#head = 0; }
  toArray() { return this.#items.slice(this.#head); }
  [Symbol.iterator]() { return this.toArray()[Symbol.iterator](); }
}
