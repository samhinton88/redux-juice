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
