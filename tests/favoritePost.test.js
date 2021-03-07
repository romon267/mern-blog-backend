const { findFavoritePost } = require('../utils/list_helper.js');

describe('Find favorite post', () => {
  test('of multiple posts', () => {
    const posts = [
      {
        title: 'post one',
        author: 'user1',
        likes: 23,
      },
      {
        title: 'post2',
        author: 'user2',
        likes: 24,
      },
      {
        title: 'post3',
        author: 'user3',
        likes: 12,
      },
      {
        title: 'post4',
        author: 'user4',
        likes: 12,
      },
      {
        title: 'post5',
        author: 'user5',
        likes: 37,
      },
      {
        title: 'post6',
        author: 'user6',
        likes: 33,
      },
    ];
    expect(findFavoritePost(posts)).toEqual(posts[4]);
  });

  test('of one post array', () => {
    const posts = [
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12,
      },
    ];
    expect(findFavoritePost(posts)).toEqual(posts[0]);
  });

  test('of post array with 1 post', () => {
    const posts = [
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 22,
      },
    ];
    expect(findFavoritePost(posts)).toEqual(posts[0]);
  });

  test('of post array with 0 likes and 1 post', () => {
    const posts = [
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 0,
      },
    ];
    expect(findFavoritePost(posts)).toEqual(posts[0]);
  });
});
