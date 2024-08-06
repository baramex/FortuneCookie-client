import { defineTask } from "expo-task-manager";

defineTask("TASK_FETCH_LOCATION", ({ data: { locations }, error }) => {
    if (error) {
        console.log(error);
        return;
    }
    console.log('Received new locations', locations);
});