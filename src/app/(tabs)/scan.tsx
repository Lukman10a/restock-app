import { Colors, Fonts, Spacing } from "@/constants/theme";
import { uploadReceiptImage } from "@/services/exportService";
import { createReceipt, pollReceiptStatus } from "@/services/receiptService";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState(
    "Reading your receipt...",
  );
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [flash, setFlash] = useState(false);
  const router = useRouter();
  // const cameraRef = useRef<CameraView>(null);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── shared processing logic after we have a local image URI ───────────────
  const processImageUri = async (uri: string) => {
    try {
      // 1. Upload image to Cloudinary
      setProcessingMessage("Uploading image...");
      const { imageUrl, imagePublicId } = await uploadReceiptImage(uri);

      // 2. Create receipt record — triggers OCR in background
      setProcessingMessage("Analysing receipt...");

      const receipt = await createReceipt(imageUrl, imagePublicId);

      const receiptId = receipt.id || receipt._id;

      console.log("Receipt ID:", receiptId);

      // await pollReceiptStatus(receiptId, ...)

      // 3. Poll until OCR finishes
      setProcessingMessage("Reading your receipt...");

      pollReceiptStatus(receiptId!, (done) => {
        setIsProcessing(false);
        router.push(`/receipt/${done._id || done.id}`);
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      console.error("PROCESS ERROR:", err);
      setIsProcessing(false);
      Alert.alert("Scan failed", message);
    }
  };

  const handleCapture = async () => {
    console.log("===== CAPTURE STARTED =====");

    if (!cameraRef.current) {
      console.log("cameraRef is null");
      Alert.alert("Error", "Camera not available");
      return;
    }

    if (!isCameraReady) {
      console.log("Camera not ready");
      Alert.alert("Error", "Camera still initializing");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Capturing image...");

    try {
      console.log("Taking picture...");

      // const photo = await cameraRef.current.takePictureAsync({
      //   quality: 0.8,
      //   skipProcessing: true,
      // });

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      console.log("PHOTO:", photo);

      console.log("PHOTO RESULT:", photo);

      if (!photo?.uri) {
        throw new Error("Photo URI missing");
      }

      console.log("Photo URI:", photo.uri);

      await processImageUri(photo.uri);
    } catch (err) {
      console.error("CAPTURE ERROR:", err);

      setIsProcessing(false);

      Alert.alert(
        "Scan failed",
        err instanceof Error ? err.message : "Failed to capture image",
      );
    }
  };

  // ─── Gallery picker ─────────────────────────────────────────────────────────
  const handleGalleryPick = async () => {
    // request permission if not granted yet
    if (!mediaPermission?.granted) {
      const { granted } = await requestMediaPermission();
      if (!granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your photo library to upload receipts.",
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes: ImagePicker.MediaTypeOptions.Images,
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return; // user cancelled — do nothing
    }

    setIsProcessing(true);
    setProcessingMessage("Uploading image...");
    await processImageUri(result.assets[0].uri);
  };

  // ─── Processing screen ───────────────────────────────────────────────────────
  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.processingTitle}>{processingMessage}</Text>
        <Text style={styles.processingSubtitle}>
          This usually takes a few seconds
        </Text>
      </View>
    );
  }

  // ─── Camera screen ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Live camera feed */}
      {/* <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flash}
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      /> */}

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash ? "on" : "off"}
        onCameraReady={() => {
          console.log("Camera ready");
          setIsCameraReady(true);
        }}
      />

      {/* Overlay UI on top of camera */}
      <View style={styles.overlayContainer}>
        {/* Top dark bar */}
        <View style={styles.overlayTop} />

        {/* Middle row: side overlays + scan area */}
        <View style={styles.scanAreaContainer}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.overlaySide} />
        </View>

        {/* Bottom sheet */}
        <View style={styles.bottomSheet}>
          <Text style={styles.instruction}>Point your camera at a receipt</Text>

          <View style={styles.controlsRow}>
            {/* Gallery button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleGalleryPick}
            >
              <Ionicons name="images-outline" size={28} color={Colors.card} />
            </TouchableOpacity>

            {/* Capture button */}
            <TouchableOpacity
              style={[
                styles.captureButton,
                !isCameraReady && styles.captureButtonDisabled,
              ]}
              onPress={handleCapture}
              disabled={!isCameraReady}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>

            {/* Flash toggle */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setFlash((prev) => !prev)}
            >
              <Ionicons
                name={flash ? "flash" : "flash-off"}
                size={28}
                color={Colors.card}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.double,
    backgroundColor: Colors.background,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.base,
    borderRadius: 8,
  },
  buttonText: { color: Colors.card, fontFamily: Fonts.bold },

  overlayContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
  },
  overlayTop: { height: "15%", backgroundColor: "rgba(0,0,0,0.55)" },

  scanAreaContainer: { flex: 1, flexDirection: "row" },
  overlaySide: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  scanArea: {
    width: "75%",
    backgroundColor: "transparent",
    position: "relative",
  },

  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: Colors.accent,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },

  bottomSheet: {
    height: "25%",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingVertical: Spacing.double,
    alignItems: "center",
    justifyContent: "space-between",
  },
  instruction: {
    color: Colors.card,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  controlsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: Spacing.double,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonDisabled: {
    opacity: 0.4,
  },
  captureInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  processingContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.double,
  },
  processingTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.card,
    marginTop: Spacing.double,
    marginBottom: Spacing.half,
    textAlign: "center",
  },
  processingSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.card,
    opacity: 0.8,
    textAlign: "center",
  },
});
