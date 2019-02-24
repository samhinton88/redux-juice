const invert = method => arg => arg[method]();

const updateFuncs = () => ({
  prepend: (arr, val) => [val, ...arr],
  append: (arr, val) => [...arr, val],
  insert: (arr, val, index)=> [...arr.slice(0, index), val, ...arr.slice(index,)],
  replace: (arr, val, index) => [...arr.slice(0, index), val, ...arr.slice(index + 1,)],
  toggle: bool => !bool,
  INC: (val) => val + 1
})

const attrReducer = (cb, at) => (state, action) => {
  console.log('in attr reducer',state, action)
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
}


export default (resource, rawName, ) => {
  const name = rawName.toUpperCase();

  const funcRepo = Object.keys(resource).reduce((acc, attr) => {

    const scope = [name, attr].map(invert('toUpperCase')).join('_');

    const config = resource[attr];

    if(Array.isArray(config)) {

    }

    const { func } = config;

    if(func) {

      if(Array.isArray(func)) {
  
        func.forEach((func) => {

          if (updateFuncs()[func]) {
            const functionToReduce = updateFuncs()[func];
            
            acc[`${scope}_${func}`] = attrReducer(functionToReduce, attr);

          } else if (typeof func === 'object') {

            acc[`${scope}_${func.name}`] = attrReducer(func.func, attr);

          }
        })
      } else {
        if (updateFuncs()[func]) {
          const functionToReduce = updateFuncs()[func];
          
          acc[`${scope}_${func}`] = attrReducer(functionToReduce, attr);

        } else if (typeof func === 'object') {

          acc[`${scope}_${func.name}`] = attrReducer(func.func, attr);

        }
      }
    } else {
      // only a type is provided
      acc[`${scope}_UPDATE`] = attrReducer((_attr, val) => val, attr)

    }
    acc[`${name}_ADD`] = (state, action) => ({...state, [action.payload.id]: action.payload })

    acc[`${name}_REMOVE`] = (state, action) => {
      delete state[action.payload.id]
      return { ...state };
    }

    return acc;
  }, {});

  console.log(funcRepo)

  const byId = (state={}, action) => funcRepo[action.type] ? funcRepo[action.type](state, action) : state;
  const all = (state=[], action) => { 
    console.log('action in all reducer',action)
    switch(action.type) {
      case `${name}_ADD`: return [...state, action.payload.id];
      case `${name}_REMOVE`: return state.filter(id => id !== action.payload.id)
      default: return state;
    }
  }

  return { byId, all }
};
