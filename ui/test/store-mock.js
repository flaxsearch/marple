
class Store {
  get(key) {
    console.log('WARN mock store');
    return undefined;
  }

  set(key, val) {
    console.log('WARN mock store');
  }
}

const store = new Store();

export default store;
