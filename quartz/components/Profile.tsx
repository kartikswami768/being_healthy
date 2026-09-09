import { QuartzComponent, QuartzComponentConstructor } from "./types"

const Profile: QuartzComponent = () => {
  return (
    <div class="profile">
      <img src="/me.jpg" alt="Kartik Swami" />
      <div class="profile-name">Kartik Swami</div>
    </div>
  )
}

Profile.css = `
.profile {
  text-align: center;
  margin-bottom: 1.5rem;
}

.profile img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-name {
  margin-top: 0.6rem;
  font-weight: 600;
}
`

export default (() => Profile) satisfies QuartzComponentConstructor