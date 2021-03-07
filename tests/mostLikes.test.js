const { mostLikes } = require('../utils/list_helper');

describe('Author with most likes', () => {
  test('of array with multiple authors and posts', () => {
    const posts = [
      {
        title: 'post one',
        author: 'user2',
        likes: 1,
      },
      {
        title: 'post2',
        author: 'user1',
        likes: 2,
      },
      {
        title: 'post3',
        author: 'user1',
        likes: 2,
      },
      {
        title: 'post4',
        author: 'user1',
        likes: 2,
      },
      {
        title: 'post5',
        author: 'user2',
        likes: 1,
      },
      {
        title: 'post6',
        author: 'user2',
        likes: 2,
      },
    ];
    const author = { name: 'user1', likes: 6 };
    expect(mostLikes(posts)).toEqual(author);
  });

  test('of array with one post', () => {
    const posts = [
      {
        title: 'post one',
        author: 'user1',
        likes: 23,
      },
    ];
    const author = { name: 'user1', likes: 23 };
    expect(mostLikes(posts)).toEqual((author));
  });

  test('of empty array', () => {
    const posts = [];
    const empty = [];
    expect(mostLikes(posts)).toEqual((empty));
  });
});
