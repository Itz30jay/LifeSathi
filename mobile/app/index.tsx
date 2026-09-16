import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../src/theme';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.indigo} />
      </View>
    );
  }

  return <Redirect href={isSignedIn ? '/(app)' : '/sign-in'} />;
}

const styles = {
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand } as const,
};
