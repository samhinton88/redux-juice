const juice = require('.');
const { combineReducers, createStore } = require('redux');

const fromState = state => id => state.getState().byId[id];

describe('juice', () => {
  let testReducer, 
    initId = 0,
    testSchema = {
      name: String,
      toReverse: { type: String, func: { name: 'REVERSE', func: val => val.split('').reverse().join('') }},
      isValid: { type: Boolean, func: 'TOGGLE' },
      count: { type: Number, func: ['INCREMENT', 'DECREMENT', { name: 'ADD5', func: val => val + 5 } ]},
      packets: [{ type: String, func: ['APPEND', 'PREPEND', 'INSERT', 'REPLACE', 'REMOVE']}]
    },
    badSchema = {
      name: { type: String, func: 'BADFUNC'}
    },
    badSchemaMultiFunc = {
      count: { type: Number, func: ['INCREMENT', 'BADFUNC']}
    },
    initialState = {
      id: initId, 
      count: 0, 
      name: 'test name', 
      isValid: true, 
      packets: ['first packet'],
      toReverse: 'reverse'
    },
    store,
    objWithId;

  beforeEach(() => {
    testReducer = combineReducers(juice(testSchema, 'test'));

    store = createStore(
      testReducer,
      { 
        byId: { 0: initialState },
        all: [0]
      }
    )
    
    objWithId = fromState(store)
  })

  it('returns something meaningful', () => {
    expect(testReducer).not.toBeUndefined();
  })

  describe('basic functionality', () => {
    it('allows the dispatch of an ADD type', () => {
      store.dispatch({ type: 'TEST_ADD', payload: { id: 1 } })
      expect(store.getState().all.length).toEqual(2)
    });

    it('allows the dispatch of a REMOVE type', () => {
      store.dispatch({ type: 'TEST_REMOVE', payload: { id: 0 } });
      expect(store.getState().all.length).toEqual(0)
    });

    it('allows the dispatch of an UPDATE type, if no other function is specified', () => {
      const newName = 'new name';
      store.dispatch({ type: 'TEST_NAME_UPDATE', payload: { id: 0, value: newName} });
      expect(objWithId(initId).name).toBe(newName);
    })
  })

  describe('built-in functions', () => {
    describe('INCREMENT', () => {
      
      it('increments a number', () => {
        store.dispatch({ type: 'TEST_COUNT_INCREMENT', payload: { id: initId } });
  
        expect(objWithId(initId).count).toEqual(initialState.count + 1);
      })
    })

    describe('DECREMENT', () => {
      it('decrements a number', () => {
        store.dispatch({ type: 'TEST_COUNT_DECREMENT', payload: { id: initId } });
  
        expect(objWithId(initId).count).toEqual(initialState.count - 1);
      })

    })

    describe('APPEND', () => {
      it('appends a value to an array', () => {
        store.dispatch({ type: 'TEST_PACKETS_APPEND', payload: { id: initId, value: 'new packet' } });
        expect(objWithId(initId).packets.length).toEqual(2);
        expect(objWithId(initId).packets[1]).toEqual('new packet');
      })
    })

    describe('PREPEND', () => {
      it('prepends a value to an array', () => {
        store.dispatch({ type: 'TEST_PACKETS_PREPEND', payload: { id: initId, value: 'new packet' } });
        expect(objWithId(initId).packets.length).toEqual(2);
        expect(objWithId(initId).packets[0]).toEqual('new packet');
      })
    })

    describe('INSERT', () => {
      it('inserts a value into an array', () => {
        store.dispatch({ type: 'TEST_PACKETS_APPEND', payload: { id: initId, value: 'new packet' } });
        store.dispatch({ type: 'TEST_PACKETS_INSERT', payload: { id: initId, index: 1, value: 'inserted packet' } });
        expect(objWithId(initId).packets.length).toEqual(3);
        expect(objWithId(initId).packets[1]).toEqual('inserted packet');
      })
    })

    describe('REPLACE', () => {
      it('replaces a value in an array', () => {
        store.dispatch({ type: 'TEST_PACKETS_APPEND', payload: { id: initId, value: 'new packet' } });
        store.dispatch({ type: 'TEST_PACKETS_APPEND', payload: { id: initId, value: 'new packet1' } });

        store.dispatch({ type: 'TEST_PACKETS_REPLACE', payload: { id: initId, index: 1, value: 'replacement packet' } });
        expect(objWithId(initId).packets.length).toEqual(3);
        expect(objWithId(initId).packets[1]).toEqual('replacement packet');
      })
    })

    describe('REMOVE', () => {
      it('removes a value from an array', () => {
        store.dispatch({ type: 'TEST_PACKETS_APPEND', payload: { id: initId, value: 'new packet' } });
        store.dispatch({ type: 'TEST_PACKETS_APPEND', payload: { id: initId, value: 'new packet1' } });
        store.dispatch({ type: 'TEST_PACKETS_REMOVE', payload: { id: initId, index: 1 }})

        expect(objWithId(initId).packets.length).toEqual(2);
        expect(objWithId(initId).packets[1]).toEqual('new packet1');
      })
    })

    describe('TOGGLE', () => {
      it('toggles a boolean', () => {
        store.dispatch({ type: 'TEST_ISVALID_TOGGLE', payload: { id: initId }});
        expect(objWithId(initId).isValid).toEqual(false);
        store.dispatch({ type: 'TEST_ISVALID_TOGGLE', payload: { id: initId }});
        expect(objWithId(initId).isValid).toEqual(true);
      })
    })
  })

  describe('custom functions', () => {
    it('allows custom functions', () => {
      store.dispatch({ type: 'TEST_TOREVERSE_REVERSE', payload: { id: initId } });
      expect(objWithId(initId).toReverse).toEqual('esrever');
    })

    it('allows custom functions in addtion to built in functions for one attribute', () => {
      store.dispatch({ type: 'TEST_COUNT_ADD5', payload: { id: initId }});
      expect(objWithId(initId).count).toEqual(initialState.count + 5);
    })
  })

  describe('error handling', () => {
    it('throws an error if the user does not provide a name', () => {
      const withoutName = () => juice(testSchema);
      expect(withoutName).toThrow();
    });

    it('throws an error if passed a ref to a function which does not exist', () => {
      const withBadSchema = () => juice(badSchema, 'test')
      expect(withBadSchema).toThrow();
    })

    it('throws an error if passed a ref to a function which does not exist amongst valid functions', () => {
      const withBadSchema = () => juice(badSchemaMultiFunc, 'test')
      expect(withBadSchema).toThrow();
    })
  })
})