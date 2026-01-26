namespace api.Data.Shared;

[AttributeUsage(AttributeTargets.Field)]
public class MetricGroupAttribute(Type type) : Attribute
{
    public Type MetricGroupType { get; } = type;
}