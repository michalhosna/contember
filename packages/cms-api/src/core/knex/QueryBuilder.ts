import * as Knex from 'knex'
import ConditionBuilder from './ConditionBuilder'
import { Formatter, Value } from './types'
import KnexWrapper from './KnexWrapper'

type AffectedRows = number
type Returning = number | string

class QueryBuilder<R = { [columnName: string]: any }[]> {
	constructor(public readonly wrapper: KnexWrapper, public readonly qb: Knex.QueryBuilder) {}

	public formatter(): Formatter {
		return this.wrapper.formatter(this.qb)
	}

	public with(alias: string, callback: QueryBuilder.Callback): void {
		this.qb.with(alias, qb => callback(new QueryBuilder(this.wrapper, qb)))
	}

	public from(tableName: string, alias?: string): void {
		if (alias) {
			this.qb.from(`${tableName} as ${alias}`)
		} else {
			this.qb.from(`${tableName}`)
		}
	}

	public table(tableName: string, alias?: string): void {
		this.from(tableName, alias)
	}

	public select(columnName: QueryBuilder.ColumnIdentifier, alias?: string): void {
		const columnFqn = QueryBuilder.toFqn(columnName)
		if (alias) {
			this.qb.select(`${columnFqn} as ${alias}`)
		} else {
			this.qb.select(`${columnFqn}`)
		}
	}

	public selectValue(value: Value, type: string, alias?: string): void {
		const sql = `? :: ${type}` + (alias ? ` as ${alias}` : '')
		this.qb.select(this.raw(sql, value as Value))
	}

	public where(where: { [columName: string]: Value }): void
	public where(whereCondition: QueryBuilder.WhereCallback): void
	public where(where: (QueryBuilder.WhereCallback) | { [columName: string]: Value }): void {
		if (typeof where === 'function') {
			const builder = new ConditionBuilder.ConditionStringBuilder(this)
			where(builder, this)
			const sql = builder.getSql()
			if (sql) {
				this.qb.where(sql)
			}
		} else {
			this.qb.where(where)
		}
	}

	public join(tableName: string, alias?: string, joinCondition?: (joinClause: ConditionBuilder) => void): void {
		this.qb.join(...this.buildJoinArguments(tableName, alias, joinCondition))
	}

	public leftJoin(tableName: string, alias?: string, joinCondition?: (joinClause: ConditionBuilder) => void): void {
		this.qb.leftJoin(...this.buildJoinArguments(tableName, alias, joinCondition))
	}

	public raw(sql: string, ...bindings: (Value | Knex.QueryBuilder)[]): Knex.Raw {
		return this.wrapper.raw(sql, ...bindings)
	}

	public async getResult(): Promise<R> {
		return await this.qb
	}

	public async delete(): Promise<number> {
		return await this.qb.delete()
	}

	public async insert(data: { [column: string]: Value }): Promise<number>
	public async insert(data: { [column: string]: Value }, returning: string): Promise<Returning[]>
	public async insert(data: { [column: string]: Value }, returning?: string): Promise<AffectedRows | Returning[]> {
		return await this.qb.insert(data, returning)
	}

	public async insertFrom(
		tableName: string,
		columns: { [columnName: string]: QueryBuilder.ColumnExpression },
		callback: QueryBuilder.Callback
	): Promise<AffectedRows>
	public async insertFrom(
		tableName: string,
		columns: { [columnName: string]: QueryBuilder.ColumnExpression },
		callback: QueryBuilder.Callback,
		returning: string
	): Promise<Returning[]>
	public async insertFrom(
		tableName: string,
		columns: { [columnName: string]: QueryBuilder.ColumnExpression },
		callback: QueryBuilder.Callback,
		returning?: string
	): Promise<AffectedRows | Returning[]> {
		const columnNames = Object.keys(columns)
		this.qb.into(this.raw('?? (' + columnNames.map(() => '??').join(', ') + ')', tableName, ...columnNames))
		return await this.qb.insert((qb: Knex.QueryBuilder) => {
			const queryBuilder = new QueryBuilder(this.wrapper, qb)
			Object.values(columns)
				.map(
					(value): Knex.Raw => {
						if (typeof value === 'function') {
							return value(new QueryBuilder.ColumnExpressionFactory(queryBuilder))
						}
						return value
					}
				)
				.forEach(raw => queryBuilder.qb.select(raw))

			callback(queryBuilder)
		}, returning)
	}

