using api.Data.Models.Metrics;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using System.Reflection;

namespace api.Data
{
    public static partial class CustomExtensions
    {
        static readonly MethodInfo SetMethod = typeof(DbContext).GetMethod(nameof(DbContext.Set), Type.EmptyTypes)!;

        public static IQueryable<MetricTimeSeries> MetricTimeSeriesQueryable(this DbContext context, Type entityType) =>
            (IQueryable<MetricTimeSeries>)SetMethod.MakeGenericMethod(entityType).Invoke(context, null)!;
    }
}