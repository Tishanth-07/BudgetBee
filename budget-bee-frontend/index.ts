import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Register third-party components with NativeWind before any React components are loaded or evaluated.
// This prevents the "Couldn't find a navigation context" crash that happens when NativeWind tries to warn about unregistered components.
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

import 'expo-router/entry';
