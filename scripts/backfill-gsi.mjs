// One-time backfill: stamp gsi1pk on classification rows created before the
// byCreatedAt GSI existed, so they appear in the dashboard's Query.
// Usage: node --env-file=.env.local scripts/backfill-gsi.mjs
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "eu-west-2";
const table = process.env.DDB_TABLE || "seefood-classifications";
const GSI_PK = "CLASSIFICATION";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

let scanned = 0;
let updated = 0;
let key;
do {
  const out = await ddb.send(
    new ScanCommand({ TableName: table, ExclusiveStartKey: key }),
  );
  for (const item of out.Items ?? []) {
    scanned += 1;
    if (!item.gsi1pk) {
      await ddb.send(
        new UpdateCommand({
          TableName: table,
          Key: { id: item.id },
          UpdateExpression: "SET gsi1pk = :pk",
          ExpressionAttributeValues: { ":pk": GSI_PK },
        }),
      );
      updated += 1;
    }
  }
  key = out.LastEvaluatedKey;
} while (key);

console.log(`Scanned ${scanned}, backfilled ${updated}.`);
