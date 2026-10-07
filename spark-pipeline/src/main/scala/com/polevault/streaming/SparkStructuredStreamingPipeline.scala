package com.polevault.streaming

import org.apache.spark.sql.{Dataset, SparkSession}
import org.apache.spark.sql.functions._
import org.apache.spark.sql.streaming.{OutputMode, Trigger}
import org.apache.spark.sql.types._
import com.polevault.models.RawSensorSample

/**
 * ============================================================================
 * SPARK STRUCTURED STREAMING: REAL-TIME 1,000 Hz SENSOR INGESTION
 * ============================================================================
 * Demonstrates:
 * 1. SparkSession entry point (replacing legacy StreamingContext)
 * 2. Event-time vs Processing-time semantics
 * 3. Watermarking (handling late-arriving IoT telemetry from the runway)
 * 4. Sliding & Tumbling Window aggregations over continuous time series
 * 5. Structured Streaming schema inference & strongly typed Datasets
 * 6. Mathematical Centroid UDF for real-time contact localization along the 4.5m bar
 */
object SparkStructuredStreamingPipeline {

  def main(args: Array[String]): Unit = {
    // 1. Initializing SparkSession
    val spark = SparkSession.builder()
      .appName("PoleVault-Spark-Structured-Streaming")
      .master("local[*]")
      .config("spark.sql.shuffle.partitions", "4")
      .getOrCreate()

    import spark.implicits._

    println("==> Spark Structured Streaming Engine Initialized.")

    // 2. Define Explicit Schema for 1,000 Hz Telemetry Feed
    val sensorSchema = new StructType()
      .add("timestamp", TimestampType, nullable = false)
      .add("sampleIndex", LongType, nullable = false)
      .add("p1", DoubleType, nullable = false)
      .add("sg1", DoubleType, nullable = false)
      .add("p2", DoubleType, nullable = false)
      .add("sg2", DoubleType, nullable = false)
      .add("p3", DoubleType, nullable = false)
      .add("imuAx", DoubleType, nullable = false)
      .add("imuAy", DoubleType, nullable = false)
      .add("imuAz", DoubleType, nullable = false)
      .add("imuGx", DoubleType, nullable = false)
      .add("imuGy", DoubleType, nullable = false)
      .add("imuGz", DoubleType, nullable = false)

    // 3. User Defined Function (UDF): Compute Contact Position Centroid along 4.5m bar
    val calculateCentroidUDF = udf((p1: Double, p2: Double, p3: Double) => {
      val x1 = 1.125 // P1 position (m)
      val x2 = 2.250 // P2 position (m)
      val x3 = 3.375 // P3 position (m)
      val w1 = math.max(0.0, p1)
      val w2 = math.max(0.0, p2)
      val w3 = math.max(0.0, p3)
      val sumW = w1 + w2 + w3
      if (sumW > 0.05) (w1 * x1 + w2 * x2 + w3 * x3) / sumW else 2.250
    })

    // 4. Ingest Streaming Data (From Kafka topic or Socket stream)
    // Here configured using Spark's rate source to simulate a continuous 1,000 samples/sec stream
    val rawStream = spark.readStream
      .format("rate")
      .option("rowsPerSecond", "1000") // 1 kHz sampling rate
      .load()
      .select(
        col("timestamp"),
        col("value").cast(LongType).as("sampleIndex"),
        // Simulated voltage & strain with random noise injection
        (rand() * 0.1).as("p1"),
        (rand() * 10.0).as("sg1"),
        (rand() * 0.1).as("p2"),
        (rand() * 10.0).as("sg2"),
        (rand() * 0.1).as("p3"),
        (lit(0.0) + rand() * 0.5).as("imuAx"),
        (lit(0.0) + rand() * 0.5).as("imuAy"),
        (lit(9.81) + rand() * 0.5).as("imuAz"),
        (rand() * 2.0).as("imuGx"),
        (rand() * 2.0).as("imuGy"),
        (rand() * 2.0).as("imuGz")
      )

    // 5. Apply Event-Time Watermarking (handles up to 500ms of network latency / jitter)
    val watermarkedStream = rawStream
      .withWatermark("timestamp", "500 milliseconds")

    // 6. Sliding Window Aggregation: 200ms window, 50ms slide
    // Computes maximum shockwave peaks, strain RMS, and estimated contact position
    val windowedMetrics = watermarkedStream
      .groupBy(
        window(col("timestamp"), "200 milliseconds", "50 milliseconds")
      )
      .agg(
        max("p1").as("p1_max"),
        max("p2").as("p2_max"),
        max("p3").as("p3_max"),
        avg("sg1").as("sg1_avg"),
        avg("sg2").as("sg2_avg"),
        max(sqrt(col("imuAx") * col("imuAx") + col("imuAy") * col("imuAy") + col("imuAz") * col("imuAz"))).as("max_accel_g"),
        calculateCentroidUDF(max("p1"), max("p2"), max("p3")).as("estimated_x_m")
      )
      .withColumn(
        "contact_detected",
        col("p1_max") > 0.5 || col("p2_max") > 0.5 || col("p3_max") > 0.5
      )
      .withColumn(
        "sector",
        when(col("estimated_x_m") < 1.875, "LEFT")
          .when(col("estimated_x_m") <= 2.625, "CENTER")
          .otherwise("RIGHT")
      )

    // 7. Streaming Query Sink: Output to in-memory console or Kafka topic
    val query = windowedMetrics.writeStream
      .outputMode(OutputMode.Update())
      .format("console")
      .option("truncate", "false")
      .trigger(Trigger.ProcessingTime("500 milliseconds"))
      .start()

    println("==> Streaming Query active. Press Ctrl+C or terminate to stop.")
    // query.awaitTermination() // In production driver
    query.stop()
    spark.stop()
  }
}
