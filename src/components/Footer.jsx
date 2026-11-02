import { Link } from 'react-router'
import styles from './Footer.module.css'
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <Link to="/">conduit</Link>
        <span>생각을 나누고, 함께 배우는 공간.</span>
      </div>
    </footer>
  )
}
