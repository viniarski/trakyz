declare module 'js-xlsx' {
    export function read(data: any, opts?: any): any;
    export namespace utils {
      export function sheet_to_json(worksheet: any, opts?: any): any[];
    }
    export interface WorkBook {
      SheetNames: string[];
      Sheets: {
        [sheet: string]: any;
      };
    }
  }