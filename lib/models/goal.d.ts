import { Workspace } from 'lib/models/clockify'

export interface Goal {
    active: boolean;
    workspaces: Workspace[];
}
