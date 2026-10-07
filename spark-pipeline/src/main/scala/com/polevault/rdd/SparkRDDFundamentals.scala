package com.polevault.rdd

import org.apache.spark.{Partitioner, SparkConf, SparkContext}
import org.apache.spark.rdd.RDD
import com.polevault.models.{RawSensorSample, SpatialZone}

/**
 * ============================================================================
 * SPARK RDD FUNDAMENTALS: LOW-LEVEL DISTRIBUTED PROCESSING
 * ============================================================================
 * Demonstrates essential Apache Spark core concepts:
 * 1. Resilient Distributed Datasets (RDDs) - Partitioned, immutable collections
 * 2. Transformations (Lazy evaluation, DAG creation) vs Actions (Execution triggers)
 * 3. Narrow dependencies (map, filter) vs Wide dependencies (reduceByKey, groupByKey)
 * 4. Broadcast Variables (efficient read-only reference data across executors)
 * 5. Accumulators (distributed distributed write counters)
 * 6. Custom Partitioning by Crossbar Sector (Left, Center, Right)
 * 7. Key-Value Pair RDD operations (aggregateByKey, reduceByKey)
 */
object SparkRDDFundamentals {

  // Custom Partitioner to route sensor calculations by 3 physical crossbar zones
  class CrossbarZonePartitioner(numPartitions: Int) extends Partitioner {
    override def numPartitions: Int = numPartitions

    override def getPartition(key: Any): Int = key match {
      case zone: SpatialZone => zone match {
        case SpatialZone.LeftZone   => 0 % numPartitions
        case SpatialZone.CenterZone => 1 % numPartitions
        case SpatialZone.RightZone  => 2 % numPartitions
      }
      case _ => 0
    }
  }

  def main(args: Array[String]): Unit = {
    // 1. Initializing Spark Context
    val conf = new SparkConf()
      .setAppName("PoleVault-Spark-RDD-Fundamentals")
      .setMaster("local[*]")
      .set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")

    val sc = new SparkContext(conf)
    println(s"==> Initialized Spark Core Context: App ID = ${sc.applicationId}")

    try {
      // 2. BROADCAST VARIABLE: Crossbar physical sensor coordinates (shared to all worker nodes)
      val sensorCoordinates = Map(
        "P1"  -> 1.125, // meters
        "SG1" -> 1.650,
        "P2"  -> 2.250,
        "SG2" -> 2.850,
        "P3"  -> 3.375
      )
      val broadcastCoords = sc.broadcast(sensorCoordinates)

      // 3. ACCUMULATOR: Distributed counter for high-voltage impact events (> 2.0V)
      val highImpactAcc = sc.longAccumulator("HighVoltageImpactCounter")

      // 4. CREATING AN RDD: From text file or parallel collection (lazy evaluation)
      val rawLines: RDD[String] = sc.parallelize(Seq(
        "2026-10-01 10:00:00.100,1,0.05,12.0,0.08,10.5,0.04,0.1,0.2,9.81,0.5,0.2,0.1",
        "2026-10-01 10:00:00.200,2,3.45,210.0,0.92,45.0,0.12,4.8,2.1,14.5,45.0,22.0,15.2",
        "2026-10-01 10:00:00.300,3,1.85,150.0,3.88,185.0,0.45,3.2,1.8,12.1,38.0,18.0,12.0",
        "2026-10-01 10:00:00.400,4,0.15,22.0,0.42,32.0,2.95,2.1,1.1,10.5,18.0,12.0,8.5",
        "2026-10-01 10:00:00.500,5,0.02,8.0,0.03,7.5,0.03,0.1,0.1,9.80,0.2,0.1,0.1"
      ), numSlices = 3)

      // 5. NARROW TRANSFORMATION: map & filter (pipelined inside partition memory)
      val parsedSamples: RDD[RawSensorSample] = rawLines
        .flatMap(RawSensorSample.parseCsvLine)
        .filter { sample =>
          // Update accumulator when impact threshold breached
          if (sample.p1 > 2.0 || sample.p2 > 2.0 || sample.p3 > 2.0) {
            highImpactAcc.add(1)
          }
          true
        }

      // 6. PAIR RDD TRANSFORMATION: keyBy physical crossbar zone
      val keyedByZone: RDD[(SpatialZone, RawSensorSample)] = parsedSamples.keyBy { sample =>
        // Determine predominant zone using the broadcast sensor positions
        val p1Weight = sample.p1
        val p2Weight = sample.p2
        val p3Weight = sample.p3
        val total = p1Weight + p2Weight + p3Weight + 1e-6
        val estimatedX = (p1Weight * broadcastCoords.value("P1") +
                          p2Weight * broadcastCoords.value("P2") +
                          p3Weight * broadcastCoords.value("P3")) / total

        SpatialZone.locateZone(estimatedX)
      }

      // 7. WIDE TRANSFORMATION: partitionBy with Custom Partitioner (causes Shuffle)
      val partitionedByZone = keyedByZone.partitionBy(new CrossbarZonePartitioner(3))

      // 8. WIDE TRANSFORMATION: aggregateByKey (calculates sum & count per zone for average strain)
      // Zero value: (sumStrain, sampleCount)
      val zeroVal = (0.0, 0L)
      val zoneStrainAverages = partitionedByZone.aggregateByKey(zeroVal)(
        // SeqOp: In-partition accumulator
        (acc, sample) => (acc._1 + (sample.sg1 + sample.sg2) / 2.0, acc._2 + 1),
        // CombOp: Merge partition accumulators across cluster
        (acc1, acc2) => (acc1._1 + acc2._1, acc1._2 + acc2._2)
      ).mapValues { case (totalStrain, count) =>
        if (count > 0) totalStrain / count else 0.0
      }

      // 9. ACTIONS (Triggers evaluation of the DAG)
      val totalCount: Long = parsedSamples.count()
      println(s"==> Total Samples Analyzed: $totalCount")
      println(s"==> High Impact Events (Accumulator): ${highImpactAcc.value}")

      val zoneResults: Array[(SpatialZone, Double)] = zoneStrainAverages.collect()
      println("==> Average Strain by Physical Crossbar Zone:")
      zoneResults.foreach { case (zone, avgStrain) =>
        println(f"    Zone ${zone.name}%-7s -> ${avgStrain}%.2f µε")
      }

    } finally {
      sc.stop()
      println("==> Spark Context cleanly shut down.")
    }
  }
}
