const totalLikes = (postsList) => postsList.reduce((sum, i) => sum + i.likes, 0);

const findFavoritePost = (postsList) => {
  const dummyStart = {
    title: 'dummy',
    likes: 0,
  };
  return postsList
    .reduce((highest, current) => (current.likes >= highest.likes ? current : highest), dummyStart);
};

const mostStats = (postsList, stat) => {
  let authors = [];
  postsList.forEach((post) => {
    console.log('each post author.username', post);
    if (authors.some((author) => author.username === post.author.username)) {
      const newAuthors = [...authors];
      const upAuthorIndex = newAuthors
        .findIndex((author) => author.username === post.author.username);
      const upAuthor = newAuthors.find((author) => author.username === post.author.username);
      upAuthor.posts += 1;
      upAuthor.likes += post.likes;
      newAuthors[upAuthorIndex] = upAuthor;
      authors = newAuthors;
    } else {
      authors = authors.concat({ username: post.author.username, posts: 1, likes: post.likes });
    }
  });
  if (authors.length === 0) {
    return [];
  }
  if (stat === 'posts') {
    const { username, posts } = authors
      .reduce((highest, current) => (current.posts > highest.posts ? current : highest),
        { username: 'dummy', posts: 0 });
    return { username, posts };
  }
  // if stat === 'likes'
  const { username, likes } = authors
    .reduce((highest, current) => (current.likes > highest.likes ? current : highest),
      { username: 'dummy', likes: 0 });
  console.log('loggin authors', authors);
  return { username, likes };
};

const mostPosts = (postsList) => mostStats(postsList, 'posts');

const mostLikes = (postsList) => mostStats(postsList, 'likes');

module.exports = {
  totalLikes,
  findFavoritePost,
  mostPosts,
  mostLikes,
};
