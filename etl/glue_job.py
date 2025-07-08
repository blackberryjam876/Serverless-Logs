import sys
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

raw_bucket = "<RAW_BUCKET>"
path = f"s3://{raw_bucket}/logs/*"
df = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={"paths": [path]},
    format="json"
)
df = df.resolveChoice(specs=[('timestamp', 'cast:long')])
df = df.withColumn('timestamp', df['timestamp'].cast('timestamp'))

sf_options = {
    "sfURL": "<account>.snowflakecomputing.com",
    "sfUser": "USER",
    "sfPassword": "PASSWORD",
    "sfDatabase": "LOGS_DB",
    "sfSchema": "PUBLIC",
    "sfTable": "LOGS",
    "sfWarehouse": "COMPUTE_WH"
}
glueContext.write_dynamic_frame.from_options(
    frame=df,
    connection_type="snowflake",
    connection_options=sf_options
)
job.commit()
