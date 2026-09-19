# Architecture:

single page app:
index.html

- Container for app
  
app.js:

state: todos[]
-functions:
-addTodo()
-removeTodo()
-editTodo()

Data flow:
UI -> JS State -> LocalStorage -> UI

Styles for app