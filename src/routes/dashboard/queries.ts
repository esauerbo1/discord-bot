import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'

async function authenticate() {
  const { privateKey } = JSON.parse(process.env.GITHUB_PRIVATE_KEY)
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    privateKey: privateKey,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  })
  try {
    const { token } = await auth({
      type: 'installation',
      installationId: process.env.GITHUB_INSTALLATION_ID,
    })
    return token
  } catch (err) {
    console.error(`Error fetching installation token: ${err}`)
  }
  return null
}

export async function getGHUsername(userId: string) {
  const token = await authenticate()
  const octokit = new Octokit({
    auth: `token ${token}`,
  })
  try {
    const { data } = await octokit.request('GET /orgs/{org}/members', {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    const user = data[data.findIndex((user) => user.id === Number(userId))]
    if (user?.login) return ` ${user.login}`
  } catch (error) {
    console.error(`Error getting github username ${userId}: ${error.message}`)
  }
  return ''
}
