import { Enum } from 'typescript-string-enums';
export declare const TrafficLightState: {
    red: "red";
    yellow: "yellow";
    green: "green";
};
export declare type TrafficLightState = Enum<typeof TrafficLightState>;
export declare const TrafficFlow: {
    NS: "NS";
    EW: "EW";
};
export declare type TrafficFlow = Enum<typeof TrafficFlow>;
export interface State {
    proceedingTrafficFlow: TrafficFlow | null;
    isChangeImminent: boolean;
}
