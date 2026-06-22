import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { uploadReceiptImage } from '@/services/exportService';
import { createReceipt, pollReceiptStatus } from '@/services/receiptService';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Reading your receipt...');
  const [flash, setFlash] = useState(false);
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setIsProcessing(true);
    setProcessingMessage('Reading your receipt...');

    try {
      // 1. Take photo
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo) throw new Error('Failed to capture photo');

      // 2. Upload image
      setProcessingMessage('Uploading image...');
      const { imageUrl, imagePublicId } = await uploadReceiptImage(photo.uri);

      // 3. Create receipt record
      setProcessingMessage('Analysing receipt...');
      const receipt = await createReceipt(imageUrl, imagePublicId);

      // 4. Poll until not pending
      pollReceiptStatus(receipt.id, (done) => {
        router.replace(`/receipt/${done.id}`);
      });
    } catch (err: any) {
      setIsProcessing(false);
      Alert.alert('Scan failed', err.message ?? 'Please try again.');
    }
  };

  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.processingTitle}>{processingMessage}</Text>
        <Text style={styles.processingSubtitle}>This usually takes a few seconds</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="back"
        enableTorch={flash}
        ref={cameraRef}
      >
        <View style={styles.overlayTop} />
        
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

        <View style={styles.bottomSheet}>
          <Text style={styles.instruction}>Point your camera at a receipt</Text>
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="images-outline" size={28} color={Colors.card} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => setFlash(!flash)}>
              <Ionicons name={flash ? "flash" : "flash-off"} size={28} color={Colors.card} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.double, backgroundColor: Colors.background },
  message: { textAlign: 'center', paddingBottom: 10, fontFamily: Fonts.regular, fontSize: 16, color: Colors.textPrimary },
  button: { backgroundColor: Colors.primary, padding: Spacing.base, borderRadius: 8 },
  buttonText: { color: Colors.card, fontFamily: Fonts.bold },
  
  camera: { flex: 1 },
  overlayTop: { height: '15%', backgroundColor: 'rgba(0,0,0,0.5)' },
  scanAreaContainer: { flex: 1, flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  scanArea: { width: '80%', height: '100%', backgroundColor: 'transparent', position: 'relative' },
  
  corner: { position: 'absolute', width: 40, height: 40, borderColor: Colors.accent },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },

  bottomSheet: { height: '25%', backgroundColor: 'rgba(0,0,0,0.8)', paddingVertical: Spacing.double, alignItems: 'center', justifyContent: 'space-between' },
  instruction: { color: Colors.card, fontFamily: Fonts.medium, fontSize: 16 },
  controlsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: Spacing.double },
  iconButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: Colors.primary },
  
  processingContainer: { flex: 1, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  processingTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.card, marginTop: Spacing.double, marginBottom: Spacing.half },
  processingSubtitle: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.card, opacity: 0.8 },
});
