import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from 'react-icons/fi';
import next, { GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useEffect, useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [nextPage, setNextPage] = useState(null as string);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    setNextPage(postsPagination.next_page);
  }, [postsPagination.next_page]);

  function handleShowMorePosts(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then((data: PostPagination) => {
        setNextPage(data.next_page);

        const updatedPosts = [...posts];
        data.results.map(post => {
          const formatedDate = format(
            new Date(post.first_publication_date),
            'PP',
            {
              locale: ptBR,
            }
          );

          // eslint-disable-next-line no-param-reassign
          post.first_publication_date = formatedDate;

          return updatedPosts.push(post);
        });

        setPosts(updatedPosts);
      });
  }

  return (
    <>
      <Head>
        <title>Posts | Spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {postsPagination.results.map(post => {
            return (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>
                  <div className={commonStyles.iconsContainer}>
                    <div>
                      <FiCalendar />
                      <time>
                        {format(new Date(post.first_publication_date), 'PP', {
                          locale: ptBR,
                        })}
                      </time>
                    </div>
                    <div>
                      <FiUser />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}

          {posts.map(post => {
            return (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>
                  <div className={commonStyles.iconsContainer}>
                    <div>
                      <FiCalendar />
                      <time>
                        {format(new Date(post.first_publication_date), 'PP', {
                          locale: ptBR,
                        })}
                      </time>
                    </div>
                    <div>
                      <FiUser />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
        {nextPage && (
          <button
            className={styles.btnShowMorePosts}
            onClick={handleShowMorePosts}
            type="button"
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

type StaticProps = {
  props: {
    postsPagination: {
      next_page: string;
      results: Post[];
    };
  };
  revalidate: number;
};

export const getStaticProps: GetStaticProps =
  async (): Promise<StaticProps> => {
    const prismic = getPrismicClient();

    const postsResponse = await prismic.query(
      [Prismic.predicates.at('document.type', 'post')],
      {
        fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
        pageSize: 1,
      }
    );

    const posts = postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    return {
      props: {
        postsPagination: {
          next_page: postsResponse.next_page,
          results: posts,
        },
      },
      revalidate: 60 * 30, // 30 minutes
    };
  };
