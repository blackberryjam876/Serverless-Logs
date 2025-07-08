provider "aws" {
  region = var.region
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "raw_bucket" {
  bucket = "logs-raw-${random_id.suffix.hex}"
  acl    = "private"
}

resource "aws_s3_bucket" "processed_bucket" {
  bucket = "logs-processed-${random_id.suffix.hex}"
  acl    = "private"
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

output "raw_bucket_name" {
  value = aws_s3_bucket.raw_bucket.bucket
}

output "processed_bucket_name" {
  value = aws_s3_bucket.processed_bucket.bucket
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda_exec.arn
}
