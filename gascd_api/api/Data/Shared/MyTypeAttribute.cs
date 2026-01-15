namespace api.Data.Shared;

[AttributeUsage(AttributeTargets.Field)]
public class MyTypeAttribute : Attribute
{
    public Type MyType { get; }

    public MyTypeAttribute(Type type)
    {
        MyType = type;
    }
}