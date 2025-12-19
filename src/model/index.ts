import { FileStat } from '../enum';
import { Uri } from 'vscode';

export interface Item {
    filePath: string;
    stat: FileStat;
    uri?: Uri;
    name?: string;
}

export interface ItemInSettingsJson {
    filePath:string;
    name?: string;
}