import { QuartzComponent, QuartzComponentConstructor } from "./types"

const Profile: QuartzComponent = () => {
  return (
    <div class="profile">
      <img src="/me.jpg" alt="Dr. Kartik Swami" />

      <div class="profile-name">
        Dr. Kartik Swami
      </div>

      <div class="profile-role">
        Medicine · Writing · Being Human
      </div>
    </div>
  )
}

Profile.css = `
.profile-role {
  margin-top: 0.3rem;
  color: var(--site-muted);
  font-size: 0.82rem;
  line-height: 1.4;
}
`

export default (() => Profile) satisfies QuartzComponentConstructor