/** @jsx React.DOM */

var converter = new Showdown.converter();

var CommentModel = Handykit.Model.extend({
    url: "/comments.json"
});

var CommentCollection = Handykit.Collection.extend({
    model: CommentModel,
    url: "/comments.json"
});

var comments = new CommentCollection();

var CommentFormPresenter = Handykit.Presenter.extend({
    collection: comments,
    name: 'CommentFormPresenter',
    initialize: function() {
        this.fetchComments();
    },
    fetchComments: function() {
        var klass = this;
        this.collection.fetch({success: function() {
            klass.updateDOM();
        }});
    },
    getComments: function() {
        return this.collection.models;
    },
    saveComment: function(author, text) {
        var comment = new CommentModel();
        comment.set({author: author, text: text});
        comment.save();
    }
});

var commentFormPresenter = new CommentFormPresenter();


var Comment = Handykit.View({
    render: function() {
        var rawMarkup = converter.makeHtml(this.props.children.toString());
        return (
            <div className="comment">
                <h2 className="commentAuthor">{this.props.author}</h2>
                <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
            </div>
        );
    }
});

var CommentBox = Handykit.View({
    handleCommentSubmit: function(author, text) {
        this.presenter.saveComment(author, text);
        return false;
    },
    getInitialState: function() {
        return {data: []};
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.presenter.getComments()} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
            );
    }
});

var RootComponent = Handykit.View({
    render: function() {
        return (
            <CommentBox presenter={commentFormPresenter} />
        );
    }
});

var CommentList = Handykit.View({
    render: function() {
        var commentNodes = this.props.data.map(function (comment) {
            return <Comment author={comment.get('author')}>{comment.get('text')}</Comment>;
        });
        return <div className="commentList">{commentNodes}</div>;
    }
});

var CommentForm = Handykit.View({
    handleSubmit: function() {

        var author = this.refs.author.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();
        this.props.onCommentSubmit(author, text);
        this.refs.author.getDOMNode().value = '';
        this.refs.text.getDOMNode().value = '';
        return false;
    },
    render: function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Your name" ref="author" />
                <input type="text" placeholder="Say something..." ref="text" />
                <input type="submit" value="Post" />
            </form>
        );
    }
});


setInterval(function() {
    commentFormPresenter.fetchComments();
}, 5000);
Handykit.start(RootComponent, document.body);