const AWS = require('aws-sdk')
const FTXRest = require('ftx-api-rest')
//cron(50 * * * ? *) run every hour on at 50minscd
exports.handler = async (event, callback) =>
{
  const secrets = await getSecret('FTX-ID-FROM-SECRETS-MANAGER')
  const { FTX_API_SECRET, FTX_API_KEY } = secrets
  const ftx = new FTXRest({ key: FTX_API_KEY, secret: FTX_API_SECRET, subaccount: subAccount })

  let currency = 'USD'
  let subAccount = '' // or sub account name here

  const current = await getCurrentBalances(ftx).catch(err => console.log(err))
  console.log("Current balances:", current);

  const currrencyObject = current.result.find(result => result.coin === currency);
  console.log("currrencyObject", currrencyObject)

  const lending = await lendAll(ftx, currrencyObject).catch(err => console.log(err))
  console.log("lending result:", lending)
  return lending
};

async function getSecret(secretId)
{
  const secretsManager = new AWS.SecretsManager()
  const secret = await secretsManager.getSecretValue({ SecretId: secretId }).promise()
  if (!secret)
  {
    throw new Error('Secret not found')
  }
  let secretString = JSON.parse(secret.SecretString);
  return secretString
}

async function getCurrentBalances(ftx)
{
  const getBalancesResult = await ftx.request({
    method: 'GET',
    path: '/wallet/balances',
  })
  return getBalancesResult
}

async function lendAll(ftx, currencyObject)
{
  const { coin, total } = currencyObject
  const offersResult = await ftx.request({
    method: 'POST',
    path: '/spot_margin/offers',
    data: {
      coin: coin,
      size: total,
      rate: 0.000001,
    },
  })
  return offersResult
}
