import { tweetsData } from "./data.js";

// Simulated logged-in user
const currentUser = {
  handle: "@Scrimba",
  profilePic: "images/scrimbalogo.png",
};

document.addEventListener("click", (e) => {
  // Like button
  if (e.target.matches("i[data-like]")) {
    handleLikeClick(e.target.dataset.like);
  } else if (e.target.matches("i[data-retweet")) {
    handleRetweetClick(e.target.dataset.retweet);
  } else if (e.target.matches("i[data-reply]")) {
    handleReplyClick(e.target.dataset.reply);
  } else if (e.target.id === "tweet-btn") {
    handleTweetBtnClick();
  } else if (e.target.matches("button[data-reply-submit]")) {
    handleReplySubmitClick(e.target.dataset.replySubmit);
  } else if (e.target.matches("i[data-delete]")) {
    handleDeleteTweet(e.target.dataset.delete);
  } else if (e.target.matches("i[data-delete-reply]")) {
    handleDeleteReply(
      e.target.dataset.deleteReply,
      parseInt(e.target.dataset.replyIndex)
    );
  }
});

function handleLikeClick(tweetId) {
  console.log(tweetId);
  const targetTweetObj = tweetsData.filter((tweet) => {
    return tweet.uuid === tweetId;
  })[0];

  targetTweetObj.isLiked ? targetTweetObj.likes-- : targetTweetObj.likes++;

  targetTweetObj.isLiked = !targetTweetObj.isLiked; // Toggles isLiked between true and false.
  render();
  console.log(targetTweetObj);
}

function handleRetweetClick(tweetId) {
  const targetTweetObj = tweetsData.filter((tweet) => {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isRetweeted) {
    targetTweetObj.retweets--;
  } else {
    targetTweetObj.retweets++;
  }

  targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted; // Toggle between true and false.
  render();
}

function handleReplyClick(replyId) {
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden");
}

function handleTweetBtnClick() {
  const tweetInput = document.getElementById("tweet-input");
  // console.log(tweetInput.value);
  // empty string "" is falsy
  if (tweetInput.value) {
    tweetsData.unshift({
      handle: currentUser.handle,
      profilePic: currentUser.profilePic,
      likes: 0,
      retweets: 0,
      tweetText: tweetInput.value,
      replies: [],
      isLiked: false,
      isRetweeted: false,
      uuid: uuidv4(),
    });

    render();
    tweetInput.value = "";
    console.log(tweetsData);
  }
}

// Reply submission handler (using same user info)

function handleReplySubmitClick(tweetId) {
  const replyInput = document.getElementById(`reply-input-${tweetId}`);
  const replyText = replyInput.value.trim();

  if (!replyText) return; // prevent empty replies

  const targetTweetObj = tweetsData.filter(
    (tweet) => tweet.uuid === tweetId
  )[0];

  targetTweetObj.replies.push({
    handle: currentUser.handle,
    profilePic: currentUser.profilePic,
    tweetText: replyText,
  });
  render();
  replyInput.value = "";
  document.getElementById(`replies-${tweetId}`).classList.remove("hidden");
  console.log(targetTweetObj);
}

function handleDeleteTweet(tweetId) {
  const tweetIndex = tweetsData.findIndex((tweet) => tweet.uuid === tweetId);
  if (tweetIndex > -1) {
    tweetsData.splice(tweetIndex, 1);
    render();
  }
  console.log(tweetsData);
}

function handleDeleteReply(tweetId, replyIndex) {
  const targetTweetObj = tweetsData.filter(
    (tweet) => tweet.uuid === tweetId
  )[0];
  if (targetTweetObj && targetTweetObj.replies[replyIndex]) {
    targetTweetObj.replies.splice(replyIndex, 1);
    render();
  }
  document.getElementById(`replies-${tweetId}`).classList.remove("hidden");
  console.log(targetTweetObj);
}

function getFeedHtml() {
  let feedHtml = ``;

  tweetsData.forEach((tweet) => {
    let likeIconClass = tweet.isLiked ? "liked" : "";
    let retweetIconClass = tweet.isRetweeted ? "retweeted" : "";
    let repliesHtml = "";

    // Reply input section
    repliesHtml += `
      <div class="tweet-reply">
        <div class="tweet-inner">
          <img src="${currentUser.profilePic}" class="profile-pic">
          <div class="reply-box">
            <p class="handle">${currentUser.handle}</p>
            <textarea 
              id="reply-input-${tweet.uuid}" 
              class="reply-input" 
              placeholder="Tweet your reply..."></textarea>
            <button class="reply-btn" data-reply-submit="${tweet.uuid}">Reply</button>
          </div>
        </div>
      </div>
    `;

    // Existing replies
    if (tweet.replies.length) {
      tweet.replies.forEach((reply, index) => {
        repliesHtml += `
          <div class="tweet-reply">
            <div class="tweet-inner">
              <img src="${reply.profilePic}" class="profile-pic">
              <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
                ${
                  reply.handle === currentUser.handle
                    ? `<span class="tweet-detail"><i class="fa-solid fa-trash" data-delete-reply="${tweet.uuid}" data-reply-index="${index}"></i></span>`
                    : ""
                }
              </div>
            </div>
          </div>
        `;
      });
    }

    // Tweet-level delete button
    const deleteTweetBtn =
      tweet.handle === currentUser.handle
        ? `<span class="tweet-detail"><i class="fa-solid fa-trash" data-delete="${tweet.uuid}"></i></span>`
        : "";

    // Full tweet HTML
    feedHtml += `
      <div class="tweet">
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
                <i class="fa-solid fa-heart ${likeIconClass}" data-like="${tweet.uuid}"></i>
                ${tweet.likes}
              </span>
              <span class="tweet-detail">
                <i class="fa-solid fa-retweet ${retweetIconClass}" data-retweet="${tweet.uuid}"></i>
                ${tweet.retweets}
              </span>
              ${deleteTweetBtn}
            </div>
          </div>
        </div>
        <div class="hidden" id="replies-${tweet.uuid}">
          ${repliesHtml}
        </div
      </div>
    `;
  });
  // console.log(feedHtml);
  return feedHtml;
}

function render() {
  document.getElementById("feed").innerHTML = getFeedHtml();
}

render();
