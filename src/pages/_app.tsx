import { AppProps } from 'next/app';
import Header from '../components/Header';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const componentName = Component.name;
  return (
    <>
      <Header height={componentName === 'Home' ? '10rem' : '5rem'} />

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
