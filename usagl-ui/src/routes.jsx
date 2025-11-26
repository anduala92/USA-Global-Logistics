import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';
import { Customers } from './screens/Customers';
import { Orders } from './screens/Orders';
import { Locations } from './screens/Locations';
import { VehicleModels } from './screens/VehicleModels';
import { Shipments } from './screens/Shipments';
import { ShipmentDetail } from './screens/ShipmentDetail';
import { Vehicles } from './screens/Vehicles';
import { Drivers } from './screens/Drivers';
import { Carriers } from './screens/Carriers';
import { Login } from './screens/Login';
import { Register } from './screens/Register';
import { RequireAuth } from './auth/RequireAuth';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'customers', element: <Customers /> },
          { path: 'orders', element: <Orders /> },
          { path: 'locations', element: <Locations /> },
          { path: 'vehicle-models', element: <VehicleModels /> },
          { path: 'shipments', element: <Shipments /> },
          { path: 'shipments/:id', element: <ShipmentDetail /> },
          { path: 'vehicles', element: <Vehicles /> },
          { path: 'drivers', element: <Drivers /> },
          { path: 'carriers', element: <Carriers /> },
        ],
      },
    ],
  },
]);
