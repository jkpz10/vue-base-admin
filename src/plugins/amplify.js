import Amplify from 'aws-amplify'

Amplify.configure({
  Auth: {
    region: 'us-east-2',
    identityPoolRegion: 'us-east-2',
    userPoolId: process.env.VUE_APP_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.VUE_APP_COGNITO_USER_POOL_WEB_CLIENT_ID,
  },
})
