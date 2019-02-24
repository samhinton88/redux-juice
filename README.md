# Juice

A simple, lightweight utility to for building business objects in Redux state.

## Basic Usage

```
import juice from 'juice';
import { combineReducers } from 'redux';

const blogSchema = {
  title: String,
  content: String
};

const { byId, all } = juice(blogSchema, 'blog');

const userReducer = combineReducers({ byId, all });
```

The above will generate reducers which respond to type: `${resourceName}_${attributeName}_${action}`.

`dispatch({ type: BLOG_TITLE_UPDATE, payload: 'New Blog Title' });`

```
const picSchema = {
  likeCount: { type: Number, func: 'INCREMENT' },
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

Custom functions may also be used:

```
import shuffle from 'lodash.shuffle';

const anagramSchema = {
  content: { type: String, func: { name: 'randomise', func: val => shuffle(val.split('')).join('') } }
};

```

Custom functions use the signature `(existingValue, incomingValue, index) => {return /* something immutable */}`



