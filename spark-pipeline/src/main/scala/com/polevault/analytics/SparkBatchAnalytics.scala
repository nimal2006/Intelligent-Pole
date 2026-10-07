package com.polevault.analytics

import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.functions._
import org.apache.spark.ml.Pipeline
import org.apache.spark.ml.feature.{StringIndexer, VectorAssembler, StandardScaler}
import org.apache.spark.ml.classification.RandomForestClassifier
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator

/**
 * ============================================================================
 * SPARK SQL & MLLIB: DISTRIBUTED BATCH ANALYTICS & MACHINE LEARNING
 * ============================================================================
 * Demonstrates:
 * 1. Spark SQL Window Functions (lag, lead, dense_rank) for time-series athlete analysis
 * 2. Spark MLlib Pipelines: VectorAssembler, StandardScaler, RandomForestClassifier
 * 3. Feature transformation & multi-class contact evaluation
 * 4. Repeated Fault Diagnosis across historical competition attempts
 */
object SparkBatchAnalytics {

  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .appName("PoleVault-Spark-MLlib-Analytics")
      .master("local[*]")
      .getOrCreate()

    import spark.implicits._

    println("==> Spark SQL & MLlib Engine Started.")

    try {
      // 1. Load or synthesize historical attempts dataset
      val attemptsDF = Seq(
        (1, "ATHLETE_01", "2026-10-01 14:05:00", false, "POLE_CONTACT", 2.21, "CENTER", 3.8, 185.0, 480.0, 5.2),
        (2, "ATHLETE_01", "2026-10-01 14:15:00", false, "POLE_CONTACT", 2.15, "CENTER", 3.2, 160.0, 510.0, 4.8),
        (3, "ATHLETE_01", "2026-10-01 14:25:00", true,  "NO_CONTACT",   2.25, "CENTER", 0.05, 12.0, 42.0, 0.2),
        (4, "ATHLETE_02", "2026-10-01 14:35:00", false, "BODY_CONTACT", 1.45, "LEFT",   1.9, 210.0, 58.0, 6.1),
        (5, "ATHLETE_02", "2026-10-01 14:45:00", false, "BODY_CONTACT", 1.52, "LEFT",   2.1, 230.0, 62.0, 6.5),
        (6, "ATHLETE_02", "2026-10-01 14:55:00", true,  "NO_CONTACT",   2.25, "CENTER", 0.08, 15.0, 40.0, 0.3)
      ).toDF(
        "attempt_id", "athlete_id", "timestamp", "is_success", "contact_type",
        "estimated_x_m", "location", "piezo_peak_v", "strain_peak_ue", "dom_freq_hz", "impact_duration_ms"
      )

      println("==> Historical Attempts Dataset:")
      attemptsDF.show(truncate = false)

      // 2. SPARK SQL WINDOW FUNCTIONS: Detect Repeated Knockdowns per Athlete
      // Window specification partitioned by athlete and ordered by timestamp
      val athleteWindow = Window
        .partitionBy("athlete_id")
        .orderBy("timestamp")

      val enrichedAttempts = attemptsDF
        .withColumn("attempt_seq", row_number().over(athleteWindow))
        .withColumn("prev_contact_type", lag("contact_type", 1).over(athleteWindow))
        .withColumn("prev_location", lag("location", 1).over(athleteWindow))
        .withColumn(
          "repeated_fault_warning",
          when(
            col("contact_type") =!= "NO_CONTACT" &&
            col("contact_type") === col("prev_contact_type") &&
            col("location") === col("prev_location"),
            concat(lit("Repeated "), col("contact_type"), lit(" at "), col("location"))
          ).otherwise(lit("None"))
        )

      println("==> Athlete Biomechanical Progression with Window Analysis:")
      enrichedAttempts
        .select("athlete_id", "attempt_seq", "is_success", "contact_type", "location", "repeated_fault_warning")
        .show(truncate = false)

      // 3. SPARK MLLIB PIPELINE: Random Forest Multimodal Classifier
      // Feature vector assembly: 4 physical sensor metrics
      val assembler = new VectorAssembler()
        .setInputCols(Array("piezo_peak_v", "strain_peak_ue", "dom_freq_hz", "impact_duration_ms"))
        .setOutputCol("raw_features")

      // Standardize feature scales across millivolts, microstrains, and hertz
      val scaler = new StandardScaler()
        .setInputCol("raw_features")
        .setOutputCol("features")
        .setWithStd(true)
        .setWithMean(false)

      // Label indexer: String contact_type -> Numeric label index
      val labelIndexer = new StringIndexer()
        .setInputCol("contact_type")
        .setOutputCol("label")

      // Random Forest Classifier with 20 decision trees
      val rf = new RandomForestClassifier()
        .setLabelCol("label")
        .setFeaturesCol("features")
        .setNumTrees(20)
        .setMaxDepth(5)
        .setSeed(42L)

      // Assemble into Spark MLlib Pipeline
      val pipeline = new Pipeline()
        .setStages(Array(labelIndexer, assembler, scaler, rf))

      val model = pipeline.fit(attemptsDF)
      val predictions = model.transform(attemptsDF)

      println("==> Spark MLlib Random Forest Model Predictions:")
      predictions
        .select("attempt_id", "contact_type", "prediction", "probability")
        .show(truncate = false)

      // Multi-class accuracy evaluator
      val evaluator = new MulticlassClassificationEvaluator()
        .setLabelCol("label")
        .setPredictionCol("prediction")
        .setMetricName("accuracy")

      val accuracy = evaluator.evaluate(predictions)
      println(f"==> Spark MLlib Training Accuracy: ${accuracy * 100.0}%.1f%%")

    } finally {
      spark.stop()
      println("==> Spark Session stopped.")
    }
  }
}
