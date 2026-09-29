package com.essenza.app

import ai.onnxruntime.OnnxTensor
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import java.nio.FloatBuffer
import java.security.MessageDigest
import java.util.concurrent.Executors

private data class ModelEntry(
  val filename: String,
  val sha256: String,
  val inputName: String,
  val outputName: String,
  val positiveIndex: Int,
)

class EssenzaOnnxModule(private val context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {
  private val worker = Executors.newSingleThreadExecutor()

  override fun getName(): String = "EssenzaOnnxV7"

  @ReactMethod
  fun predict(features: ReadableArray, models: ReadableArray, promise: Promise) {
    val values: FloatArray
    val entries: List<ModelEntry>
    try {
      require(features.size() == 2056) { "Expected 2056 v7 features" }
      require(models.size() == 109) { "Expected 109 v7 models" }
      values = FloatArray(features.size()) { index -> features.getDouble(index).toFloat() }
      require(values.all { it.isFinite() }) { "Features must be finite" }
      entries = List(models.size()) { index ->
        val item = requireNotNull(models.getMap(index))
        ModelEntry(
          filename = requireNotNull(item.getString("filename")),
          sha256 = requireNotNull(item.getString("sha256")),
          inputName = requireNotNull(item.getString("input_name")),
          outputName = requireNotNull(item.getString("probability_output")),
          positiveIndex = item.getInt("positive_index"),
        )
      }
      require(entries.map { it.filename }.toSet().size == 109) { "Duplicate ONNX model" }
    } catch (error: Exception) {
      promise.reject("INVALID_INPUT", error.message, error)
      return
    }

    worker.execute {
      try {
        val environment = OrtEnvironment.getEnvironment()
        val scores = Arguments.createArray()
        OrtSession.SessionOptions().use { options ->
          options.setIntraOpNumThreads(1)
          options.setInterOpNumThreads(1)
          OnnxTensor.createTensor(environment, FloatBuffer.wrap(values), longArrayOf(1, 2056)).use { tensor ->
            for (entry in entries) {
              require(Regex("lgbm_\\d{3}\\.onnx").matches(entry.filename)) { "Invalid model filename" }
              require(entry.positiveIndex == 1) { "Invalid positive class index" }
              val bytes = context.assets.open("models/v7/${entry.filename}").use { it.readBytes() }
              val checksum = MessageDigest.getInstance("SHA-256").digest(bytes)
                .joinToString("") { "%02x".format(it.toInt() and 0xff) }
              require(checksum == entry.sha256) { "Model asset checksum mismatch: ${entry.filename}" }
              environment.createSession(bytes, options).use { session ->
                require(session.inputNames.contains(entry.inputName)) { "Unexpected ONNX input" }
                require(session.outputNames.contains(entry.outputName)) { "Unexpected ONNX output" }
                session.run(mapOf(entry.inputName to tensor)).use { output ->
                  val value = output.get(entry.outputName).orElseThrow {
                    IllegalStateException("Missing ONNX probability output")
                  }
                  val buffer = (value as OnnxTensor).floatBuffer
                  require(buffer.remaining() == 2) { "Expected two class scores" }
                  val score = buffer.get(entry.positiveIndex)
                  require(score.isFinite() && score >= 0f && score <= 1f) { "Invalid ONNX score" }
                  scores.pushDouble(score.toDouble())
                }
              }
            }
          }
        }
        promise.resolve(scores)
      } catch (error: Exception) {
        promise.reject("MODEL_ERROR", error.message ?: "ONNX inference failed", error)
      }
    }
  }

  override fun invalidate() {
    worker.shutdownNow()
    super.invalidate()
  }
}
