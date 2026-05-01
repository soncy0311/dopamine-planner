import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const WEBVIEW_URL = process.env.EXPO_PUBLIC_WEBVIEW_URL || 'http://localhost:3000';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <WebView source={{ uri: WEBVIEW_URL }} style={styles.webview} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
