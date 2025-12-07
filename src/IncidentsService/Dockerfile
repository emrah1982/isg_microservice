# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project files
COPY ["src/IncidentsService/IncidentsService.csproj", "src/IncidentsService/"]
COPY ["src/Shared/Shared.csproj", "src/Shared/"]

# Restore dependencies
RUN dotnet restore "src/IncidentsService/IncidentsService.csproj"

# Copy only necessary source code (avoid bin/obj)
COPY src/IncidentsService/ src/IncidentsService/
COPY src/Shared/ src/Shared/

# Build the application
WORKDIR "/app/src/IncidentsService"
RUN dotnet build "IncidentsService.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "IncidentsService.csproj" -c Release -o /app/publish

# Use the official .NET 8 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the published application
COPY --from=publish /app/publish .

# Expose port
EXPOSE 8083

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8083
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8083/api/incidents || exit 1

# Start the application
ENTRYPOINT ["dotnet", "IncidentsService.dll"]
