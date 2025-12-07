# Use .NET 8 SDK for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project files
COPY ["src/VisionService/VisionService.csproj", "src/VisionService/"]
COPY ["src/Shared/Shared.csproj", "src/Shared/"]

# Restore
RUN dotnet restore "src/VisionService/VisionService.csproj"

# Copy source
COPY . .

# Build
WORKDIR /app/src/VisionService
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .

EXPOSE 8086
ENV ASPNETCORE_URLS=http://+:8086
ENV ASPNETCORE_ENVIRONMENT=Production

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:8086/api/vision/health || exit 1

ENTRYPOINT ["dotnet", "VisionService.dll"]
