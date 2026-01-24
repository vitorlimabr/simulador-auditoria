import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PersistenceService {
    private readonly STORAGE_KEY = 'audit_sim_data';

    saveData(data: any) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    }

    loadData(): any {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing localStorage data', e);
                return null;
            }
        }
        return null;
    }

    exportToJSON(data: any, fileName: string = 'audit-backup.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    async importFromJSON(file: File): Promise<any> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (err) {
                    reject('Formato de arquivo inválido.');
                }
            };
            reader.onerror = () => reject('Erro ao ler o arquivo.');
            reader.readAsText(file);
        });
    }
}
