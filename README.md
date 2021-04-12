# Lambda stripe assign to custom attribute confirm signup trigger

Lambda function after user confirms account adds user to stripe and then updated custom cognito field.

### Dependancies

```
npm i ftx-rest-api
```

### Prerequisites

Create new secrets manager
Create you api in FTX and copy the values into FTX_API_SECRET: 'API SECRET HERE ' & FTX_API_KEY: 'API VALUE HERE'

Make sure to update your lambda policy to include

```
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue"
  ],
  "Resource": {
    "Fn::Sub": [
      "arn:aws:secretsmanager:${region}:${account}:secret:FTX_MAIN-0RPnWV",
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

## Setup Trigger
Add Trigger

EventBridge(CloudWatch Events)

Create a new rule

Schedule expression cron(50 * * * ? *)
