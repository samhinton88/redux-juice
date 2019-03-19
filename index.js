const invert = method => arg => arg[method]();

const updateFuncs = {
  PREPEND: (arr, val) => [val, ...arr],
  APPEND: (arr, val) => [...arr, val],
  INSERT: (arr, val, index)=> [...arr.slice(0, index), val, ...arr.slice(index,)],
  REPLACE: (arr, val, index) => [...arr.slice(0, index), val, ...arr.slice(index + 1,)],
  REMOVE: (arr, _val, index) => [...arr.slice(0, index), ...arr.slice(index + 1,)],
  TOGGLE: bool => !bool,
  INCREMENT: val => val + 1,
  DECREMENT: val => val - 1
}

const attrReducer = (cb, at) => (state, action) => {
  const { id, index, value } = action.payload;

  const resource = state[id];
  const attr = resource[at]; 

  return {
    ...state,
    [id]: {
      ...resource,
      [at]: cb(attr, value, index),
    }
  }
};


/**
 * A utility which takes a resource schema and returns an object containing
 * reducer functions.
 * 
 * 
 * import juice from 'juice';
 * 
 * const userSchema = {
 *  name: String,
 *  age: Number,
 *  likeCount: { type: Number, func: 'INC', default: 0 },
 *  
 * };
 * 
 * const { byId, all } = juice(userSchema, 'user');
 * 
 * const userReducer = combineReducers({ byId, all });
 * 
 * juice
 * @param {object} schema model schema
 * @param {string} rawName model name
 */
module.exports = (schema, rawName) => {
  if(!rawName) throw new Error('Please provide a name for your model');

  const name = rawName.toUpperCase();

  // get default values if any
  const initial = Object.keys(schema)
    .filter(at => schema[at].default !== undefined)
    .reduce((acc, at) => ({ ...acc, [at]: schema[at].default }), {})
  
  const funcRepo = Object.keys(schema).reduce((acc, attr) => {
    // scope by resource name and attribute name
    const scope = [name, attr].map(invert('toUpperCase')).join('_');

    let config = schema[attr];

    if(Array.isArray(config)) {
      config = config[0];
    }

    const { func } = config;

    if(func) {

      if(Array.isArray(func)) {
        // more than one function provided
  
        func.forEach((f) => {

          if (updateFuncs[f]) {
            const functionToReduce = updateFuncs[f];
            
            acc[`${scope}_${f}`] = attrReducer(functionToReduce, attr);

          } else if (typeof f === 'object') {
            // custom function
            acc[`${scope}_${f.name}`] = attrReducer(f.func, attr);

          } else {

            throw new Error(`${f} is not a known function`)

          }
        })
      } else {
        // single function provided

        if (updateFuncs[func]) {
          const functionToReduce = updateFuncs[func];
          
          acc[`${scope}_${func}`] = attrReducer(functionToReduce, attr);

        } else if (typeof func === 'object') {
          // custom function
          acc[`${scope}_${func.name}`] = attrReducer(func.func, attr);

        } else {
          throw new Error(`${func} is not a known function`)
        }
      }
    } else {
      // only a type is provided - provide update reduction
      acc[`${scope}_UPDATE`] = attrReducer((_attr, val) => val, attr)

    }
    acc[`${name}_ADD`] = (state, action) => ({
      ...state,
      [action.payload.id]: { ...initial, ...action.payload }
    })

    acc[`${name}_REMOVE`] = (state, action) => {
      delete state[action.payload.id];
      return { ...state };
    }

    return acc;
  }, {});

  const byId = (state={}, action) => funcRepo[action.type] ? funcRepo[action.type](state, action) : state;
  const all = (state=[], action) => { 
    switch(action.type) {
      case `${name}_ADD`: return [...state, action.payload.id];
      case `${name}_REMOVE`: return state.filter(id => id !== action.payload.id)
      default: return state;
    }
  }

  return { byId, all }
};
