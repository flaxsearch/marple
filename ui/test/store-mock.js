
class Store {
  get(key) {
    console.log('FIXME store-mock.get');
  }

  set(key, val) {
    console.log('FIXME store-mock.set');
  }
}

const store = new Store();

export default store;
