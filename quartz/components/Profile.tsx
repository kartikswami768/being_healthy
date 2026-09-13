import { QuartzComponent, QuartzComponentConstructor } from "./types"

const Profile: QuartzComponent = () => {
  return (
    <div class="profile">
      <div class="profile-site-title">Notes on Being Human</div>

      <img src="/me.jpg" alt="Dr. Kartik Swami" />

      <div class="profile-name">Dr. Kartik Swami</div>

      <div class="profile-role">MBBS · Maulana Azad Medical College</div>
      <div class="profile-role profile-role-secondary">Medicine · Writing · Being Human</div>
    </div>
  )
}

Profile.css = `
.profile-site-title {
  display: none;
  margin-bottom: 1rem;
  color: var(--site-sage-deep);
  font-family: var(--headerFont);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.profile-role {
  margin-top: 0.3rem;
  color: var(--site-muted);
  font-size: 0.82rem;
  line-height: 1.4;
}

.profile-role-secondary {
  margin-top: 0.1rem;
}

.profile-name {
  color: var(--site-heading);
  font-family: var(--headerFont);
  font-weight: 600;
}

@media all and (min-width: 801px) and (max-width: 1200px) {
  .left .profile {
    margin-bottom: 1.15rem;
  }

  .left .profile img {
    width: 56px;
    height: 56px;
    margin-bottom: 0.45rem;
  }

  .left .profile-name {
    font-size: 0.92rem;
  }

  .left .profile-role {
    margin-top: 0.2rem;
    font-size: 0.67rem;
    line-height: 1.2;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  .left .profile-role-secondary {
    margin-top: 0.12rem;
  }

  .left .profile + .flex-component {
    margin-top: 0.65rem;
  }
}

@media all and (max-width: 800px) {
  .mobile-header .profile-site-title {
    display: block;
  }
}
`

export default (() => Profile) satisfies QuartzComponentConstructor
