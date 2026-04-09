import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {AppNavigator} from './src';
import {hydrateCartFromStorage, subscribeCartPersistence} from './src/redux/persistence';
import {store} from './src/redux/store';

function AppContent() {
  useEffect(() => {
    hydrateCartFromStorage(store.dispatch);
    const unsubscribe = subscribeCartPersistence();
    return unsubscribe;
  }, []);

  return <AppNavigator />;
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
