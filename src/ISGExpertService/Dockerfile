FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8091

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ISGExpertService.csproj", "."]
RUN dotnet restore "./ISGExpertService.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "ISGExpertService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ISGExpertService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "ISGExpertService.dll"]
