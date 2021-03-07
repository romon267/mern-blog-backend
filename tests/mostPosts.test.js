const { mostPosts } = require('../utils/list_helper');

describe('Author with most posts', () => {
  test('of array with multiple authors and posts', () => {
    const posts = [
      {
        title: 'post one',
        author: 'user2',
        likes: 23,
      },
      {
        title: 'post2',
        author: 'user1',
        likes: 24,
      },
      {
        title: 'post3',
        author: 'user1',
        likes: 12,
      },
      {
        title: 'post4',
        author: 'user1',
        likes: 12,
      },
      {
        title: 'post5',
        author: 'user2',
        likes: 37,
      },
      {
        title: 'post6',
        author: 'user2',
        likes: 33,
      },
    ];
    const author = { name: 'user2', posts: 3 };
    expect(mostPosts(posts)).toEqual(author);
  });

  test('of array with one post', () => {
    const posts = [
      {
        title: 'post one',
        author: 'user1',
        likes: 23,
      },
    ];
    const author = { name: 'user1', posts: 1 };
    expect(mostPosts(posts)).toEqual((author));
  });

  test('of empty array', () => {
    const posts = [];
    const empty = [];
    expect(mostPosts(posts)).toEqual((empty));
  });
});
