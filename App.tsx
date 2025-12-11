import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ScheduleScreen from './screens/schedule/ScheduleScreen';
import OpenShiftScreen from './screens/shift/OpenShiftScreen';
import TeamEditScreen from './screens/shift/TeamEditScreen';
import WorksListScreen from './screens/works/WorksListScreen';
import WorkDetailScreen from './screens/works/WorkDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import APRChecklistScreen from './screens/checklists/APRChecklistScreen';
import IndividualChecklistScreen from './screens/checklists/IndividualChecklistScreen';


const AppRouter: React.FC = () => {
    const { user, currentView, currentWorkId, currentMemberId } = useApp();

    if (!user) {
        return <LoginScreen />;
    }

    switch (currentView) {
        case 'home':
            return <HomeScreen />;
        case 'schedule':
            return <ScheduleScreen />;
        case 'open_shift':
            return <OpenShiftScreen />;
        case 'team_edit':
            return <TeamEditScreen />;
        case 'works_list':
            return <WorksListScreen />;
        case 'work_detail':
            return <WorkDetailScreen workId={currentWorkId} />;
        case 'profile':
            return <ProfileScreen />;
        case 'apr_checklist':
            return <APRChecklistScreen />;
        case 'individual_checklist':
            return <IndividualChecklistScreen memberId={currentMemberId} />;
        default:
            return <HomeScreen />;
    }
};

const AppContent: React.FC = () => {
    const { theme } = useApp();

    return (
        <div className={`h-screen w-screen ${theme}`}>
            <AppRouter />
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;