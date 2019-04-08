# Redux-Juice

> A simple, lightweight utility for building normalised business objects in Redux state.

Given an object schema, `juice` returns two reducers: `byId` and `all`. 

`byId` is an object where resources are indexed by a unique id, `all` being an array of all resource ids of that type.

## Installation

```console
> npm install --save redux-juice
```

## Basic Usage

```js
import juice from 'redux-juice';
import { combineReducers } from 'redux';

const blogSchema = {
  title: String,
  content: String
};

const { byId, all } = juice(blogSchema, 'blog');

const userReducer = combineReducers({ byId, all });
```

The above will generate reducers which respond to type: `${resourceName}_${attributeName}_${action}`.

```js
dispatch({ type: BLOG_ADD, payload: { id:'uniqueID' } });

dispatch({ type: BLOG_REMOVE, payload: { id:'uniqueID' } });

dispatch({ type: BLOG_TITLE_UPDATE, payload: 'New Blog Title' });
```


## Reduction Functions

```js
const picSchema = {
  likeCount: { type: Number, func: 'INCREMENT', default: 0 },
}
```

Attributes can be assigned functions to describe transformations to be applied in reducer logic.

Juice comes with a number of built in functions which cover a range of commonly required transformations.

### Numbers
`INCREMENT`
`DECREMENT` 
### Arrays
`APPEND`
`PREPEND`
`REPLACE`
`REMOVE`
`INSERT`
### Boolean
`TOGGLE`

Actions should be constructed in the following pattern:
```js
{ type: TYPE, payload: { id: 'unique id', value: 'some value', index: 0 } }
```


`index` being relevant to actions which should change arrays.

## Custom Functions
Custom functions may also be used:

```js
import shuffle from 'lodash.shuffle';

const anagramSchema = {
  content: { type: String, func: { name: 'randomise', func: val => shuffle(val.split('')).join('') } }
};
```

Custom functions use the signature `(existingValue, incomingValue, index) => {return /* something immutable */}`

```js
const mirrorSchema = {
  reversibleStr: { type: String, func: { name: 'REVERSE', func: val => val.split('').reverse().join('') }}
}

const mirrorReducer = combineReducers(juice(mirrorSchema, 'mirror'));
```
Will allow: 
```js
dispatch({ type: 'MIRROR_REVERSIBLESTR_REVERSE', payload: { id: 'resourceId' } };
```
