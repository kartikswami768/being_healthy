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

@media all and (max-width: 800px) {
  .mobile-header .profile-site-title {
    display: block;
  }
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

// Hide volatile date/reading-time metadata on the publication pages.
body[data-slug="index"] .content-meta,
body[data-slug="blog"] .content-meta,
body[data-slug="about"] .content-meta {
  display: none;
}

// Internal links should read like links, not highlighted labels.
a.internal {
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
`

export default (() => Profile) satisfies QuartzComponentConstructor
