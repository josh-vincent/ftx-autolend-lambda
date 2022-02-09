# Lambda autolend USD hourly

Lambda function to get current available USD balance and lend it hourly.

### Dependancies

`npm i ftx-rest-api`


### Prerequisites

- Create new secrets in AWS secrets manager with keys "FTX_API_SECRET" & "FTX_API_KEY"
- Create your API in FTX and copy the values

```
{
  FTX_API_SECRET: 'API SECRET HERE',
  FTX_API_KEY: 'API VALUE HERE'
}
```

Make sure to update your lambda policy to include

```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue"
  ],
  "Resource": {
    "Fn::Sub": [
      "arn:aws:secretsmanager:${region}:${account}:secret:FTX-ID-FROM-SECRETS-MANAGER_1234",
      {
        "region": {
          "Ref": "AWS::Region"
        },
        "account": {
          "Ref": "AWS::AccountId"
        }
      }
    ]
  }
}
```

### Get secret from secret manager 
```javascript 

const secrets = await getSecret('FTX-ID-FROM-SECRETS-MANAGER')

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
```

### Get current balances 
```javascript 
async function getCurrentBalances(ftx)
{
  const getBalancesResult = await ftx.request({
    method: 'GET',
    path: '/wallet/balances',
  })
  return getBalancesResult
}
```

### Lend all 
```javascript

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
```

### Run 
```javascript 
  const secrets = await getSecret('FTX-ID-FROM-SECRETS-MANAGER');
  const { FTX_API_SECRET, FTX_API_KEY } = secrets;
  
  
  let currency = 'USD';
  let subAccount = '';
  
  const ftx = new FTXRest({ key: FTX_API_KEY, secret: FTX_API_SECRET, subaccount: subAccount });
  
  const current = await getCurrentBalances(ftx).catch(err => console.log(err));
  
  const currrencyObject = current.result.find(result => result.coin === currency);
  
  const lending = await lendAll(ftx, currrencyObject).catch(err => console.log(err));
  
```

## Setup Trigger

* Add Trigger
* EventBridge(CloudWatch Events)
* Create a new rule
* Schedule expression cron(50 * * * ? *) // Make this happen on the 50th minute of the hour as rates roll over on the hour.
