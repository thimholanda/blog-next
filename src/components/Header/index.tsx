import Link from 'next/link';
import styles from './header.module.scss';

type HeaderProps = {
  height: string;
};

export default function Header({ height }: HeaderProps): JSX.Element {
  return (
    <header style={{ height }} className={styles.headerContainer}>
      <div style={{ height }} className={styles.headerContent}>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
