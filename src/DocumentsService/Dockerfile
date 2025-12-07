# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project files
COPY ["src/DocumentsService/DocumentsService.csproj", "src/DocumentsService/"]
COPY ["src/Shared/Shared.csproj", "src/Shared/"]

# Restore dependencies
RUN dotnet restore "src/DocumentsService/DocumentsService.csproj"

# Copy only necessary source code (avoid bin/obj)
COPY src/DocumentsService/ src/DocumentsService/
COPY src/Shared/ src/Shared/

# Build the application
WORKDIR "/app/src/DocumentsService"
RUN dotnet build "DocumentsService.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "DocumentsService.csproj" -c Release -o /app/publish

# Use the official .NET 8 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the published application
COPY --from=publish /app/publish .

# Expose port
EXPOSE 8084

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8084
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8084/api/documents || exit 1

# Start the application
ENTRYPOINT ["dotnet", "DocumentsService.dll"]
