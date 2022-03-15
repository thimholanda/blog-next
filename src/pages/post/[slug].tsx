import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const contents = post.data.content.map(el => {
    return {
      heading: el.heading,
      body: RichText.asHtml(el.body),
    };
  });

  return (
    <>
      <Head>
        <title>Posts | {post.data.title}</title>
      </Head>
      <main>
        <article>
          <div
            className={styles.postBanner}
            style={{ backgroundImage: `url(${post.data.banner.url})` }}
          />
          <div className={commonStyles.container}>
            <div className={styles.post}>
              <h1>{post.data.title}</h1>
            </div>
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
              <div>
                <FiClock />
                <span>4 min</span>
              </div>
            </div>

            {contents.map(content => {
              return (
                <div key={content.heading}>
                  <div>
                    <h2 style={{ marginTop: '3rem' }}>{content.heading}</h2>
                  </div>
                  <div
                    className={styles.postContent}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: String(content.body),
                    }}
                  />
                </div>
              );
            })}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title'],
    }
  );

  const postPaths = posts.results.map(post => {
    return { params: { slug: post.uid } };
  });

  return { paths: postPaths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
