/**
 * Required to overwrite values across files
 */
export default class Value<V> {
  v: V;
  constructor(v: V) {
    this.v = v;
  }
}
