// ====== Imports ======
import { tweetsData } from "./data.js";

// ====== Simulated logged-in user ======
const currentUser = {
  handle: "@Scrimba",
  profilePic: "images/scrimbalogo.png",
};

// ====== Utility Functions ======
const getTweetById = (id) => tweetsData.find((tweet) => tweet.uuid === id);

const toggleLike = (tweet) => {
  tweet.isLiked = !tweet.isLiked;
  tweet.likes += tweet.isLiked ? 1 : -1;
};

const toggleRetweet = (tweet) => {
  tweet.isRetweeted = !tweet.isRetweeted;
  tweet.retweets += tweet.isRetweeted ? 1 : -1;
};

const addReply = (tweet, reply) => tweet.replies.push(reply);

const deleteTweetById = (tweetId) => {
  const index = tweetsData.findIndex((tweet) => tweet.uuid === tweetId);
  if (index > -1) tweetsData.splice(index, 1);
};

const deleteReplyByIndex = (tweet, replyIndex) => {
  if (tweet && tweet.replies[replyIndex]) tweet.replies.splice(replyIndex, 1);
};

// ====== Component Rendering Functions ======
const createReplyHtml = (reply, tweetId, index) => `
  <div class="tweet-reply">
    <div class="tweet-inner">
      <img src="${reply.profilePic}" class="profile-pic">
      <div>
        <p class="handle">${reply.handle}</p>
        <p class="tweet-text">${reply.tweetText}</p>
        ${
          reply.handle === currentUser.handle
            ? `<i class="fa-solid fa-trash" data-delete-reply="${tweetId}" data-reply-index="${index}"></i>`
            : ""
        }
      </div>
    </div>
  </div>
`;

const createReplyInputHtml = (tweetId) => `
  <div class="tweet-reply">
    <div class="tweet-inner">
      <img src="${currentUser.profilePic}" class="profile-pic">
      <div class="reply-box">
        <p class="handle">${currentUser.handle}</p>
        <textarea id="reply-input-${tweetId}" class="reply-input" placeholder="Tweet your reply..."></textarea>
        <button class="reply-btn" data-reply-submit="${tweetId}">Reply</button>
      </div>
    </div>
  </div>
`;

const createTweetHtml = (tweet) => {
  const likeClass = tweet.isLiked ? "liked" : "";
  const retweetClass = tweet.isRetweeted ? "retweeted" : "";

  // Reply input
  let repliesHtml = createReplyInputHtml(tweet.uuid);

  // Existing replies
  repliesHtml += tweet.replies
    .map((reply, index) => createReplyHtml(reply, tweet.uuid, index))
    .join("");

  // Delete tweet button
  const deleteTweetBtn =
    tweet.handle === currentUser.handle
      ? `<span class="tweet-detail"><i class="fa-solid fa-trash" data-delete="${tweet.uuid}"></i></span>`
      : "";

  return `
    <div class="tweet" id="tweet-${tweet.uuid}">
      <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
          <p class="handle">${tweet.handle}</p>
          <p class="tweet-text">${tweet.tweetText}</p>
          <div class="tweet-details">
            <span class="tweet-detail">
              <i class="fa-regular fa-comment-dots" data-reply="${tweet.uuid}"></i>
              ${tweet.replies.length}
            </span>
            <span class="tweet-detail">
              <i class="fa-solid fa-heart ${likeClass}" data-like="${tweet.uuid}"></i>
              ${tweet.likes}
            </span>
            <span class="tweet-detail">
              <i class="fa-solid fa-retweet ${retweetClass}" data-retweet="${tweet.uuid}"></i>
              ${tweet.retweets}
            </span>
            ${deleteTweetBtn}
          </div>
        </div>
      </div>
      <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
      </div>
    </div>
  `;
};

// ====== Render Functions ======

// Full feed render (used for initial load and adding new tweets)
// Every tweet on the page
const renderFeed = () => {
  document.getElementById("feed").innerHTML = tweetsData
    .map(createTweetHtml)
    .join("");
};

// Update only a single tweet (partial DOM update)
const updateTweetDom = (tweet) => {
  // Only the clicked tweet
  const tweetElement = document.getElementById(`tweet-${tweet.uuid}`);
  if (!tweetElement) return;
  tweetElement.outerHTML = createTweetHtml(tweet);
};

// ====== Event Delegation ======
document.addEventListener("click", (e) => {
  const target = e.target;

  // Like
  if (target.matches("i[data-like]")) {
    const tweet = getTweetById(target.dataset.like);
    toggleLike(tweet);
    updateTweetDom(tweet);
  }

  // Retweet
  if (target.matches("i[data-retweet]")) {
    const tweet = getTweetById(target.dataset.retweet);
    toggleRetweet(tweet);
    updateTweetDom(tweet);
  }

  // Show/hide reply box
  if (target.matches("i[data-reply]")) {
    document
      .getElementById(`replies-${target.dataset.reply}`)
      .classList.toggle("hidden");
  }

  // Submit tweet
  if (target.id === "tweet-btn") {
    const input = document.getElementById("tweet-input");
    if (input.value.trim()) {
      tweetsData.unshift({
        handle: currentUser.handle,
        profilePic: currentUser.profilePic,
        likes: 0,
        retweets: 0,
        tweetText: input.value.trim(),
        replies: [],
        isLiked: false,
        isRetweeted: false,
        uuid: uuidv4(),
      });
      input.value = "";
      renderFeed(); // full render to add the new tweet at the top
    }
  }

  // Submit reply
  if (target.matches("button[data-reply-submit]")) {
    const tweet = getTweetById(target.dataset.replySubmit);
    const replyInput = document.getElementById(`reply-input-${tweet.uuid}`);
    const replyText = replyInput.value.trim();
    if (!replyText) return;
    addReply(tweet, {
      handle: currentUser.handle,
      profilePic: currentUser.profilePic,
      tweetText: replyText,
    });
    replyInput.value = "";
    updateTweetDom(tweet); // partial update
    document.getElementById(`replies-${tweet.uuid}`).classList.remove("hidden");
  }

  // Delete tweet
  if (target.matches("i[data-delete]")) {
    deleteTweetById(target.dataset.delete);
    const tweetElement = document.getElementById(
      `tweet-${target.dataset.delete}`
    );
    if (tweetElement) tweetElement.remove(); // remove only the tweet DOM
  }

  // Delete reply
  if (target.matches("i[data-delete-reply]")) {
    const tweet = getTweetById(target.dataset.deleteReply);
    deleteReplyByIndex(tweet, parseInt(target.dataset.replyIndex));
    updateTweetDom(tweet); // partial update
    document.getElementById(`replies-${tweet.uuid}`).classList.remove("hidden");
  }
});

// ====== Initial Render ======
renderFeed();
