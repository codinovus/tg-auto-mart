import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTransactionDto, GetAllTransactionsResponseDto, GetTransactionByIdResponseDto, TransactionResponseDto, UpdateTransactionDto } from '../../pages/transaction/model/transaction.dto';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private readonly apiUrl = `${environment.apiBaseUrl}/transactions`;

    constructor(private http: HttpClient) {}

    /**
     * Create a new transaction
     * @param createTransactionDto Transaction creation data
     */
    createTransaction(createTransactionDto: CreateTransactionDto): Observable<{
        success: boolean;
        message: string;
        data: TransactionResponseDto;
    }> {
        return this.http.post<{
            success: boolean;
            message: string;
            data: TransactionResponseDto;
        }>(this.apiUrl, createTransactionDto);
    }

    /**
     * Get all transactions with pagination
     * @param page Page number (default: 1)
     * @param limit Number of items per page (default: 10)
     */
    getAllTransactions(page: number = 1, limit: number = 10, search?: string): Observable<GetAllTransactionsResponseDto> {
        let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

        if (search && search.trim() !== '') {
            params = params.set('search', search.trim());
        }

        return this.http.get<GetAllTransactionsResponseDto>(this.apiUrl, { params });
    }
    /**
     * Get transaction by ID
     * @param transactionId Transaction ID
     */
    getTransactionById(transactionId: string): Observable<GetTransactionByIdResponseDto> {
        return this.http.get<GetTransactionByIdResponseDto>(`${this.apiUrl}/${transactionId}`);
    }

    /**
     * Update transaction information
     * @param transactionId Transaction ID
     * @param updateTransactionDto Transaction data to update
     */
    updateTransactionById(transactionId: string, updateTransactionDto: UpdateTransactionDto): Observable<TransactionResponseDto> {
        return this.http.put<TransactionResponseDto>(`${this.apiUrl}/${transactionId}`, updateTransactionDto);
    }

    /**
     * Delete a transaction
     * @param transactionId Transaction ID
     */
    deleteTransactionById(transactionId: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${transactionId}`);
    }
}
