import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import "./Community.css";

const categories = [
  "General",
  "Work",
  "Stress",
  "Wellbeing",
  "Support",
  "Celebration",
];

function Community() {
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [showMyActivity, setShowMyActivity] = useState(false);
  const [myPostsLoading, setMyPostsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentAnonymous, setCommentAnonymous] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [commentLoading, setCommentLoading] = useState({});
  const [error, setError] = useState("");

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/community/posts");

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load posts");
      }

      setPosts(data.posts || []);
    } catch (err) {
      console.error("Community loading error:", err);
      setError("Unable to load community posts.");
    } finally {
      setLoading(false);
    }
  };

  const loadMyPosts = async () => {
    try {
      setMyPostsLoading(true);

      const response = await apiFetch("/api/community/my-posts");

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your posts");
      }

      setMyPosts(data.posts || []);
    } catch (err) {
      console.error("My posts loading error:", err);
    } finally {
      setMyPostsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      setPosting(true);
      setError("");

      const response = await apiFetch("/api/community/posts", {
        method: "POST",
        body: JSON.stringify({
          content: content.trim(),
          category,
          isAnonymous,
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      setContent("");
      setCategory("General");
      setIsAnonymous(false);

      await loadPosts();
    } catch (err) {
      console.error("Create post error:", err);
      setError("Unable to create your post.");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await apiFetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update like");
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likeCount: data.likeCount,
                likedByCurrentUser: data.liked,
              }
            : post,
        ),
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await apiFetch(`/api/community/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post");
      }

      setMyPosts((currentPosts) =>
        currentPosts.filter((post) => post._id !== postId),
      );

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post._id !== postId),
      );

      setComments((current) => {
        const updated = { ...current };
        delete updated[postId];
        return updated;
      });

      setExpandedComments((current) => {
        const updated = { ...current };
        delete updated[postId];
        return updated;
      });
    } catch (err) {
      console.error("Delete post error:", err);
      setError("Unable to delete the post.");
    }
  };

  const loadComments = async (postId) => {
    try {
      const response = await apiFetch(
        `/api/community/posts/${postId}/comments`,
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load comments");
      }

      setComments((current) => ({
        ...current,
        [postId]: data.comments || [],
      }));
    } catch (err) {
      console.error("Load comments error:", err);
    }
  };

  const toggleComments = async (postId) => {
    const isExpanded = expandedComments[postId];

    setExpandedComments((current) => ({
      ...current,
      [postId]: !isExpanded,
    }));

    if (!isExpanded && comments[postId] === undefined) {
      await loadComments(postId);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs((current) => ({
      ...current,
      [postId]: value,
    }));
  };

  const handleCommentAnonymousChange = (postId, value) => {
    setCommentAnonymous((current) => ({
      ...current,
      [postId]: value,
    }));
  };

  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId]?.trim();

    if (!commentText) {
      return;
    }

    try {
      setCommentLoading((current) => ({
        ...current,
        [postId]: true,
      }));

      const response = await apiFetch(
        `/api/community/posts/${postId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({
            content: commentText,
            isAnonymous: Boolean(commentAnonymous[postId]),
          }),
        },
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add comment");
      }

      setComments((current) => ({
        ...current,
        [postId]: [...(current[postId] || []), data.comment],
      }));

      setCommentInputs((current) => ({
        ...current,
        [postId]: "",
      }));

      setCommentAnonymous((current) => ({
        ...current,
        [postId]: false,
      }));
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setCommentLoading((current) => ({
        ...current,
        [postId]: false,
      }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await apiFetch(`/api/community/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete comment");
      }

      setComments((current) => ({
        ...current,
        [postId]: (current[postId] || []).filter(
          (comment) => comment._id !== commentId,
        ),
      }));
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };
  return (
    <div className="community-page">
      <div className="community-header">
        <div>
          <h1>Community</h1>
          <p>
            A supportive space to share, connect, and encourage one another.
          </p>
        </div>
      </div>

      <div className="community-layout">
        {/* Create Post */}
        <section className="create-post-card">
          <h2>Share something</h2>

          <p className="privacy-note">
            Please protect privacy. Do not share names, identifying details, or
            confidential information about other people.
          </p>

          <form onSubmit={handleCreatePost}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={1000}
              rows={5}
            />

            <div className="post-options">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <label className="anonymous-option">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />

                <span>Post anonymously</span>
              </label>
            </div>

            <div className="post-form-footer">
              <span>{content.length}/1000</span>

              <button type="submit" disabled={posting || !content.trim()}>
                {posting ? "Posting..." : "Share Post"}
              </button>
            </div>
          </form>
        </section>

        {/* Feed */}
        <section className="community-feed">
          <div className="feed-header">
            <h2>{showMyActivity ? "My Activity" : "Community Feed"}</h2>

            <div className="feed-header-actions">
              <button
                onClick={() => {
                  const nextState = !showMyActivity;

                  setShowMyActivity(nextState);

                  if (nextState) {
                    loadMyPosts();
                  }
                }}
              >
                {showMyActivity ? "Community Feed" : "My Activity"}
              </button>

              {!showMyActivity && <button onClick={loadPosts}>Refresh</button>}
            </div>
          </div>

          {error && <div className="community-error">{error}</div>}

          {showMyActivity && myPostsLoading ? (
            <div className="community-empty">Loading your posts...</div>
          ) : !showMyActivity && loading ? (
            <div className="community-empty">Loading community posts...</div>
          ) : (showMyActivity ? myPosts : posts).length === 0 ? (
            <div className="community-empty">
              <h3>
                {showMyActivity ? "You haven't posted yet" : "No posts yet"}
              </h3>

              <p>
                {showMyActivity
                  ? "Your community posts will appear here."
                  : "Be the first to share something with the community."}
              </p>
            </div>
          ) : (
            <div className="posts-list">
              {(showMyActivity ? myPosts : posts).map((post) => (
                <article className="community-post" key={post._id}>
                  <div className="post-top">
                    <div className="post-author">
                      <div className="author-avatar">
                        {post.author?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div>
                        <strong>{post.author}</strong>

                        <span>{post.category}</span>
                      </div>
                    </div>

                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="post-content">{post.content}</p>

                  {/* Post actions */}
                  <div className="post-actions">
                    <button
                      className={
                        post.likedByCurrentUser
                          ? "like-button liked"
                          : "like-button"
                      }
                      onClick={() => handleLike(post._id)}
                    >
                      {post.likedByCurrentUser ? "♥" : "♡"}{" "}
                      {post.likeCount || 0}
                    </button>

                    <button
                      className="comment-toggle"
                      onClick={() => toggleComments(post._id)}
                    >
                      💬{" "}
                      {expandedComments[post._id]
                        ? "Hide comments"
                        : "Comments"}
                    </button>
                    {showMyActivity && (
                      <button
                        className="delete-button"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Comments */}
                  {expandedComments[post._id] && (
                    <div className="comments-section">
                      <h4>Comments</h4>

                      {comments[post._id]?.length === 0 ? (
                        <p className="no-comments">No comments yet.</p>
                      ) : (
                        <div className="comments-list">
                          {comments[post._id]?.map((comment) => (
                            <div className="comment-item" key={comment._id}>
                              <div className="comment-avatar">
                                {comment.author?.charAt(0)?.toUpperCase() ||
                                  "U"}
                              </div>

                              <div className="comment-body">
                                <div className="comment-author">
                                  {comment.author}
                                </div>

                                <p>{comment.content}</p>

                                <div className="comment-meta">
                                  <span>
                                    {new Date(
                                      comment.createdAt,
                                    ).toLocaleDateString()}
                                  </span>

                                  {showMyActivity && (
                                    <button
                                      className="delete-comment-button"
                                      onClick={() =>
                                        handleDeleteComment(
                                          post._id,
                                          comment._id,
                                        )
                                      }
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment */}
                      <div className="add-comment">
                        <textarea
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            handleCommentChange(post._id, e.target.value)
                          }
                          placeholder="Write a supportive comment..."
                          maxLength={500}
                          rows={2}
                        />

                        <div className="comment-footer">
                          <label>
                            <input
                              type="checkbox"
                              checked={Boolean(commentAnonymous[post._id])}
                              onChange={(e) =>
                                handleCommentAnonymousChange(
                                  post._id,
                                  e.target.checked,
                                )
                              }
                            />
                            Anonymous
                          </label>

                          <button
                            onClick={() => handleAddComment(post._id)}
                            disabled={
                              commentLoading[post._id] ||
                              !commentInputs[post._id]?.trim()
                            }
                          >
                            {commentLoading[post._id] ? "Adding..." : "Comment"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Community;
