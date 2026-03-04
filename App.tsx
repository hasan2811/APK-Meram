import { StatusBar } from 'expo-status-bar';
import AppWebView from './components/AppWebView';

export default function App() {
  return (
    <>
      <AppWebView />
      <StatusBar style="auto" />
    </>
  );
}
