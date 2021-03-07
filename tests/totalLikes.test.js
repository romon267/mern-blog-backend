const { totalLikes } = require('../utils/list_helper');

describe('totalLikes', () => {
  test('of multiple posts return their sum', () => {
    const posts = [
      {
        title: 'post1',
        likes: 23,
        author: 'bigBrain',
      },
      {
        title: 'post2',
        likes: 73,
        author: 'dummy',
      },
      {
        title: 'post1',
        likes: 23,
        author: 'bigBrain',
      },
      {
        title: 'post2',
        likes: 73,
        author: 'dummy',
      },
    ];
    expect(totalLikes(posts)).toBe(192);
  });

  test('of empty list is 0', () => {
    const posts = [];
    expect(totalLikes(posts)).toBe(0);
  });

  test('of one post list is this post likes', () => {
    const posts = [
      {
        title: 'post1',
        likes: 23,
        author: 'bigBrain',
      },
    ];
    expect(totalLikes(posts)).toBe(23);
  });
});
