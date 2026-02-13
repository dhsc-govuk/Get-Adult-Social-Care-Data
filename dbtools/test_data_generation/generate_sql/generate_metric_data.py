
queries = []

for l in open('data/metric_groups.csv'):
    query = f'''select mg.code, me.code, me.frequency, sq.string_agg, sq.min, sq.max
        from public.metric_groups as mg
        join public.metrics as me on me.metric_group_fk = mg.id
        join (select metric_fk, string_agg(distinct location_type, '-'), min(latest_value), max(latest_value) from public.{l.strip()} group by metric_fk) as sq
            on sq.metric_fk = me.id'''
    queries.append(query)

print('\nunion\n'.join(queries))
