# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project files
COPY ["src/TrainingsService/TrainingsService.csproj", "src/TrainingsService/"]
COPY ["src/Shared/Shared.csproj", "src/Shared/"]

# Restore dependencies
RUN dotnet restore "src/TrainingsService/TrainingsService.csproj"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/app/src/TrainingsService"
RUN dotnet build "TrainingsService.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "TrainingsService.csproj" -c Release -o /app/publish

# Use the official .NET 8 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the published application
COPY --from=publish /app/publish .

# Expose port
EXPOSE 8081

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8081
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/api/trainings || exit 1

# Start the application
ENTRYPOINT ["dotnet", "TrainingsService.dll"]
