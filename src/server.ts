import { createApp } from './app/app'
import { env } from './config/env'

const app = createApp()

app.listen(Number(env.PORT), () => {
  console.log(`Server running at http://localhost:${env.PORT}`)
})