	public async insertIgnore(data: any): Promise<AffectedRows> {
		this.qb.insert(data)
		const sql = this.qb.toString() + ' on conflict do nothing'
		return await this.wrapper.raw(sql)
	}

	public async update(data: { [column: string]: Value }): Promise<AffectedRows> {
		return await this.qb.update(data)
	}

	public async updateFrom(
		tableName: string,
		columns: QueryBuilder.ColumnExpressionMap,
		callback: QueryBuilder.Callback
	): Promise<AffectedRows> {
		const updateData = Object.entries(columns)
			.map(
				([key, value]): [string, Knex.Raw] => {
					if (typeof value === 'function') {
						return [key, value(new QueryBuilder.ColumnExpressionFactory(this))]
					}
					return [key, value]
				}
			)
			.reduce((result, [key, value]) => ({ ...result, [key]: value }), {})
		this.qb.table(tableName).update(updateData)
		const updateSql = this.qb.toSQL()
		const fromQb = this.wrapper.queryBuilder()
		callback(fromQb)
		const selectSql = fromQb.qb.toSQL()
		if (!selectSql.sql.startsWith('select *')) {
			throw new Error()
		}
		const query = this.wrapper.raw(
			updateSql.sql + ' ' + selectSql.sql.substring('select *'.length),
			...updateSql.bindings,
			...selectSql.bindings
		)
		return await query
	}

	public toString(): string {
		return this.qb.toString()
	}

	public getSql(): Knex.Raw {
		const sql = this.qb.toSQL()
		return this.wrapper.raw(sql.sql, ...sql.bindings)
	}

	private buildJoinArguments(
		tableName: string,
		alias?: string,
		joinCondition?: (joinClause: ConditionBuilder) => void
	): [string, Knex.Raw] {
		let raw: Knex.Raw | null = null
		if (joinCondition) {
			const builder = new ConditionBuilder.ConditionStringBuilder(this)
			joinCondition(builder)
			raw = builder.getSql()
		}
		if (raw === null) {
			raw = this.wrapper.raw('true')
		}
		return [`${tableName} as ${alias || tableName}`, raw as Knex.Raw]
	}
}

namespace QueryBuilder {
	export type Callback = (qb: QueryBuilder) => void
	export type WhereCallback = (whereClause: ConditionBuilder, qb: QueryBuilder<any>) => void

	type ColumnFqn = string
	type TableAliasAndColumn = [string, string]
	export type ColumnIdentifier = ColumnFqn | TableAliasAndColumn
	export type ColumnExpression = Knex.Raw | ((expressionFactory: QueryBuilder.ColumnExpressionFactory) => Knex.Raw)
	export type ColumnExpressionMap = { [columnName: string]: QueryBuilder.ColumnExpression }

	export function toFqn(columnName: ColumnIdentifier): string {
		if (typeof columnName === 'string') {
			return columnName
		}
		return `${columnName[0]}.${columnName[1]}`
	}

	export class ColumnExpressionFactory {
		constructor(private readonly qb: QueryBuilder<any>) {}

		public select(columnName: QueryBuilder.ColumnIdentifier): Knex.Raw {
			const columnFqn = QueryBuilder.toFqn(columnName)
			return this.qb.raw('??', columnFqn)
		}

		public selectValue(value: Value, type?: string): Knex.Raw {
			const sql = '?' + (type ? ` :: ${type}` : '')
			return this.qb.raw('?', value)
		}

		public raw(sql: string, ...bindings: (Value | Knex.QueryBuilder)[]): Knex.Raw {
			return this.qb.raw(sql, ...bindings)
		}
	}
}

export default QueryBuilder
