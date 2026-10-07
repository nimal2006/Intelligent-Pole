name := "pole-vault-spark-pipeline"

version := "1.0.0"

scalaVersion := "2.12.18"

val sparkVersion = "3.5.1"

libraryDependencies ++= Seq(
  // Apache Spark Core & SQL Fundamentals
  "org.apache.spark" %% "spark-core"      % sparkVersion % "provided",
  "org.apache.spark" %% "spark-sql"       % sparkVersion % "provided",
  "org.apache.spark" %% "spark-streaming" % sparkVersion % "provided",
  "org.apache.spark" %% "spark-mllib"     % sparkVersion % "provided",

  // Kafka integration for real-time sensor streaming
  "org.apache.spark" %% "spark-sql-kafka-0-10" % sparkVersion,

  // Testing
  "org.scalatest" %% "scalatest" % "3.2.17" % Test
)

scalacOptions ++= Seq(
  "-deprecation",
  "-feature",
  "-unchecked",
  "-Xlint"
)
