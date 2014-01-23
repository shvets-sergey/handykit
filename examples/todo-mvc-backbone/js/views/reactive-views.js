/** @jsx React.DOM */
var app = app || {};

(function() {

    var RootContainer = Handykit.View({
        render: function() {
            return (
                <div>
                    <TodoApp presenter={app.TodoPresenter} />
                    <footer className="info">
                        <p>Double-click to edit a todo</p>
                        <p>Originally written by <a href="https://github.com/addyosmani">Addy Osmani</a></p>
                        <p>Rewritten with Handykit by <a href="https://github.com/bearz">Sergey Shvets</a></p>
                    </footer>
                </div>
            );
        }
    });

    var TodoApp = Handykit.View({
        render: function() {
            // TODO fix ui issues with displaying checkbox and hiding parts of content.
            return (
                <section className="todoapp">
                    <header className="header">
                        <h1>todos</h1>
                        <AddTodoWidget createItemCallback={this.presenter.createTodo}/>
                    </header>
                    <section className="main">
                        <ToggleAllCheckbox bulkMarkCallback={this.presenter.bulkMarkAll}/>
                        <TodoList todos={this.presenter.getTodos()}
                            toggleCallback={this.presenter.toggleTodo}
                            deleteCallback={this.presenter.deleteTodo}
                            updateCallback={this.presenter.updateTodo}
                        />
                    </section>
                    <Stats todos={this.presenter.collection}
                           selectedItem={this.presenter.getSelectedFilter()}
                           clearCompletedCallback={this.presenter.clearCompleted}
                    />

                </section>
            );
        }
    });

    var AddTodoWidget = Handykit.View({
        handleKeyPress: function(e) {
            if (e.keyCode != ENTER_KEY || e.target.value === '') {
                return;
            }
            var title = e.target.value;
            e.target.value = '';
            this.props.createItemCallback(title, false);
        },
        render: function() {
            return (<input
                    className="new-todo"
                    placeholder="What needs to be done?"
                    autoFocus
                    onKeyPress={this.handleKeyPress}
            />);
        }
    });

    var ToggleAllCheckbox = Handykit.View({
        handleCheckboxClick: function(e) {
            var checked = e.target.checked;
            this.props.bulkMarkCallback(checked);
        },
        render: function() {
            // TODO fix checkbox styling
            return (
                <div>
                    <input className="toggle-all" type="checkbox" onClick={this.handleCheckboxClick} />
                    <label htmlFor="toggle-all">Mark all as complete</label>
                </div>
            );
        }

    });

    var TodoList = Handykit.View({
        render: function() {
            var rows = [];
            var tglCallback = this.props.toggleCallback;
            var dltCallback = this.props.deleteCallback;
            var updCallback = this.props.updateCallback;
            this.props.todos.forEach(function(todo) {
                rows.push(<TodoItem item={todo} key={todo.id}
                                toggleCallback={tglCallback}
                                deleteCallback={dltCallback}
                                updateCallback={updCallback}
                            />);
            });
            return (<ul className="todo-list">{rows}</ul>);
        }
    });

    var TodoItem = Handykit.View({
        getInitialState: function() {
            return {
                editing: false
            }
        },
        componentDidUpdate: function() {
            if (this.state.editing) {
                this.refs.editItem.getDOMNode().focus();
            }
        },
        handleToggle: function() {
            // we can add predictive UI approach, but since we keep everything on LS, we just call full update flow
            this.props.toggleCallback(this.props.item.id);
        },
        handleDelete: function() {
            this.props.deleteCallback(this.props.item.id);
        },
        enableEdit: function() {
            this.setState({editing: true});
        },
        disableEdit: function() {
            this.setState({editing: false});
            this.refs.editItem.getDOMNode().value = this.props.item.get('title');
        },
        handleUpdate: function() {
            var value = this.refs.editItem.getDOMNode().value;
            this.props.updateCallback(this.props.item.id, {"title": value});
            this.setState({editing: false}); // we done editing
        },
        handleKeyDown: function(e) {
            if (e.keyCode === ENTER_KEY) {
                this.handleUpdate();
            }

            if (e.keyCode === ESC_KEY) {
                this.disableEdit();
            }
        },
        render: function() {
            var is_checked = this.props.item.get('completed');
            var class_name = "";
            if (this.props.item.get('completed')) {
                class_name = 'completed';
            }

            if (this.state.editing) {
                class_name += ' editing';
            }

            var title = this.props.item.get('title');
            return (
                <li className={class_name}>
                    <div className="view">
                        <input className="toggle" type="checkbox" checked={is_checked} onClick={this.handleToggle} />
                        <label onDoubleClick={this.enableEdit}>{title}</label>
                        <button className="destroy" onClick={this.handleDelete}></button>
                    </div>
                    <input className="edit" defaultValue={title}
                            onBlur={this.handleUpdate}
                            onKeyDown={this.handleKeyDown}
                            ref="editItem" />
                 </li>
            );
        }
    });

    var Stats = Handykit.View({
        handleClear: function() {
            this.props.clearCompletedCallback();
        },
        render: function() {
            var completed = this.props.todos.completed().length;
            var remaining = this.props.todos.remaining().length;

            if (this.props.todos.length === 0) {
                return (<span/>);
            } else {
                var help_text = (remaining === 1 ? 'item' : 'items');
                var completed_button;
                if (completed) {
                    completed_button = (<button className="clear-completed" onClick={this.handleClear}>Clear completed ({completed})</button>);
                }
                return (
                    <footer className="footer">
                        <span className="todo-count"><strong>{remaining}</strong> {' '} {help_text} left</span>
                        <ul className="filters">
                            <li>
                                <a className={this.props.selectedItem === 'all' ? "selected" : ''} href="#/">All</a>
                            </li>
                            <li>
                                <a className={this.props.selectedItem === 'active' ? "selected" : ''} href="#/active">Active</a>
                            </li>
                            <li>
                                <a className={this.props.selectedItem === 'completed' ? "selected" : ''} href="#/completed">Completed</a>
                            </li>
                        </ul>
                        {completed_button}
                    </footer>
                );
            }

        }
    });

    app.RootContainer = RootContainer;

})();


