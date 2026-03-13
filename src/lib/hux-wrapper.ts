// Wrapper for @heroku/heroku-cli-util to make it easier to mock in tests
let huxInstance: typeof import('@heroku/heroku-cli-util').hux | undefined

export async function getHux() {
  if (!huxInstance) {
    const {hux} = await import('@heroku/heroku-cli-util')
    huxInstance = hux
  }

  return huxInstance
}
