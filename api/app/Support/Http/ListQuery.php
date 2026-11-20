<?php

namespace App\Support\Http;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Shared list query handling for admin and public endpoints:
 * ?search=&sort=<key>|-<key>&page=&per_page=
 * Sort keys are whitelisted per endpoint, so user input never reaches SQL as a column name.
 */
final class ListQuery
{
    public function __construct(
        public readonly ?string $search,
        public readonly string $sortColumn,
        public readonly string $sortDirection,
        public readonly int $perPage,
    ) {}

    /**
     * @param  array<string, string>  $sortable  public key => column
     */
    public static function from(Request $request, array $sortable, string $defaultSort, int $defaultPerPage = 10, int $maxPerPage = 100): self
    {
        $sort = (string) $request->query('sort', $defaultSort);
        $key = ltrim($sort, '-');
        if (! isset($sortable[$key])) {
            $sort = $defaultSort;
            $key = ltrim($sort, '-');
        }

        $search = trim((string) $request->query('search', $request->query('q', '')));

        return new self(
            search: $search !== '' ? mb_substr($search, 0, 100) : null,
            sortColumn: $sortable[$key],
            sortDirection: str_starts_with($sort, '-') ? 'desc' : 'asc',
            perPage: max(1, min($maxPerPage, (int) $request->query('per_page', $defaultPerPage))),
        );
    }

    /**
     * Apply a LIKE search over the given columns (values are bound, never interpolated).
     *
     * @param  list<string>  $columns
     */
    public function search(Builder $query, array $columns): Builder
    {
        if ($this->search === null) {
            return $query;
        }
        $term = '%'.addcslashes($this->search, '%_\\').'%';

        return $query->where(function (Builder $q) use ($columns, $term) {
            foreach ($columns as $column) {
                $q->orWhere($column, 'like', $term);
            }
        });
    }

    public function paginate(Builder $query): LengthAwarePaginator
    {
        return $query->orderBy($this->sortColumn, $this->sortDirection)->orderBy($query->getModel()->getQualifiedKeyName(), $this->sortDirection)->paginate($this->perPage);
    }
}
